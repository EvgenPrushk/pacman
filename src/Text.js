import DisplayObject from './DisplayObject.js';

export default class Text extends DisplayObject {
    constructor(props = {}) {
        super(props);

        this.font = props.font ?? "30px serif"
        this.content = props.content ?? ""
        this.fill = props.fill ?? "white"

    }

    draw(context) {
        context.beginPath();
        context.font = this.font;
        context.fillStyle = this.fill;
        context.textAlign = 'center';
        // this.x  and this.y  наследуется из DisplayObject
        context.fillText(this.content, this.x, this.y);
    }
}