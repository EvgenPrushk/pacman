import Sprite from './Sprite.js'

export default class Cinematic extends Sprite {
    constructor (props = {}) {
        super(props);

        this.animations = props.animations ?? {}
        this.animation = null;

        this.cooldown = 0;
        this.timer = 0;
        this.frameNumber = 0;
    }

    start (name) {
        const animation = this.animations.find(x => x.name === name)

        if (animation && this.animation !== animation) {
            this.animation = animation;
        }
    }

    
}