export function haveCollision (a, b) {
    const aPoints = [
        {x: a.x, y: a.y},
        {x: a.x + a.width, y: a.y},
        {x: a.x, y: a.y + a.height},
        {x: a.x + a.width, y: a.y + a.height},
    ];

    const bPoints = [
        {x: b.x, y: b.y},
        {x: b.x + b.width, y: b.y},
        {x: b.x, y: b.y + b.heighb},
        {x: b.x + b.width, y: b.y + b.height},
    ];

    for (const {x, y} of aPoints) {
        
    }