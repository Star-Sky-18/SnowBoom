
class Snow {

    constructor(loc) {
        //在最大直径范围内随机
        this.d = random(minDiameter,maxDiameter);
        //生成时刚好完全在屏幕外
        this.center = new Vertex({x:loc?loc.x:random(width), y:loc?loc.y:-0.5*this.d,snow:this});
        //在最大角速率范围内随机出[-max,max]的角速率
        this.angularSpeed = random(-maxAngularSpeed,maxAngularSpeed);
        //在最大下落速率范围内随机
        this.fallSpeed = random(minFallSpeed,maxFallSpeed);
        //透明度在[30,130]内随机
        this.alpha = random(minAlpha,maxAlpha);
        //生成分支们
        this.branches = this.createBranches();
        //风力速度
        this.speedXFromWind = 0;
        this.speedYFromWind = 0;
        //环绕速度
        this.centeredSpeed = 0;
    }

    /**
     * 更新整片雪花
     */
    update() {
        //环绕鼠标
        if(centerMouse)
            this.centerMouse();
        if(hasWind)
            this.wind();
        //中心下落
        this.center.fall();
        if(this.center.x<-0.1*width||this.center.x>1.1*width){
            this.center.x = width - this.center.x;
            this.branches = this.createBranches()
            return this.center.y-0.5*this.d>height;
        }
        for (let i in this.branches) {
            this.branches[i].update();
        }
        return this.center.y-0.5*this.d>height;
    }

    wind(){
        if(windX>=0)
            this.speedXFromWind += random(windX*0.5, windX) ;
        else
            this.speedXFromWind += random(windX, windX*0.5);
        this.speedXFromWind *= 0.99;

        if(windY>=0)
            this.speedYFromWind += random(windY*0.5, windY);
        else
            this.speedYFromWind += random(windY, windY*0.5);
        this.speedYFromWind *= 0.99;

        this.angularSpeed = this.angularSpeed*0.9 + random(0,0.04*Math.sqrt(windX*windX+windY*windY));
        this.center.wind();
    }

    centerMouse(){
        this.centeredSpeed += 0.001*random(mouseX - this.center.x)
        this.center.centerMouse();
    }

    /**
     * 绘制整片雪花
     */
    redraw() {
        //中心圆的颜色
        fill(255, 255, 255, this.alpha);
        //绘制中心圆
        ellipse(this.center.x, this.center.y, 0.3*this.d, 0.3*this.d);
        //绘制分支们
        for (let i in this.branches) {
            this.branches[i].redraw();
        }
    }

    /**
     * 创建分支们
     */
    createBranches() {
        let branches = [];
        let x = this.center.x;
        let y = this.center.y;
        //提前声明第一个分支的点数组
        let v = [];
        let d = this.d;
        //随机制造不同的分支，参数是实验的结果
        if (random()<0.5) {
            v = [new Vertex({x:x-0.05*this.d, y:y-0.15*this.d,snow:this}), new Vertex({x:x-0.05*d, y:y-0.25*d,snow:this}), new Vertex({x:x-0.2*d, y:y-0.4*d,snow:this}),
                new Vertex({x:x-0.05*d, y:y-0.35*d,snow:this}), new Vertex({x:x, y:y-0.5*d,snow:this}), new Vertex({x:x+0.05*d,y:y-0.35*d,snow:this}),
                new Vertex({x:x+0.2*d,y:y-0.4*d,snow:this}), new Vertex({x:x+0.05*d,y:y-0.25*d,snow:this}), new Vertex({x:x+0.05*d,y:y-0.15*d,snow:this})];
        } else {
            v = [new Vertex({x:x-0.02*d,y:y-0.15*d,snow:this}), new Vertex({x:x-0.02*d, y:y-0.4*d,snow:this}), new Vertex({x:x-0.1*d,y:y-0.25*d,snow:this})
                ,new Vertex({x:x-0.12*d,y:y-0.3*d,snow:this}),new Vertex({x:x-0.01*d, y:y-0.5*d,snow:this}), new Vertex({x:x,y:y-0.7*d,snow:this})
                ,new Vertex({x:x+0.01*d,y:y-0.5*d,snow:this}), new Vertex({x:x+0.12*d, y:y-0.3*d,snow:this}), new Vertex({x:x+0.1*d,y:y-0.25*d,snow:this})
                ,new Vertex({x:x+0.02*d,y:y-0.4*d,snow:this}), new Vertex({x:x+0.02*d, y:y-0.15*d,snow:this})];

        }

        //构造第一个分支（上方分支）
        branches[0] = new Branch({v:v, r:255, g:240, b:240,snow:this});
        //利用旋转构造其余5个分支，色彩各不相同
        for (let i=1; i<6; i++) {
            branches[i] = new Branch({br:branches[i-1], angle:radians(60), r:random(190, 256), g:random(200, 256), b:random(210, 256),snow:this}); //<>//
        }
        return branches;
    }

    /**
     * 分支上的点绕中心点旋转变换。
     * @param vertex是需要变换的点， angle为正是顺时针变换，为负则逆时针变换
     */
    vertexRotate(vertex, angle) {
        let dx = vertex.x - this.center.x;// x 差
        let dy = vertex.y - this.center.y;// y 差
        let newX = this.center.x + dx*cos(angle) - dy*sin(angle);
        let newY = this.center.y + dx*sin(angle) + dy*cos(angle);
        vertex.x = newX;
        vertex.y = newY;
    }
}

//内部类，记录雪花的各个重要点
class Vertex {

    /**
     * 指定坐标构造点
     */
    constructor(obj) {
        this.snow = obj.snow;
        if (obj.x) {
            this.x = obj.x;
            this.y = obj.y;
        } else {
            this.x = obj.v.x;
            this.y = obj.v.y;
            this.snow.vertexRotate(this, obj.angle);
        }
    }

    /**
     * 更新点的坐标
     */
    update() {
        if(centerMouse)
            this.centerMouse();
        if(hasWind)
            this.wind()
        //下落
        this.fall();
        //围绕雪花中心旋转
        this.snow.vertexRotate(this, this.snow.angularSpeed);
    }

    wind(){
        this.x += this.snow.speedXFromWind;
        this.y += this.snow.speedYFromWind;
    }

    centerMouse(){
        this.x += this.snow.centeredSpeed;
    }

    /**
     * 利用Branch里的beginShape()和endShape()，配合绘制分支
     */
    redraw() {
        vertex(this.x, this.y);
    }

    fall() {
        this.y += this.snow.fallSpeed;
    }
}

class Branch {
    constructor(obj) {
        this.snow = obj.snow;
        if (obj.v) {
            this.vertexs = obj.v;
        } else {
            this.vertexs = [];
            for (let i=0; i<obj.br.vertexs.length; i++) {
                this.vertexs[i] = new Vertex({ v:obj.br.vertexs[i], angle:obj.angle, snow:this.snow});
            }
        }
        this.r = obj.r;
        this.g = obj.g;
        this.b = obj.b;
    }

    /**
     * 更新这个分支
     */
    update() {
        for (let i in this.vertexs) {
            this.vertexs[i].update();
        }
    }

    /**
     * 绘制这个分支
     */
    redraw() {
        //修改填充颜色
        fill(this.r, this.g, this.b, this.snow.alpha);
        //分支是不规则形状
        beginShape();
        for (let i in this.vertexs) {
            this.vertexs[i].redraw();
        }
        endShape(CLOSE);
    }
}
