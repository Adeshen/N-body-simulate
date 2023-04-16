var particles = [];
var cx,cy;

var numOfParticles = 1200; // 需要调整这个星体个数


var zoom=0.4;
var offset={'x':0,'y':0};

var Mass = 10;
var Walls = 1;
var Collision = false;
var Kill = true;

function clearAll() {
    particles=[];
}
class node{
    constructor(p,shu) {
        this.val=p;
        this.Isshu=shu;
        this.left=null;
        this.right=null;
    }
}
class KDtree {
    constructor() {
        this.head = null;
        this.size=0;
    }
    add(value) {
        if(this.head==null) {
            this.head=new node(value,1);return;
        }
        let now=this.head;
        while (true){
            if (now.Isshu == 1) {
                if (value.x < now.val.x) {
                    if(now.left==null){
                        now.left=new node(value,0);this.size++;return;
                    }
                    now = now.left;
                } else {
                    if(now.right==null){
                        now.right=new node(value,0);this.size++;return;
                    }
                    now = now.right;
                }
            }
            else {
                if (value.y < now.val.y) {
                    if(now.left==null){
                        now.left=new node(value,1);this.size++;return;
                    }
                    now = now.left;
                } else {
                    if(now.right==null){
                        now.right=new node(value,1);this.size++;return;
                    }
                    now = now.right;
                }
            }
        }
    }
    search(node,now,r,list){
        if(now==null) {
            return;
        }
        if(now.Isshu==1){
            if (node.x-r < now.val.x) {
                this.search(node,now.left,r,list);
            }
            if(node.x+r > now.val.x){
                this.search(node,now.right,r,list);
            }
        }else {
            if (node.y-r < now.val.y) {
                this.search(node,now.left,r,list);
            }
            if (node.y+r > now.val.y) {
                this.search(node,now.right,r,list);
            }
        }
        if((now.val.x==node.x&&now.val.y==node.y))
            return;
        if(dist(node.x,node.y,now.val.x,now.val.y)<r){
            list.push(now);
        }
    }
    show(now){
        if(now==null) return;
        console.log(now);
        this.show(now.left);
        this.show(now.right);
    }
}

let tree=null;
function setup() {
    createCanvas(windowWidth, windowHeight);
    cx=windowWidth/2;
    cy=windowHeight/2;
    stroke(255);
    for (var i = numOfParticles; i >= 0; i--) {

        // var p=new Particle(random(windowWidth/zoom),random(windowHeight/zoom),0,0,0,0,random(20,30),1);
        // var p=new Particle(500*Math.cos(a)+windowWidth/zoom/2,500*Math.sin(a)+windowHeight/zoom/2,0,0,0,0,random(20,30),1);
        var p = new Particle(cx *(1 + Math.cos(i * 2 * 3.14 / numOfParticles)), cy * (1 + Math.sin(i * 2 * 3.14 / numOfParticles)), 0, 0, 0, 0, random(20, 30), 1);
        particles.push(p);  //压入行星

    }

}

function draw() {
    background(0,40,100);
    push();
    scale(zoom);
    translate(offset.x,offset.y);

    tree=new KDtree();
    for(let i =0;i<particles.length;i++){

         tree.add(particles[i]);
    }
    // cout=20/;
    // console.log(tree.size);


    calcNewton(tree); // 主要是这个计算耗时
    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i].render();
        particles[i].update();
    }
    pop();
    textSize(12);
    fill(255);
    text('Frame Rate: ' + frameRate().toFixed(0) + ' Particles:' + particles.length,20,windowHeight-20);
}

// function walldis(part) {
//     let rx=maxx/5;
//     let ry=maxy/5;
//     if(part.x<rx||part.x>maxx-rx||part.y<ry||part.y>maxy-ry) {
//         return 0;
//     }
//     return 1;
// }

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
    var pnum=particles.length;
    for (var i = pnum - 1; i >= 0; i--) {
        var bodyA=particles[i];
        var sum_ax=0,sum_ay=0;
        var list=[];
        tree.search(particles[i],tree.head,windowWidth/10,list);
        // console.log(list.length);
        for(let j=0;j<list.length;j++){
                var bodyB=list[j].val;   //可以优化
                var d=dist(bodyA.x,bodyA.y,bodyB.x,bodyB.y);   //p5.js 邱两点距离
                if(d>0.5*windowHeight) continue;
                var dx=bodyB.x-bodyA.x;
                var dy=bodyB.y-bodyA.y;
                if(d>(bodyA.r+bodyB.r)){
                    sum_ax += bodyB.mass*dx/(d*d*d); //Sum of GM*X/r*r*r
                    sum_ay += bodyB.mass*dy/(d*d*d); //Sum of GM*Y/r*r*r
                }
                if(d <= (bodyA.r+bodyB.r)+5 && i!=particles.length-1 && Collision){
                    var netMass=bodyA.mass+bodyB.mass;
                    var temp=new Particle((bodyA.x*bodyA.mass+bodyB.x*bodyB.mass)/netMass, (bodyA.y* bodyA.mass + bodyB.y * bodyB.mass) / netMass, (bodyA.vx * bodyA.mass + bodyB.vx * bodyB.mass) / netMass, (bodyA.vy * bodyA.mass + bodyB.vy * bodyB.mass)/netMass,0,0,netMass);
                    particles[i]=temp;
                    particles.splice(j,1);  //除去被融合
                    xsort.splice(k,1);
                    ysort.splice(k,1);
                    pnum=particles.length;
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
            particles[i].updateAcc(sum_ax,sum_ay);
        }

        if(Kill && (bodyA.x<0 || bodyA.y<0||bodyA.x>windowWidth/zoom || bodyA.y>windowHeight/zoom)) {
            particles.splice(i,1);

            pnum--;
        }
    }
}