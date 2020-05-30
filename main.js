// phina.js をグローバル領域に展開
phina.globalize();

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 960;

const PBLOCK = [[60,800],[100,300],[80,80],[470,850],[530,120],[450,280],[480,470],[590,700],[530,630],[50,550],[150,650],[200,500],[320,200],[220,100],[550,350]];
const BLOCK_NUM = PBLOCK.length;
const MBLOCK = [[50, 200],[400, 640]];
const MBLOCK_NUM = MBLOCK.length;
const ENEMY_Y = 20;
const ENEMY_X = 620;
const SPEED = 10;


var ASSETS = {
  image: {
    'tomapiko': 'https://cdn.glitch.com/0e0da96a-6996-4917-b29f-4c405bff6b64%2Ftomapiko.png?v=1590153872739',
    'dragon': 'https://rawgit.com/alkn203/piko_strike/master/assets/enemy/pipo-enemy021.png',
    'bg': 'https://cdn.glitch.com/0e0da96a-6996-4917-b29f-4c405bff6b64%2F%E3%82%AD%E3%83%A3%E3%83%97%E3%83%81%E3%83%A3.PNG?v=1590296643879',
    
  },
};


// MainScene クラスを定義
phina.define('MainScene', {
  superClass: 'DisplayScene',
  
  init: function() {
    this.superInit();
    // 背景色を指定
    this.backgroundColor = '#002';
    Sprite('bg').addChildTo(this)
                .setPosition(this.gridY.span(6), this.gridX.center());
    this.group = DisplayElement().addChildTo(this);
    
    
    this.wall = Wall().addChildTo(this);
    this.goal = Goal().addChildTo(this);
    this.waypoint = WayPoint().addChildTo(this);
    
    this.player = Player().addChildTo(this);
    this.player.setPosition(this.gridX.span(1), this.gridY.span(15));
    
    this.enemy = Enemy().addChildTo(this);
    this.enemy.setPosition(this.gridX.span(2), this.gridY.span(17));
    
    (BLOCK_NUM).times(function(i) {
      var x,y;
      [x,y] = PBLOCK[i];
      var angle = 360/BLOCK_NUM*i;
      var block = Block(angle).addChildTo(this.group);
      
      block.x = x;
      block.y = y;
    }, this);
    
    (MBLOCK_NUM).times(function(i) {
      var x,y;
      [x,y] = MBLOCK[i];
      
      var block = MoveBlock(i).addChildTo(this.group);
      
      block.x = x;
      block.y = y;
    }, this);
    
    
    this.fromJSON({
      children: {
        wordGroup: {
          className: 'DisplayElement',
        },
        TimeLabel: {
          className: 'Label',
          text: '999',
          fill: 'white',
          x: this.gridX.span(15),
          y: this.gridX.span(1),
          align: 'right',
        }
      },
    });
    
    
    this.score = 0;
    this.time = 0;
        //this.hp = 10;
    this.enemy_state = -1;
    this.TimeLabel.text = (this.time/1000).floor() + '';
    
  },
  
  
  update: function(app) {
    this.time += app.deltaTime;
    this.TimeLabel.text = (this.time/1000).floor() + '';
    
    var seconds = (this.time/1000).floor();
    if(seconds >= 5 && this.enemy_state < 0){
      this.enemy_state++;
      this.enemy.cnt = 0;
    }
    
    this.checkHit();
    this.playerState();
    this.dragonClear();
  },
  
  
  
  onkeydown: function(e) {
    var ch = String.fromCharCode(e.keyCode);
    var player = this.player;
    //console.log(ch);
    if(ch === 'W') {
      //console.log("W");
      player.y-=20;
    }
    if(ch === 'A') {
      //console.log("A");
      player.x-=20;
    }
    if(ch === "S") {
      //console.log("S");
      player.y+=20;
    }
    if(ch === "D") {
      //console.log("D");
      player.x+=20;
    }
    
  },
  
  checkHit: function (){
    var player = this.player;
    var block = this.block;
    
    this.group.children.some(function(block) {
      if(player.hitTestElement(block)){
        //console.log("block");
        player.damage(15);
      }
    }, this);
    
    
    if(player.hitTestElement(this.enemy)){
      player.damage(30);
    }
    
    if(player.hitTestElement(this.wall) ||(player.y <= 0 || player.y >= SCREEN_HEIGHT) || (player.x <= 0 || player.x >= SCREEN_WIDTH) ){
      console.log("wall");
      player.damage(50);
    }
    
    
    if(Collision.testCircleCircle(player, this.waypoint)){
      console.log("waypoint");
      this.score = 70*(player.life.value/100);
      
  
      // add time bonus
      var seconds = (this.time/1000).floor();
      if(seconds < 7) this.score *= 1.5;
      else if(7 <= seconds && seconds <= 10) this.score *= 1.2;
      //else if(12 < seconds && seconds <= 15) this.score *= 1;
      else if(seconds > 15) this.score *= 0.5;
      
      this.score = Math.floor(this.score);
      //this.score = 5.00;
      console.log(this.score);
      this.gameover();
    }
    
    if(Collision.testCircleCircle(player, this.goal)){
      console.log("goal");
      this.score = 100*(player.life.value/100);
      
      // add time bonus
      var seconds = (this.time/1000).floor();
      if(seconds < 10) this.score *= 1.2;
      else if(10 <= seconds && seconds <= 20) this.score *= 1;
      else if(seconds > 20) this.score *= 0.5;
      
      this.score = Math.floor(this.score);
      this.gameover();
    }
    
  },
  
  playerState: function(){
    var player = this.player;
    if(player.life.value <= 0) {
      this.score = 0;
      this.gameover();
    }
  },
  
  dragonClear: function(){
    var enemy = this.enemy;
    if(enemy.hitTestElement(this.goal)){
      this.gameover();
    }
  },
  
  gameover: function(){
    this.exit({
      score: this.score,
      //text: "gameover!",
    });
  },

});



phina.define('WayPoint', {
  superClass: 'Button',
  
  init: function(text) {
    this.superInit({
      width: 90,
      height: 90,
      x: 390,
      y: 350,
      text: "WP",
    });
    //this.text = text;
  }
});


phina.define('Goal', {
  superClass: 'Button',
  
  init: function(text) {
    this.superInit({
      fill: 'gold',
      width: 90,
      height: 90,
      x: 585,
      y: 910,
      text: "Goal!",
    });
    //this.text = text;
  }
});


phina.define('Wall', {
  superClass: 'RectangleShape',
  
  init: function(options) {
    options = (options || {}).$safe({
      width: 200,
      height: 700,
      fill: 'silver',
      stroke: null,
      x: 320,
      y: 600,
    });
    this.superInit(options);
  },
});

phina.define('Block', {
  superClass: 'RectangleShape',
  
  init: function(angle) {
    this.superInit({
      width: 40,
      height: 40,
      fill: 'hsl({0}, 80%, 60%)'.format(angle || 0),
      stroke: null,
      cornerRadius: 4,
    });
  },
});


phina.define('MoveBlock', {
  superClass: 'RectangleShape',
  
  init: function(i) {
    this.superInit({
      width: 40,
      height: 40,
      fill: 'gray',
      stroke: null,
      cornerRadius: 4,
    });
    this.theta = 0;
    this.id = i+1;
  },
  
  update: function (){
    this.move();
    this.theta+=5;
  },
  
  move: function (){
    var rad = this.theta * (Math.PI / 180.0);
    var crd = this.coordinate(rad);
    this.y += (18/this.id)*crd.vy;
    this.x += (18/this.id)*crd.vx;
  },
  
  coordinate: function (rad) {
    var obj = new Object();
    obj.vy = Math.cos(rad);
    obj.vx = Math.sin(rad);
    return obj;
  }
});


phina.define("Player", {
  superClass: 'Sprite',
  
  init: function() {
    this.superInit('tomapiko');
    
    this.life = LifeGauge({
      width: this.width,
      height: this.height / 5,
      life: 100,
    }).addChildTo(this);
    
    this.life.y = this.height - this.life.height * 2;
    
    this.life.on('empty', function() {
      this.remove();
    });
  },
  
  damage: function(value) {
    this.life.value -= value;
    this.tweener.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).play();
  },
});

/*
phina.define("Player", {
  superClass: 'Sprite',
  
  init: function() {
    this.superInit('bipple');
    this.width *= 0.2;
    this.height *= 0.2;
    
    this.life = LifeGauge({
      width: this.width,
      height: this.height / 5,
      life: 100,
    }).addChildTo(this);
    
    this.life.y = 5 + this.height - this.life.height * 2;
    
    this.life.on('empty', function() {
      this.remove();
    });
  },
  
  damage: function(value) {
    this.life.value -= value;
    this.tweener.fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).play();
  },
});
*/
phina.define("LifeGauge", {
  superClass: 'Gauge',
  
  init: function(param) {
    this.superInit({
      width: param.width,
      height: param.height,
      fill: 'red',
      stroke: 'silver',
      gaugeColor: 'limegreen',
      maxValue: param.life,
      value: param.life,
    });
    
    this.animationTime = 500;
  },
});


phina.define('Enemy', {
  superClass: 'Sprite',
  
  init: function(cnt) {
    this.superInit('dragon');
    this.cnt = -1;
    this.theta = 0;
    
  },
  
  update: function () {
    this.move();
    this.theta+=5;
  },
  
  move: function () {
    
    if(this.cnt === 0){
      var vy = this.theta * (Math.PI / 180.0);
      var vx = this.sine(vy);
      this.y -= 0.3 * vy;
      this.x += 4 * vx;
    }
    
    
    if(this.cnt === 1){
      var vx = this.theta * (Math.PI / 180.0);
      var vy = this.sine(vx);
      this.y += 5 * vy;
      this.x += 0.2 * vx;
      //this.x += 10;
      //console.log(1);
    }
    if(this.cnt === 2){
      var vy = this.theta * (Math.PI / 180.0);
      var vx = this.sine(vy);
      this.y += 0.3 * vy;
      this.x += 4 * vx;
      //console.log(2);
    }
    if(this.top < 20 && this.cnt === 0) {
      this.cnt = 1;
      //console.log(this.cnt);
    }
    if(this.right >= 580 && this.cnt === 1){
      //this.right = 580;
      this.cnt = 2;
      //console.log(this.cnt);
    }
  },
  
  sine: function (rad) {
    //var rad = vx / (2.0 * Math.PI);
    var value = Math.sin(rad);
    return value;
  }
});


// メイン処理
phina.main(function() {
  // アプリケーション生成
  var app = GameApp({
    startLabel: 'main',
    assets: ASSETS,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });
  // アプリケーション実行
  app.run();
});
