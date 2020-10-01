import Game from './Game.js';
import {
    loadImage,
    loadJSON
} from './Loader.js';
import Sprite from './Sprite.js';
import Cinematic from './Cinematic.js';
import {
    haveCollision, getRandomFrom
} from './Additional.js';
import DisplayObject from './DisplayObject.js';

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
    let foods = atlas.maze.foods
        .map(food => ({
            ...food,
            x: food.x * scale,
            y: food.y * scale,
            height: food.height * scale,
            width: food.width * scale,
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
        debug: true,
        speedX: 1,
    });
    pacman.start('right');

    const ghosts = ['red', 'pink', 'banana', 'turquoise']
        .map(color => {
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
            ghost.nextDirection = atlas.position[color].direction;
            ghost.isBlue = false;
            return ghost;
        });

    const walls = atlas.maze.walls.map(wall => new DisplayObject({
        // передача всех wall
        x: wall.x * scale,
        y: wall.y * scale,
        height: wall.height * scale,
        width: wall.width * scale,
        debug: true,
    }));

    const leftPortal = new DisplayObject({
        x: atlas.leftPortal.x * scale,
        y: atlas.leftPortal.y * scale,
        width: atlas.leftPortal.width * scale,
        height: atlas.leftPortal.height * scale,
        debug: true
    });

    const rightPortal = new DisplayObject({
        x: atlas.rightPortal.x * scale,
        y: atlas.rightPortal.y * scale,
        width: atlas.rightPortal.width * scale,
        height: atlas.rightPortal.height * scale,
        debug: true,
    });

    const tablets = atlas.position.tablets
        .map(tablet => new Sprite({
            image,
            frame: atlas.tablet,
            x: tablet.x * scale,
            y: tablet.y * scale,
            width: tablet.width * scale,
            height: tablet.height * scale,
        }));

    game.stage.add(maze);
    foods.forEach(food => game.stage.add(food));
    game.stage.add(pacman);
    // вызов через массив
    ghosts.forEach(ghost => game.stage.add(ghost));
    walls.forEach(wall => game.stage.add(wall));
    game.stage.add(leftPortal);
    game.stage.add(rightPortal);
    tablets.forEach(tablet => game.stage.add(tablet));

    game.update = () => {
        const eated = [];
        // Проверка съеденной еды
        for (const food of foods) {
            if (haveCollision(pacman, food)) {
                eated.push(food);
                game.stage.remove(food);
            }
        }
        // оставляем ту еду, которую не съел pacman
        foods = foods.filter(food => !eated.includes(food));

        // смена направления pacman и ghost
        changeDirection(pacman);
        ghosts.forEach(changeDirection);

        // проверка столновения ghost со стеной
        for (const ghost of ghosts) {
            const wall = getWallCollition(ghost.getNextPosition());
            if (wall) {
                ghost.speedX = 0;
                ghost.speedY = 0;
            }
            if (ghost.speedX === 0 && ghost.speedY === 0) {

                if (ghost.animation.name === 'up') {
                    ghost.nextDirection = getRandomFrom('left', 'right', 'down');
                } else if (ghost.animation.name === 'down') {
                    ghost.nextDirection = getRandomFrom('left', 'right', 'up');
                } else if (ghost.animation.name === 'left') {
                    ghost.nextDirection = getRandomFrom('down', 'right', 'up');
                } else if (ghost.animation.name === 'right') {
                    ghost.nextDirection = getRandomFrom('left', 'down', 'up');
                }
            }

            if (pacman.play && ghost.play && haveCollision(pacman, ghost)) {
                if (ghost.isBlue) {
                    ghost.play = false;
                    ghost.speedX = 0;
                    ghost.speedY = 0;
                    game.stage.remove(ghost);
                }
               else {
                pacman.speedX = 0;
                pacman.speedY = 0;
                pacman.start('die', {
                    onEnd() {
                        pacman.play = false;
                        pacman.stop();
                        game.stage.remove(pacman);
                    }
                });
               }
            }
        }

        // проверка столновения pacmana со стеной
        const wall = getWallCollition(pacman.getNextPosition());
        if (wall) {
            pacman.start(`wait${pacman.animation.name}`);
            pacman.speedX = 0;
            pacman.speedY = 0;

        }

        if (haveCollision(pacman, leftPortal)) {
            pacman.x = atlas.rightPortal.x * scale - pacman.width;

        }

        if (haveCollision(pacman, rightPortal)) {
            pacman.x = atlas.leftPortal.x * scale + pacman.width;

        }

        for (let i = 0; i < tablets.length; i++) {
            const tablet = tablets[i];
            if (haveCollision(pacman, tablet)) {
                // удаление таблетки из массива таблет
                tablets.splice(i, 1);
                game.stage.remove(tablet);

                ghosts.forEach(ghost => {
                    ghost.animations = atlas.blueGhost;
                    ghost.isBlue = true;
                    ghost.start(ghost.animation.name);
                })

                break;
            }
        }

    };

    document.addEventListener('keydown', event => {
        if (!pacman.play) {
            return;
        }
        if (event.key === 'ArrowLeft') {
            pacman.nextDirection = 'left';
        } else if (event.key === 'ArrowRight') {
            pacman.nextDirection = 'right';
        } else if (event.key === 'ArrowUp') {
            pacman.nextDirection = 'up';
        } else if (event.key === 'ArrowDown') {
            pacman.nextDirection = 'down';
        }
    });


    function getWallCollition(obj) {
        for (const wall of walls) {
            if (haveCollision(wall, obj)) {
                return wall;
            }
        }
        return null;
    }

    function changeDirection(sprite) {
        if (!sprite.nextDirection) {
            return;
        }
        if (sprite.nextDirection === 'up') {
            sprite.y -= 10;
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null;
                sprite.speedX = 0;
                sprite.speedY = -1;
                sprite.start('up');
            }
            sprite.y += 10;
        } else if (sprite.nextDirection === 'down') {
            sprite.y += 10;
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null;
                sprite.speedX = 0;
                sprite.speedY = 1;
                sprite.start('down');
            }
            sprite.y -= 10;
        } else if (sprite.nextDirection === 'left') {
            sprite.x -= 10;
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null;
                sprite.speedX = -1;
                sprite.speedY = 0;
                sprite.start('left');
            }
            sprite.x += 10;
        } else if (sprite.nextDirection === 'right') {
            sprite.x += 10;
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null;
                sprite.speedX = 1;
                sprite.speedY = 0;
                sprite.start('right');
            }
            sprite.x -= 10;
        }

    }
}