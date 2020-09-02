import DisplayObject from './DisplayObject.js'

export default class Sprite extends DisplayObject {
    constructor(props = {}) {
        super(props);

        this.image = props.image ?? null;
        this.frame = props.frame ?? null;
        this.debug = props.debug ?? false;
    }

    update () {
        
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
    
        )

        if (this.debug) {
            context.beginPath();
            context.rect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'rgba(0, 0, 0, 0.3)';
            context.fill();

            context.beginPath();
            context.rect(this.x, this.y, this.width, this.height);
            context.lineWidt = 3;
            context.strokeStyle = 'green';
            context.stroke();
        }
    }
    
}