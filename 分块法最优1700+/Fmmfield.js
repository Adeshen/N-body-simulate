

//钟悦东 20340081
//本算法采用分块哈希查找，通过直接将整个图分割为n*n块，最后将每个行星x、y坐标/n，找到对应块，将该块以及周围八块的所有行星纳入运算，由于查找的代价为O(1)，所以效率非常高
//在游戏本测试最多跑到1800，当然最终还多取决分块密度n;
var particles = [];
var cx,cy;
var numOfParticles = 2100; // 需要调整这个星体个数

//FMM弱化版————其实就是分块eeeeeeeeee
var zoom=0.4;
var offset={'x':0,'y':0};

var Mass = 10;
var Walls = true;
var Collision = false;
var Kill = true;

function clearAll() {
    particles=[];
}
class Fnode {
    // xmin,xmax,ymin,ymax
    constructor(i,j,xmin,xmax,ymin,ymax) {
        // this.parent=null;
        this.row=i;
        this.col=j;
        this.xmin=xmin;
        this.ymin=xmin;
        this.xmax=xmax;
        this.ymax=ymax;

        this.mass=0;
        this.arr=[];
        // this.x=Math.max(this.x,xmin);
        // this.x=Math.min(this.x,xmax);
        // this.y=Math.max(this.y,ymin);
        // this.y=Math.min(this.y,ymax);
        this.x=(this.xmin+this.xmax)/2;
        this.y=(this.ymin+this.ymax)/2;
    }
    add(part){
        this.arr.push(part);
        // this.x=part.x*part.mass+this.x*this.mass;
        // this.y=part.y*part.mass+this.y*this.mass;
        this.mass+=part.mass;
        this.x/=this.mass;this.y/=this.mass;
    }
    check(){
        let arr=[];
        for(let j=0;j< this.arr.length;j++){
            let i=this.arr[j];
            if(i.x>this.xmax||i.x<this.xmin||i.y>this.ymax||i.y<this.ymin){
                this.mass-=i.mass;
                this.arr.splice(j,1);
                // this.x=(this.x-i.x*i.mass)/this.mass;
                // this.y=(this.y-i.y*i.mass)/this.mass;
                arr.push(i);
            }
        }
        return arr;
    }
    delete(part){
        for(let i of this.arr){
            if(i===part){
                this.mass-=part.mass;
                his.arr.splice(j,1);
                // this.x=(this.x-part.x*part.mass)/this.mass;
                // this.y=(this.y-part.y*part.mass)/this.mass;
                return 1;
            }
        }
        return 0;
    }
}

class FMM {
    constructor(x,y,n) {
        this.x=x;
        this.y=y;
        this.arr=[];
        this.rowwid=y/n;
        this.colwid=x/n;
        this.n=n;
        for(let i=0;i<n;i++){
            let t=[];
            for(let j=0;j<n;j++){
                let k=new Fnode(i,j,i*this.colwid,(i+1)*this.colwid,j*this.rowwid,(j+1)*this.colwid);
                // console.log(k);
                t.push(k);
                // console.log(k);
            }
            this.arr.push(t);
        }
    }
    build(particles){
        for(let i of particles){
            this.add(i);
        }
    }
    add(i){
        let row=Math.floor(i.y/this.rowwid);
        let col=Math.floor(i.x/this.colwid);
        if(row<0||row>this.n-1||col<0||col>this.n-1) return;
        // console.log(this.arr[row][col]);
        this.arr[row][col].add(i);
    }
    balance(){
        for(let i=0;i<this.n;i++) {
            for (let j = 0; j < this.n; j++) {
                let node=this.arr[i][j];
                let arr=node.check();
                for(let k=0 ;k< arr.length;k++){
                    this.add(arr[k]);
                }
            }
        }
    }
    search(part){
        // console.log(part);
        let row=Math.floor(part.y/this.rowwid);
        let col=Math.floor(part.x/this.colwid);
        let ans=[];
        // console.log(row,col);
        if(row<0||col<0||row>=this.n||col>=this.n) return [] ;
        // console.log(this.arr[row][col]);
        for(let i=0;i< this.arr[row][col].arr.length;i++){
            ans.push(this.arr[row][col].arr[i]);
        }
        if(row>0){
            ans.push(...this.arr[row-1][col].arr);
            // for(let i=0;i< this.arr[row-1][col].arr.length;i++){
            //     ans.push(this.arr[row-1][col].arr[i]);
            // }
        }
        if(row<this.n-1){
            ans.push(...this.arr[row+1][col].arr);
            // for(let i=0;i< this.arr[row+1][col].arr.length;i++){
            //     ans.push(this.arr[row+1][col].arr[i]);
            // }
        }
        if(col>0){
            ans.push(...this.arr[row][col-1].arr);
            // for(let i=0;i< this.arr[row][col-1].arr.length;i++){
            //     ans.push(this.arr[row][col-1].arr[i]);
            // }
        }
        if(col<this.n-1){
            ans.push(...this.arr[row][col+1].arr);
            // for(let i=0;i< this.arr[row][col+1].arr.length;i++){
            //     ans.push(this.arr[row][col+1].arr[i]);
            // }
        }
        if(row>0&&col>0){
            ans.push(...this.arr[row-1][col-1].arr);
            
            // for(let i=0;i< this.arr[row-1][col-1].arr.length;i++){
            //     ans.push(this.arr[row-1][col-1].arr[i]);
            // }
        }
        if(row<this.n-1&&col<this.n-1){
            ans.push(...this.arr[row+1][col+1].arr);
            // for(let i=0;i< this.arr[row+1][col+1].arr.length;i++){
            //     ans.push(this.arr[row+1][col+1].arr[i]);
            // }
        }
        if(row>0&&col<this.n-1){
            ans.push(...this.arr[row-1][col+1].arr);
            // for(let i=0;i< this.arr[row-1][col+1].arr.length;i++){
            //     ans.push(this.arr[row-1][col+1].arr[i]);
            // }
        }
        if(row<this.n-1&&col>0){
            ans.push(...this.arr[row+1][col-1].arr);
            // for(let i=0;i< this.arr[row+1][col-1].arr.length;i++){
            //     ans.push(this.arr[row+1][col-1].arr[i]);
            // }
        }
        // console.log(ans);
        return ans;
    }
}

let tree=0;
function setup() {
    tree=new FMM(windowHeight/zoom,windowWidth/zoom, 20);
    createCanvas(windowWidth, windowHeight);
    cx=windowWidth/2;
    cy=windowHeight/2;
    stroke(255);
    for (var i = numOfParticles; i >= 0; i--) {
        var p = new Particle(cx *(1 + Math.cos(i * 2 * 3.14 / numOfParticles)), cy * (1 + Math.sin(i * 2 * 3.14 / numOfParticles)), 0, 0, 0, 0, random(20, 30), 1);
        // var p = new Particle( Math.random()*windowWidth/zoom, Math.random()*windowHeight/zoom, 0, 0, 0, 0, random(20, 30), 1);
        particles.push(p);
        tree.add(p);
    }
}
// let co=0;
function draw() {
    background(0,40,100);
    push();
    scale(zoom);
    translate(offset.x,offset.y);
    tree.balance();
    // co++;
    // co%=500;
    // if(!co){
    //     console.log(tree);
    // }
    calcNewton(); // 主要是这个计算耗时

    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i].render();
        particles[i].update();
    }
    pop();
    textSize(12);
    fill(255);
    text('Frame Rate: ' + frameRate().toFixed(0) + ' Particles:' + particles.length,20,windowHeight-20);
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

function calcNewton() {
    var pnum=particles.length;
    for (var i = pnum - 1; i >= 0; i--) {
        var bodyA=particles[i];
        var sum_ax=0,sum_ay=0;
        let list = tree.search(bodyA);
        // console.log(bodyA,list);
        // console.log(list.length);
        // console.log(list.length);
        for (var j = list.length - 1; j >= 0; j--) {
            var bodyB=list[j];
            if(bodyB!=bodyA){

                var d=dist(bodyA.x,bodyA.y,bodyB.x,bodyB.y);
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
                    particles.splice(j,1);
                    pnum=particles.length;
                }
            }
        }

        r1=dist(bodyA.x,bodyA.y,0,bodyA.y); // repelent wall
        r2=dist(bodyA.x,bodyA.y,bodyA.x,0); // repelent wall
        r3=dist(bodyA.x,bodyA.y,windowWidth/zoom,bodyA.y); // repelent wall
        r4=dist(bodyA.x,bodyA.y,bodyA.x,windowHeight/zoom); // repelent wall

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