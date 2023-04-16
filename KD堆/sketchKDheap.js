var particles = [];
var cx,cy;

var numOfParticles = 900; // 需要调整这个星体个数


var zoom=0.4;
var offset={'x':0,'y':0};

var Mass = 10;
var Walls = 1;
var Collision = false;
var Kill = true;

function clearAll() {
    particles=[];
}


let tree=new KDheap();
function setup() {
    createCanvas(windowWidth, windowHeight);
    cx=windowWidth/2;
    cy=windowHeight/2;
    stroke(255);
    for (var i = numOfParticles; i >= 0; i--) {
        let a=i/numOfParticles*2*3.14;
        // var p=new Particle(random(windowWidth/zoom),random(windowHeight/zoom),0,0,0,0,random(20,30),1);
        // var p=new Particle(500*Math.cos(a)+windowWidth/zoom/2,500*Math.sin(a)+windowHeight/zoom/2,0,0,0,0,random(20,30),1);
        var p = new Particle(cx *(1 + Math.cos(i * 2 * 3.14 / numOfParticles)), cy * (1 + Math.sin(i * 2 * 3.14 / numOfParticles)), 0, 0, 0, 0, random(20, 30), 1);
        particles.push(p);  //压入行星
        tree.add(p);
    }
    // tree.show();
}
let cout=0;
function draw() {
    background(0,40,100);
    push();
    scale(zoom);
    translate(offset.x,offset.y);
    // tree.normalize(tree.heap[1]);
    tree.balance(1);
    calcNewton(tree); // 主要是这个计算耗时
    for (var i of tree.heap) {
        if(i==null) continue;
        i.render();
        i.update();
    }
    numOfParticles=tree.heap.length;
    pop();
    textSize(12);
    fill(255);
    text('Frame Rate: ' + frameRate().toFixed(0) + ' Particles:' + tree.heap.length,20,windowHeight-20);
}



class Particle {
    constructor(x,y,vx,vy,ax,ay,mass){
        this.x=x; // x 坐标
        this.y=y; // y 坐标
        this.vx=vx; // x 轴速度
        this.vy=vy; // y 轴速度
        this.ax=ax; // x 轴加速度
        this.ay=ay; // y 轴加速度
        this.mass=mass; // 质量
        this.r=Math.log(Math.abs(mass)); // 半径
        this.myColor=color(255,255,255,128);
    }

    render(){
        fill(this.myColor);
        stroke(this.myColor)
        ellipse(this.x,this.y,this.r*4);
    }

    updateAcc(ax,ay) {
        this.ax=ax*0.5;
        this.ay=ay*0.5;
    };

    update() {
        this.vx+=this.ax;
        this.vy+=this.ay;
        this.x+=this.vx;
        this.y+=this.vy;
        this.myColor=color(255,255,255,12+Math.log(this.mass)*8);
    };
}
function calcNewton(tree) {
    var pnum=tree.heap.length;

    for (var i = pnum - 1; i > 0; i--) {
        var bodyA=tree.heap[i];
        var sum_ax=0,sum_ay=0;
        var list=[];

        tree.search2(bodyA,1,windowWidth/100,list);
        // console.log(list.length);
        for(let j=0;j<list.length;j++){
            var bodyB=tree.heap[list[j]];   //可以优化
            var d=dist(bodyA.x,bodyA.y,bodyB.x,bodyB.y);   //p5.js 邱两点距离

            var dx=bodyB.x-bodyA.x;
            var dy=bodyB.y-bodyA.y;
            if(d>(bodyA.r+bodyB.r)){
                sum_ax += bodyB.mass*dx/(d*d*d); //Sum of GM*X/r*r*r
                sum_ay += bodyB.mass*dy/(d*d*d); //Sum of GM*Y/r*r*r
            }
            if(d <= (bodyA.r+bodyB.r)+5 && i!=particles.length-1 && Collision){
                var netMass=bodyA.mass+bodyB.mass;
                var temp=new Particle((bodyA.x*bodyA.mass+bodyB.x*bodyB.mass)/netMass, (bodyA.y* bodyA.mass + bodyB.y * bodyB.mass) / netMass, (bodyA.vx * bodyA.mass + bodyB.vx * bodyB.mass) / netMass, (bodyA.vy * bodyA.mass + bodyB.vy * bodyB.mass)/netMass,0,0,netMass);
                tree.heap[i]=temp;
                tree.delete(j);  //除去被融合
                pnum=tree.length;
            }
        }
        r1=dist(bodyA.x,bodyA.y,0,bodyA.y); // repelent wall  左墙距离
        r2=dist(bodyA.x,bodyA.y,bodyA.x,0); // repelent wall   上墙距离
        r3=dist(bodyA.x,bodyA.y,windowWidth/zoom,bodyA.y); // repelent wall  右墙距离
        r4=dist(bodyA.x,bodyA.y,bodyA.x,windowHeight/zoom); // repelent wall   下墙距离

        if(Walls){
            sum_ax+= -10000*(0-bodyA.x)/(r1*r1*r1);
            sum_ay+= -10000*(0-bodyA.y)/(r2*r2*r2);
            sum_ax+= -10000*(windowWidth/zoom-bodyA.x)/(r3*r3*r3);
            sum_ay+= -10000*(windowHeight/zoom-bodyA.y)/(r4*r4*r4);
        }

        if (particles.length>0) {
            tree.heap[i].updateAcc(sum_ax,sum_ay);
        }

        if(Kill && (bodyA.x<0 || bodyA.y<0||bodyA.x>windowWidth/zoom || bodyA.y>windowHeight/zoom)) {
            tree.delete(i);
            pnum--;
        }
    }
}