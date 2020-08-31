import Game from './Game.js';
import { loadImage, loadJSON} from './Loader.js';



export default async function main () {
    const game = new Game({
        width: 500,
        height: 500,
        background: 'black',

    })

    document.body.append(game.canvas);

    const image = await loadImage('/sets/spritesheet.png');
    const atlas = await loadJSON('/sets/atlas.json');
        console.log(atlas); 
}