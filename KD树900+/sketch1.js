var particles = [];
var cx,cy;

var numOfParticles = 300; // 需要调整这个星体个数


var zoom=0.4;
var offset={'x':0,'y':0};

var Mass = 10;
var Walls = true;
var Collision = false;
var Kill = true;

function clearAll() {
	particles=[];
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	cx=windowWidth/2;
	cy=windowHeight/2;
	stroke(255);
	let max_block = new Block(windowHeight/2,windowWidth/2,windowHeight,windowWidth);
	root = new Tree(max_block);
	for (var i = numOfParticles; i >= 0; i--) {
		var p = new Particle(cx *(1 + Math.cos(i * 2 * 3.14 / numOfParticles)), cy * (1 + Math.sin(i * 2 * 3.14 / numOfParticles)), 0, 0, 0, 0, random(20, 30), 1);
		particles.push(p);
		root.insert(p);

	}
	
	
}
function draw() {
	background(0,40,100);
	push();
	scale(zoom);
	translate(offset.x,offset.y);
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
	in_block(b)//是否在某个块中
	{
		return b.contain(this.x,this.y);
	}
	in(q) 
	{
		return q.contains(this.x,this.y);
	}
}

class Block
{
	constructor(x,y,width,height)
	{
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	contian(x,y)//大块是否包含某个点
	{
		if( x<=this.x+this.width/2 && x>=this.x-this.width/2 && y<=this.y+this.height/2 && y>=this.y-this.height/2)
		return true;
		else return false;
	}

	kid_block_contain(x,y)//点在哪个小块中
	{
		if( x<=this.x && x>=this.x-this.width/2 && y<=this.y+this.height/2 && y>=this.y) return "leftup"; 
		else
		if( x<=this.x && x>=this.x-this.width/2 && y<=this.y && y>=this.y-this.height/2) return "leftdown"; 
		else
		if( x<=this.x+this.width/2 && x>=this.x && y<=this.y+this.height/2 && y>=this.y) return "rightup"; 
		else
		if( x<=this.x+this.width/2 && x>=this.x && y<=this.y && y>=this.y-this.height/2) return "rightdown"; 
	}
	kid_block(position)
	{
		let x,y;
		switch(position)
		{
			case "leftup": x = this.x-this.width/4; y = this.y+this.height/4;break;
			case "leftdown": x = this.x-this.width/4; y = this.y-this.height/4;break;
			case "rightup": x = this.x+this.width/4; y = this.y+this.height/4;break;
			case "rightdown": x = this.x+this.width/4; y = this.y-this.height/4;break;
			default: break; 
		}
		let tem = new Block(x,y,this.width/2,this.height/2);
		return tem;
	}
}


class Tree
{
	constructor(b)
	{
		this.p = undefined;//该块代表的整体星体
		this.block = b;
		this.leftup = undefined;
		this.leftdown = undefined;
		this.rightup = undefined;
		this.rightdown = undefined;
	}

	if_leaf()//是否为叶节点
	{
		if(this.leftup==undefined&&this.leftdown==undefined&&this.rightup==undefined&&this.rightdown==undefined)
		{
			return true;
		}
		else return false;
	}

	insert(b)//往树中插入星体
	{
		console.log(b);
		if(this==undefined) return;


		if(this.p===undefined) 
		{
			this.p = b;//块未代表星体，插入
			return;
		}
		else
		{
			if(this.if_leaf()==true)//是叶节点,先把原本存着的星体往下插入，保证叶节点只存放单个星体
			{
				let choice = this.block.kid_block_contain(this.p.x,this.p.y); 
				switch(choice)
				{
					case "leftup": if(this.leftup===undefined) this.leftup = new Tree(this.block.kid_block("leftup")); this.leftup.insert(this.p);break;
					case "leftdown": if(this.letfdown===undefined) this.leftdown = new Tree(this.block.kid_block("leftdown")); this.letfdown.insert(this.p);break;
					case "rightup": if(this.rightup===undefined) this.rightup = new Tree(this.block.kid_block("rightup")); this.rightup.insert(this.p);break;
					case "rightdown": if(this.rightdown===undefined) this.rightdown = new Tree(this.block.kid_block("rightdown")); this.rightdown.insert(this.p);break;
					default: break;
				}3
				this.insert(b);
			}
			else//不是叶节点，正常找子块插
			{
				this.p.mass += b.mass;//质量合并，表示该块星体总质量
				let choice = this.block.kid_block_contain(b.x,b.y);
				switch(choice)
				{
					case "leftup": if(this.leftup===undefined) this.leftup = new Tree(this.block.kid_block("leftup")); this.leftup.insert(b);break;
					case "leftdown": if(this.letfdown===undefined) this.leftdown = new Tree(this.block.kid_block("leftdown")); this.letfdown.insert(b);break;
					case "rightup": if(this.rightup===undefined) this.rightup = new Tree(this.block.kid_block("rightup")); this.rightup.insert(b);break;
					case "rightdown": if(this.rightdown===undefined) this.rightdown = new Tree(this.block.kid_block("rightdown")); this.rightdown.insert(b);break;
					default: break;
				}
			}
		}
	}
}

// class Quad 
// {
// 	constructor(xmid, ymid, width,height)
// 	{
// 		this.xmid=xmid;
// 	  	this.ymid=ymid; 
// 	  	this.width=width;
// 		this.height=height;
// 	}
	
// 	//Check if the current quadrant contains a point
// 	contains(xmid, ymid) 
// 	{
// 	  	if(xmid<=this.xmid+this.width/2.0 && xmid>=this.xmid-this.width/2.0 && ymid<=this.height+this.length/2.0 && ymid>=this.ymid-this.length/2.0) 
// 	  	{
// 			return true;
// 	  	}
// 	  	else 
// 		{
// 			return false;
// 	  	}	
// 	}
// 	//Create subdivisions of the current quadrant
	
// 	// Subdivision: Northwest quadrant
// 	NW() 
// 	{
// 	  let newquad = new Quad(this.xmid-this.width/4.0, this.ymid+this.height/4.0,this.width/2.0,this.height/2);
// 	  return newquad;
// 	}
	
// 	// Subdivision: Northeast quadrant
// 	NE() 
// 	{
// 		let newquad = new Quad(this.xmid+this.width/4.0, this.ymid+this.height/4.0,this.width/2.0,this.height/2.0);
// 		return newquad;
// 	}
	
// 	// Subdivision: Southwest quadrant
// 	SW() 
// 	{
// 	  	let newquad = new Quad(this.xmid-this.width/4.0, this.ymid-this.height/4.0,this.width/2.0,this.height/2.0);
// 	  	return newquad;
// 	}
	
// 	// Subdivision: Southeast quadrant
// 	SE() 
// 	{
// 		let newquad = new Quad(this.xmid+this.length/4.0, this.ymid-this.length/4.0,this.length/2.0);
// 	  	return newquad;
// 	}
	
// }

// class BHTree 
// {
	
	
// 	//Create and initialize a new bhtree. Initially, all nodes are null and will be filled by recursion
// 	//Each BHTree represents a quadrant and a body that represents all bodies inside the quadrant
// 	constructor(q) 
// 	{
// 	  this.quad=q;
// 	  this.body=null;
// 	  this.NW=null;
// 	  this.NE=null;
// 	  this.SW=null;
// 	  this.SE=null;
// 	}
// 	//If all nodes of the BHTree are null, then the quadrant represents a single body and it is "external"
// 	isExternal(t) 
// 	{
// 	  if (t.NW==null && t.NE==null && t.SW==null && t.SE==null) return true;
// 	  else return false;
// 	}
// 	//We have to populate the tree with bodies. We start at the current tree and recursively travel through the branches
// 	insert(b) 
// 	{
// 	  //If there's not a body there already, put the body there.
// 	  	if (this.body==null) 
// 	  	{
// 			this.body=b;
// 	  	}
// 	  //If there's already a body there, but it's not an external node
// 	  //combine the two bodies and figure out which quadrant of the 
// 	  //tree it should be located in. Then recursively update the nodes below it.
// 	  	else 
// 		if (this.isExternal(this)==false) 
// 		{
// 			//this.body=b.add(this.body,b);
		
// 			let northwest = this.quad.NW();
// 			if (b.in(northwest)) 
// 			{
// 		  		if (this.NW==null) {this.NW= new BHTree(northwest);}
// 		  		this.NW.insert(b);    
// 				}
// 				else 
// 				{
// 		  		let northeast = this.quad.NE();
// 		  		if (b.in(northeast)) 
// 				{
// 					if (this.NE==null) {this.NE= new BHTree(northeast);}
// 					this.NE.insert(b);
// 		  		}
// 		  		else 
// 				{
// 					let southeast = this.quad.SE();
// 					if (b.in(southeast)) {
// 			  		if (this.SE==null) {this.SE= new BHTree(southeast);}
// 			  		this.SE.insert(b);
// 				} 
// 				else 
// 				{
// 				  	let southwest = this.quad.SW();
// 			  		if(this.SW==null) {this.SW= new BHTree(southwest);}
// 			  		this.SW.insert(b);
// 				}
// 		  	}
// 		}
// 	  }
// 	  //If the node is external and contains another body, create BHTrees
// 	  //where the bodies should go, update the node, and end 
// 	  //(do not do anything recursively)
// 	  else if (this.isExternal(this)) 
// 	  {
// 		let c = this.body;
// 		let northwest = this.quad.NW();
// 		if (c.in(northwest)) {
// 		  if (this.NW==null) {this.NW= new BHTree(northwest);}
// 		  this.NW.insert(c);    
// 		}
// 		else {
// 		  let northeast = this.quad.NE();
// 		  if (c.in(northeast)) {
// 			if (this.NE==null) {this.NE= new BHTree(northeast);}
// 			this.NE.insert(c);
// 		  }
// 		  else {
// 			let southeast = this.quad.SE();
// 			if (c.in(southeast)) {
// 			  if (this.SE==null) {this.SE= new BHTree(southeast);}
// 			  this.SE.insert(c);
// 			} 
// 			else 
// 			{
// 			  let southwest = this.quad.SW();
// 			  if(this.SW==null) {this.SW= new BHTree(southwest);}
// 			  this.SW.insert(c);
// 			}
// 		  }
// 		}
// 		this.insert(b);
// 	  }
// 	}
// 	//Start at the main node of the tree. Then, recursively go each branch
// 	//Until either we reach an external node or we reach a node that is sufficiently
// 	//far away that the external nodes would not matter much.
// 	updateForce(b) 
// 	{
// 	  	if (this.isExternal(this)) 
// 		{
// 			if (this.body!=b) b.addForce(this.body);
// 	  	}
// 	  	else if (this.quad.length()/(this.body.distanceTo(b))<2)
// 	  	{
// 			b.addForce(this.body);
// 	  	}
// 	  	else 
// 		{
// 			if (this.NW!=null) this.NW.updateForce(b);
// 			if (this.SW!=null) this.SW.updateForce(b);
// 			if (this.SE!=null) this.SE.updateForce(b);
// 			if (this.NE!=null) this.NE.updateForce(b);
// 	  	}
// 	}
// 	// convert to string representation for output
// 	toString() 
// 	{
// 	  if(NE != null || NW!=null || SW!=null || SE!=null) return "*" + body + "\n" + NW + NE + SW + SE;
// 	  else           return " " + body + "\n";
// 	}
// }


function calcNewton() 
{
	var pnum=particles.length;
	let max_block = undefined;
	 let root = undefined;
	 
	//for( let k = 1; k <= pnum-1 ; k++) root.insert(particles[k]); 
	

	for (var i = pnum - 1; i >= 0; i--) 
	{
		var bodyA=particles[i];
		var sum_ax=0,sum_ay=0;
		for (var j = pnum-1; j >= 0; j--) 
		{
				var bodyB=particles[j];
				var d=dist(bodyA.x,bodyA.y,bodyB.x,bodyB.y);
				var dx=bodyB.x-bodyA.x;
				var dy=bodyB.y-bodyA.y;
				if(d>(bodyA.r+bodyB.r))
				{
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