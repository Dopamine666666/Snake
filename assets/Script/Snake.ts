export class Snake {
    direction: Direction = Direction.RIGHT;
    arr: {x:number, y:number}[] = [{x: 10, y: 10}];
    speed: number = 2;
}

export enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}