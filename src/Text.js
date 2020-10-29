import DisplayObject from './DisplayObject.js';

export default class Text extends DisplayObject {
    constructor(props = {}) {
        super(props);

        this.font = props.font ?? "30px serif";
        this.content = props.content ?? "";

    }

    draw(context) {
        context.beginPath();
        context.font = this.font;
        context.fillStyle = this.fill;
        // this.x  and this.y  наследуется из DisplayObject
        context.fillText(this.content, this.x, this.y);
    }
}