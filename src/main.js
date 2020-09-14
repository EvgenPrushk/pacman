import Game from './Game.js';
import { loadImage, loadJSON } from './Loader.js';
import Sprite from './Sprite.js';
import Cinematic from './Cinematic.js';

const scale = 3;



export default async function main() {
    const game = new Game({
        width: 672,
        height: 644,
        background: 'black',

    })

    document.body.append(game.canvas);

    const image = await loadImage('/sets/spritesheet.png');
    const atlas = await loadJSON('/sets/atlas.json');

    // const  maze = new Sprite({
    //     image,
    //     x: 0,
    //     y: 0,
    //     width: 224,
    //     height: 255,

    //     frame: {
    //     x: 0,
    //     y: 0,
    //     width: 224,
    //     height: 255,
    //     },

    // })

    // game.stage.add(maze);




    // const redGhost = new Cinematic({
    //     image,
    //     x: 200,
    //     y: 200,
    //     width: 50,
    //     height: 50,
    //     animations: atlas.redGhost,
       
    // });
    // redGhost.start('left');

    const maze = new Sprite({
        image,
        x: 0,
        y: 0,
        width: atlas.maze.width * scale,
        height: atlas.maze.height * scale,
        frame: atlas.maze,
    });

    game.canvas.width = maze.width;
    game.canvas.height = maze.height;
// маштабирование еды обратить внимание
    const foods = atlas.maze.foods
    .map(food => ({
        ...food,
        x: food.x * scale,
        y: food.y * scale,
        width: food.width * scale,
        height: food.height  * scale,
    }))

    .map(food => new Sprite({
        image,
        frame: atlas.food,
        ...food,

    }));

    const pacman = new Cinematic({
        image,
        x: atlas.position.pacman.x * scale,
        y: atlas.position.pacman.y * scale,
        width: 13 * scale,
        height: 13 * scale,
        animations: atlas.pacman,
      // debug: true,
       speedX: 1,
    });
    pacman.start('right');

    const ghosts = ['red', 'pink', 'banana', 'turquoise']
    .map(color =>{
        const ghost = new Cinematic({
            image,
            x: atlas.position[color].x * scale,
            y: atlas.position[color].y * scale,
            width: 13 * scale,
            height: 13 * scale,
            // использование шаблон строк цвет + приведение
            animations: atlas[`${color}Ghost`],
            debug: true,
        });
        // позиция задает по цвету
        ghost.start(atlas.position[color].direction);
        return ghost;
    });
    
    game.stage.add(maze);
    foods.forEach(food => game.stage.add(food));
    game.stage.add(pacman);
    // вызов через массив
    ghosts.forEach(ghost => game.stage.add(ghost));
    
    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft'){
            pacman.start('left');
            pacman.speedX = - 1;
            pacman.speedY = 0;
        } else if (event.key === 'ArrowRight'){
            pacman.start('right');
            pacman.speedX = 1;
            pacman.speedY = 0;
        } else if (event.key === 'ArrowUp'){
            pacman.start('up');
            pacman.speedX = 0;
            pacman.speedY = -1;
            
        } else if (event.key === 'ArrowDown'){
            pacman.start('down');
            pacman.speedX = 0;
            pacman.speedY = 1;
        }
    });
   


}