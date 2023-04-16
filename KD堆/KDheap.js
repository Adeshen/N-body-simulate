
class heapnode{
    constructor(val) {
        this.val=val;
        this.x=val.x;
        this.y=val.y;
    }
}

class KDheap{
    constructor() {
        this.heap=[null];
    }
    //node 就是数组下标
    getParent(node){
        return Math.floor(node/2);
    }
    getleft(node){
        if(node*2>this.heap.length) return null;
        return node*2;
    }
    getright(node){
        if(node*2+1>this.heap.length) return null;
        return node*2+1;
    }
    getlvl(node){
        return Math.floor(Math.log2(node)+1);
    }
    add(val){
        this.heap.push(val);
        this.normalize(this.heap.length-1);
    }
    normalize(node){
        this.normalize_up(node);
        this.normalize_down(node);
    };
    normalize_up(node){
        let last=node;
        let lvl=this.getlvl(node);
        let now=this.heap[node];
        if(now==undefined) return;
        let list=[];
        for(let ancestor=this.getParent(node);ancestor>0;ancestor=this.getParent(ancestor)){
            list.push(ancestor);
        }
        let lvlk=1;
        for(let i=list.length-1;i>=0;i--){
            let an=this.heap[list[i]];
            if(!an||an==undefined) continue;
            if((lvlk%2&&an.y>now.y)||(lvlk%2==0&&an.x>now.x)){
                    now=this.heap[node];
                    this.heap[node]=this.heap[list[i]];
                    this.heap[list[i]]=now;
            }
            lvlk++;
        }
    }
    normalize_down(node){
        if(node>this.heap.length-1) return;
        let v=node;
        let lvl=this.getlvl(node);
        let now=this.heap[node];

        let deson=[node*2,node*2+1,node*2*2,node*2*2+1,(node*2+1)*2,(node*2+1)*2+1];
        for(let i=0;i<6;i++){
            if(deson[i]<this.heap.length){
                if(lvl%2){
                    if(this.heap[deson[i]].y<now.y){
                        v=deson[i];
                    }
                }
                else{
                    if(this.heap[deson[i]].x<now.x){
                        v=deson[i];
                    }
                }
            }
        }
        if(v==node) return;
        this.heap[node]=this.heap[v];   //swap
        this.heap[v]=now;
        if(this.getlvl(v)==lvl+2){
            let parent=this.getParent(v);
            if(lvl%2){
                if(this.heap[v].x<this.heap[parent].x){
                    let t=this.heap[parent];
                    this.heap[parent]=this.heap[v];   //swap
                    this.heap[v]=t;
                }
            }
            else{
                if(this.heap[v].y<this.heap[parent].y){
                    let t=this.heap[parent];
                    this.heap[parent]=this.heap[v];   //swap
                    this.heap[v]=t;
                }
            }
        }
        this.normalize_down(v);
    };
    delete(node){
        if(node>this.heap.length-1||node<0) return 0;
        this.heap[node]=this.heap[this.heap.length-1];
        this.heap.pop();
        this.normalize(node);
    }

    search2(particle,nowID,r,list){
        if(nowID>this.heap.length-1) return;
        let now=this.heap[nowID];
        let lvl=this.getlvl(nowID);
        // console.log(nowID);
        // console.log(now);
        if(lvl%2){
            if(particle.y+r<now.y) return ;
        }else{
            if(particle.x+r<now.x) return ;
        }
        this.search2(particle,nowID*2,r,list);
        this.search2(particle,nowID*2+1,r,list);
        if(now.x>particle.x-r&&now.x<particle.x+r&&now.y>particle.y-r&&now.y<particle.y+r) list.push(nowID);
    }
    balance(node){
        if(node>this.heap.length-1) return;
        this.balance(node*2);
        this.balance(node*2+1);
        this.normalize_down(node);
    }
    show(){
        let lvl=0;
        for(let i=1;i<this.heap.length;i++){
            if(this.getlvl(i)!=lvl){
                lvl=this.getlvl(i);
                console.log('is  '+lvl+"   layer");

            }
            console.log(this.heap[i]);
        }
    }
}