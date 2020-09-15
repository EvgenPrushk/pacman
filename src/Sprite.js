import DisplayObject from './DisplayObject.js'

export default class Sprite extends DisplayObject {
    constructor(props = {}) {
        super(props);

        this.image = props.image ?? null;
        this.frame = props.frame ?? null;
       
        this.speedX = props.speedX ?? 0;
        this.speedY = props.speedY ?? 0;
    }

    update () {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw (context) {
        context.drawImage(
            this.image,
            
            this.frame.x,
            this.frame.y,
            this.frame.width,
            this.frame.height,

            this.x,
            this.y,
            this.width,
            this.height,          
    
        );

        super.draw(context);

            
    };
};