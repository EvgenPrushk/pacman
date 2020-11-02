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
import Group from './Group.js';
import Text from './Text.js';

const scale = 3;



export default async function main() {
    const game = new Game({
        width: 672,
        height: 800,
        background: 'black',

    });

   const party = new Group();
   
   party.offsetY = 50;
   game.stage.add(party);   

   const status = new Text({
    x: game.canvas.width / 2,
    y: 40,
    content: "0 очков",
    fill: 'white',
   });

   status.points = 0;
   game.stage.add(status);

    document.body.append(game.canvas);

    const image = await loadImage('./sets/spritesheet.png');
    const atlas = await loadJSON('./sets/atlas.json');


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

    party.add(maze);
    foods.forEach(food => party.add(food));
    party.add(pacman);
    // вызов через массив
    ghosts.forEach(ghost => party.add(ghost));
    walls.forEach(wall => party.add(wall));
    party.add(leftPortal);
    party.add(rightPortal);
    tablets.forEach(tablet => party.add(tablet));

    game.update = () => {
        const eated = [];
        // Проверка съеденной еды
        for (const food of foods) {
            if (haveCollision(pacman, food)) {
                eated.push(food);
                party.remove(food);
                status.points += 100;
                status.content = `${status.points} очков`;
            }
        }
        // оставляем ту еду, которую не съел pacman
        foods = foods.filter(food => !eated.includes(food));

        // смена направления pacman и ghost
        changeDirection(pacman);
        ghosts.forEach(changeDirection);

        // проверка столновения ghost со стеной
        for (const ghost of ghosts) {
            if (!ghost.play) {
                return
            };

            const wall = getWallCollition(ghost.getNextPosition());
            if (wall) {
                ghost.speedX = 0;
                ghost.speedY = 0;
            }

            if ((ghost.speedX === 0 && ghost.speedY === 0) || Math.random() > 0.95) {
                if (ghost.animation.name === 'up') {
                    ghost.nextDirection = getRandomFrom('left', 'right');
                } else if (ghost.animation.name === 'down') {
                    ghost.nextDirection = getRandomFrom('left', 'right');
                } else if (ghost.animation.name === 'left') {
                    ghost.nextDirection = getRandomFrom('down', 'up');
                } else if (ghost.animation.name === 'right') {
                    ghost.nextDirection = getRandomFrom('down', 'up');
                }
            }

            // столкновение с ghost и проверка голубой ли ghost
            if (pacman.play && ghost.play && haveCollision(pacman, ghost)) {
                if (ghost.isBlue) {
                    ghost.play = false;
                    ghost.speedX = 0;
                    ghost.speedY = 0;
                    party.remove(ghost);
                    // удаляем приведение из массива после его поедания
                    ghosts.splice(ghosts.indexOf(ghosts), 1);
                    status.points += 5000;
                    status.content = `${status.points} очков`;
                }
                else {
                    pacman.speedX = 0;
                    pacman.speedY = 0;
                    pacman.start('die', {
                        onEnd() {
                            pacman.play = false;
                            pacman.stop();
                            party.remove(pacman);
                        }
                    });
                }               
            }
            if (haveCollision(ghost, leftPortal)) {
                ghost.x = atlas.rightPortal.x * scale - ghost.width - 1;
            }
    
            if (haveCollision(ghost, rightPortal)) {
                ghost.x = atlas.leftPortal.x * scale + ghost.width - 1;
            }
        }

        // проверка столновения pacmana со стеной
        const wall = getWallCollition(pacman.getNextPosition());
        if (wall) {
            pacman.start(`wait${pacman.animation.name}`);
            pacman.speedX = 0;
            pacman.speedY = 0;
        }
        //телепортация pacmans
        if (haveCollision(pacman, leftPortal)) {
            pacman.x = atlas.rightPortal.x * scale - pacman.width - 1;
        }

        if (haveCollision(pacman, rightPortal)) {
            pacman.x = atlas.leftPortal.x * scale + pacman.width - 1;
        }
        // поедание таблеток
        for (let i = 0; i < tablets.length; i++) {
            const tablet = tablets[i];
            if (haveCollision(pacman, tablet)) {
                // удаление таблетки из массива таблет
                tablets.splice(i, 1);
                party.remove(tablet);

                ghosts.forEach(ghost => {
                    // оригиналыный цвет приведения
                    ghost.originalAnimations = ghost.animations;
                    ghost.animations = atlas.blueGhost;
                    ghost.isBlue = true;
                    ghost.start(ghost.animation.name);
                })
                setTimeout(() => {
                    ghosts.forEach(ghost => {
                        ghost.animations = ghost.originalAnimations;
                        ghost.isBlue = false;
                        ghost.start(ghost.animation.name);
                    })
                }, 5000);
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
