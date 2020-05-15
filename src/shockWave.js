class ShockWave {
    constructor(x,y,power) {
        this.x = x
        this.y = y
        this.power = power*1.5
        this.radius = 0
    }

    redraw(){
        this.radius += this.power
        push()
        colorMode(HSB,180,100,100)
        translate(this.x,this.y)
        for(let i=0;i<180;i++) {
            noFill()
            stroke(i,70,70,height/this.radius/2)
            arc(0, 0, this.radius, this.radius,TWO_PI*i/180,TWO_PI*(i+1)/180)
        }
        pop()
        return 0.75*this.radius>height
    }
}