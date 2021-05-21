const Engine = Matter.Engine;
const World= Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

var engine, world;
var box1, zombie1,zombie3;
var backgroundImg,platform;
var boy, slingshot;

var gameState = "onSling";
var gameState2= "start"
var bg = "sprites/bg1.png";
var score = 0;
var database;
var form;
var stone2Moving  = false;

var numHits2 = 0;

var shield = null;
var flagBox1=0;
var flagBox2=0;
var flagleftSling1=0;
var flagleftSling2=0;
var collision1, collision2, collision3, collision4, collision5, collision6;
var flagrightSling1=0;
var flagrightSling2=0;
var maxId=0;

var numShields = 10; 
var hitsOnShield = 0;
var maxHitsOnShield = 3;

function preload() {
    backgroundImg=loadImage(bg)
    sling1Img = loadImage("sprites/sling1.png");
    sling2Img = loadImage("sprites/sling2.png");
    sling3Img = loadImage("sprites/sling3.png");
}


function setup(){
    var canvas = createCanvas(displayWidth,displayHeight);
    engine = Engine.create();
    world = engine.world;


    ground = new Ground(600,height,1200,20);
    platform = new Ground(45, 305, 300, 170);

   

    box1 = new Box(900,50,250,100);
    box2 = new Box(900,160,250,100);
    
    zombie1 = new Zombie(580,height-200, 100,200);
   
    leftSling1= new Catapult(270,250,50,150, "sprites/sling1.png")
    leftSling2= new Catapult(240,220,50,80, "sprites/sling2.png")
    

    boy = new Boy(200,50);
    stone = new Stone(200,200);
    stone2 = new Stone(900,10);
    

    rightSling1= new Catapult(330,40,50,150, "sprites/sling1.png")
    rightSling2= new Catapult(300,220,50,80, "sprites/sling2.png")

    //log6 = new Log(230,180,80, PI/2);
    slingshot = new SlingShot(stone.body,{x:200, y:50});
    score = 0;
    Matter.Events.on(engine, 'collisionStart', collision);
  
    database=firebase.database();

    playersRef = database.ref("players");
    playersRef.once("value",(data) => { maxId = data.numChildren() +1; })
    form=new Form();

}

function draw(){
        background(backgroundImg);
        Engine.update(engine);
        textSize(20);
    fill("white");
    text("Score: "+ score, 50, 50)
    text("Hits On shield: " + hitsOnShield, 500,50);
    text("Max Hits allowed: "+ maxHitsOnShield, 500,70)
    text("Numhits event based: "+ numHits2, 500,90)

        if (gameState2==="start"){
            form.display();
        }
        else if(gameState2==="play"){
            form.hide();
            text(mouseX+","+mouseY,mouseX,mouseY)
            noStroke();
            textSize(35)
            fill("white")
            text("Score  " + score, width-300, 50)
            
            box2.display();
            box1.display();
            ground.display();
            if (shield) shield.display();
            Matter.Body.setPosition(zombie1.body,{x:box1.body.position.x,y:box1.body.position.y-50})
            zombie1.display();
            zombie1.score();
            level1.display();
            box1.score();
            box2.score();

            stone.display();
            stone2.display();
            boy.display();
            platform.display();
            slingshot.display(); 
            Matter.Body.setPosition(enemy1.body, {x:box1.body.position.x+70, y:box1.body.position.y-145});
            Matter.Body.setPosition(rightsling1.body, {x:box1.body.position.x-50,y:box1.body.position.y-115 })
            Matter.Body.setPosition(rightsling2.body, {x:box1.body.position.x-70,y:box1.body.position.y-145})

            var collision1=Matter.SAT.collides(boy.body,box1.body)
            if (collision1.collided){
                flagBox1=1
            }
            if (flagBox1){
                score+=10 
                flagBox1=0
            } 
            var collision2=Matter.SAT.collides(boy.body,box2.body)
            if (collision2.collided){
                flagBox2=1
            }
            if (flagBox2){
                score+=10 
                flagBox2=0
            } 
         /*   
            var collision3=Matter.SAT.collides(stone2.body,leftSling1.body)
            if (collision3.collided){
                flagleftSling1=1
            }
            if (flagleftSling1){
                score+=10 
                flagleftSling1=0
            } 
            var collision4=Matter.SAT.collides(stone2.body,leftSling2.body)
            if (collision4.collided){
                flagleftSling2=1
            }
            if (flagleftSling2){
                score+=10 
                flagleftSling2=0
            }
            */ 
            if (frameCount%100 === 0 && stone2.body.speed < 1) stone2Moving = false;
    
            if (stone2Moving === false && flagSlingR === 0) {
                push();
                strokeWeight(3);
                var pointA = stone2.body.position;
                var pointB = {x: pointA.x-50, y:pointA.y - 50};
                stroke(48,22,8)
                line(pointA.x, pointA.y, rightsling2.body.position.x, rightsling2.body.position.y-30);
                line(pointA.x, pointA.y, rightsling1.body.position.x, rightsling1.body.position.y-50);
                pop();
            } 
            if (frameCount%200 === 0 && enemy1.body.speed < 1) {
                stone2Moving  = true;
                Matter.Body.setPosition(stone2.body, {x:enemy1.body.position.x-30, y:enemy1.body.position.y-50})
                Matter.Body.applyForce(stone2.body, {x:stone2.body.position.x, y:stone2.body.position.y}, {x:-130, y:-150});
            }
           
                if (hitsOnShield > maxHitsOnShield) {
                    World.remove(world, shield);
                    shield = null;
                }
            }
        }
   


function mouseDragged(){
    if (gameState!=="launched"){
        Matter.Body.setPosition(boy.body, {x: mouseX , y: mouseY});
    }
}


function mouseReleased(){
    slingshot.fly();
    gameState = "launched"
}
function keyPressed (){

}
function collision(event) {
    var pairs = event.pairs;
    for (var i= 0; i < pairs.length; i++) {
      console.log("in collision "+i)
      var labelA = pairs[i].bodyA.label;
      var labelB = pairs[i].bodyB.label;
      if ((labelA === 'stone' && labelB === 'shield') ||
      (labelA === 'shield' && labelB === 'stone') ) {
        numHits2++;
      }
    }
 }
