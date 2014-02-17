/*****
 *
 *   Mouse.js
 *
 *****/

/*****
 *
 *   constructor
 *
 *****/
function Mouse(game) {
  this.game = game;
  this.x = 0;
  this.y = 0;
  this.down = false;
  this.up = false;
  var me = this;
  this.moving = false;
  this.interval = null;
  this.touches = [];

  //this.element = window;
  this.element = document.getElementById('canvas');
  
  if (Modernizr.touch) {   
    console.log('Touch supported');
    this.element.touchstart = function(e){ me.onPointerDown(e); };
    this.element.touchmove = function(e){ me.onPointerMove(e); };
    this.element.touchend = function(e){ me.onPointerUp(e); };
    this.element.touchcancel = function(e){ me.onPointerUp(e); };
    this.element.touchleave = function(e){ me.onPointerUp(e); };
  } else {   
    console.log('Touch NOT supported');
    this.element.onmousedown = function(e){ me.onPointerDown(e); };
    this.element.onmousemove = function(e){ me.onPointerMove(e); };
    this.element.onmouseup = function(e){ me.onPointerUp(e); };
    this.element.onmouseout = function(e){ me.onPointerUp(e); };
  }  
}

/*****
 *
 *   isOverBall
 *    -
 *
 *****/
Mouse.prototype.isOverBall = function(ball) {
  var r = false;
  if((this.x > 0 && this.y > 0)&&(ball.x > 0 && ball.y > 0)){
    if(((this.x >= (ball.x - ball.radius)) && (this.x <= (ball.x + ball.radius)))&&
    ((this.y >= (ball.y - ball.radius)) && (this.y <= (ball.y + ball.radius)))){
      r = true;
      if(this.game.debug){
        console.log('over '+this.x+' '+this.y);
      }
    }
  }
  return r;
};

/*****
 *
 *   isOverPiece
 *    -
 *
 *****/
Mouse.prototype.isOverPiece = function(piece) {
  var poly = new Array();
  poly[0]= new Point2D(piece.position.x, piece.position.y);
  poly[1]= new Point2D(piece.position.x+piece.img.width, piece.position.y);
  poly[2]= new Point2D(piece.position.x+piece.img.width, piece.position.y+piece.img.height);
  poly[3]= new Point2D(piece.position.x, piece.position.y+piece.img.height);
  pt = new Point2D(this.x, this.y);
  for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
      && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
      && (c = !c);

  if(this.game.debug)
    console.log('over '+piece.id+': '+c);

  return c;
};

/*****
 *
 *   isOverRect
 *    -
 *
 *****/
Mouse.prototype.isOverRect = function(p1, p2, p3, p4) {
  var poly = new Array();
  poly[0]=p1;
  poly[1]=p2;
  poly[2]=p3;
  poly[3]=p4;
  pt = new Point2D(this.x, this.y);
  for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
      && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
      && (c = !c);
  return c;
};

/*****
 *
 *   mousemove
 *
 *****/
Mouse.prototype.onPointerMove = function(e) {
  this.x = e.x/this.game.scale;
  this.y = e.y/this.game.scale;

  this.moving = true;
  interv();
  this.event = e;
  
  if(this.game.debug){
    console.log('move: '+this.x+', '+this.y);
  }

};

/*****
 *
 *   mousedown
 *
 *****/
Mouse.prototype.onPointerDown = function(e) {
  
  if(this.game.debug){
    console.log('onPointerDown');
  }

  this.x = e.x/this.game.scale;
  this.y = e.y/this.game.scale;
  
  this.down = true;
  this.up = false;
  this.event = e;
  
  //select
  if(this.game.over){
    this.game.selected = this.game.over;
  }
  //test
  var over = false;
  if(this.game.debug)
    console.log(this.game.puzzle.pieces.length);

  for(var i = 0; i < this.game.puzzle.pieces.length; i++){
    piece = this.game.puzzle.pieces[i];
    if(!piece.placed){
      if(!over && this.isOverPiece(piece))
        over = true;
      if(over && !this.game.selected){
        this.game.over = piece;
        this.game.selected = this.game.over;
      }
    }
  }

  if(this.game.debug){
    console.log('down ('+this.game.over.id+') '+this.x+', '+this.y);
  }
};

/*****
 *
 *   mouseup
 *
 *****/
Mouse.prototype.onPointerUp = function(e) {
  this.x = e.x/this.game.scale;
  this.y = e.y/this.game.scale;

  this.up = true;
  this.down = false;
  this.event = e;

  //place
  if((this.game.selected)&&(this.game.selected.near())&&(!this.game.selected.placed)){
    this.game.selected.position.x = this.game.selected.holder.position.x;
    this.game.selected.position.y = this.game.selected.holder.position.y;
    this.game.selected.placed = true;
    this.game.selected.moveble = false;
    this.game.placed_pieces.push(this.game.selected);
    //sfx
    if(this.game.drip.currentTime != 0)
      this.game.drip.currentTime = 0;
    if(!iOS){
      this.game.drip.src = "/audio/drip.mp3";
      this.game.drip.play();
    }
  }else if((this.game.selected)&&(!this.game.selected.near())){
    this.game.selected.p = 0;
    this.game.selected.moveble = false;
    this.game.selected.placed = false;
    //sfx
    if(!iOS){
      //if(game.twang.currentTime != 0)
        //game.twang.currentTime = 0;
      this.game.twang.play();
    }else{
      //game.drip.src = "/audio/twang.mp3";
      //game.drip.play();
      this.game.twang.src = "/audio/twang.mp3";
      this.game.twang.play();
    }
  }

  //unselect
  this.game.selected = null;

  if(this.game.debug){
    console.log('up');
  }

};
