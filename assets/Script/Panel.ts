import { _decorator, Color, color, Component, director, Event, Graphics, Input, input, instantiate, KeyCode, Node, Prefab, rect, Rect, Sprite, UITransform } from 'cc';
import { Direction, Snake } from './Snake';
const { ccclass, property } = _decorator;

@ccclass('Panel')
export class Panel extends Component {
    @property({type: Prefab, displayName: '格子预制体'})
    private block: Prefab = null;

    @property({type: Number, displayName: '格子大小'})
    private edge: number = 0;

    @property({type: Number, displayName: '游戏视图宽'})
    private panelWidth: number = 0;

    @property({type: Number, displayName: '游戏视图高'})
    private panelHeight: number = 0;

    @property({type: Color, displayName: '默认颜色'})
    private defaultColor: Color = new Color(0, 0, 0);

    @property({type: Color, displayName: '高亮颜色'})
    private highLightColor: Color = new Color(0, 0, 0);

    private blockArr: Node[][] = [];
    private wallArr: {x:number, y:number}[] = [];
    private snake: Snake;
    private food: {x:number, y:number} = {x:20, y: 20};
    protected onLoad(): void {
        //按键监听
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }
    start() {
        this.getComponent(UITransform).width = this.panelWidth * 2;
        this.getComponent(UITransform).height = this.panelHeight * 2;

        for(let i = 0; i < Math.floor(this.panelWidth / this.edge); i++) {
            for(let j = 0; j < Math.floor(this.panelHeight / this.edge); j++) {
                const block = instantiate(this.block);
                block.getComponent(UITransform).width = this.edge;
                block.getComponent(UITransform).height = this.edge;
                this.node.addChild(block);
                block.setPosition(i*this.edge, j*this.edge, 0);
                const graphics = block.getComponent(Graphics);
                graphics.clear();
                graphics.rect(0, 0, this.edge, this.edge);
                graphics.fillColor = this.defaultColor;
                graphics.stroke();
                graphics.fill();
                if(!this.blockArr[i]) {
                    this.blockArr.push([]);
                    this.blockArr[i].push(block);
                }else {
                    this.blockArr[i].push(block);
                }
            }
        }
        this.createWall();
        this.snake = new Snake();
        this.createFood();

    }
    /**监听*/
    private onKeyDown(event) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                if (this.snake.direction != Direction.DOWN) {
                    this.snake.direction = Direction.UP;
                }
            break;
            case KeyCode.KEY_S:
                if (this.snake.direction != Direction.UP) {
                    this.snake.direction = Direction.DOWN;
                }
            break;
            case KeyCode.KEY_A:
                if (this.snake.direction != Direction.RIGHT) {
                    this.snake.direction = Direction.LEFT;
                }
            break;
            case KeyCode.KEY_D:
                if (this.snake.direction != Direction.LEFT) {
                    this.snake.direction = Direction.RIGHT;
                }
            break;
        }
    } 
    /** 创建墙 */
    private createWall() {
        for(let i = 0; i < Math.floor(this.panelWidth / this.edge); i++) {
            for(let j = 0; j < Math.floor(this.panelHeight / this.edge); j++) {
                if(i == 0 || j == 0 || i == Math.floor(this.panelWidth / this.edge) - 1 || j == Math.floor(this.panelHeight / this.edge) - 1) {
                    this.wallArr.push({x: i, y: j});
                }
            }
        };
        this.wallArr.forEach((wall) => {
            const graphics = this.blockArr[wall.x][wall.y].getComponent(Graphics);
            graphics.fillColor = this.highLightColor;
            graphics.fill();
        })
    }

    /** 创建食物 */
    private createFood() {
        // const newX = Math.floor(Math.random() * (this.panelWidth / this.edge)); 
        // const newY = Math.floor(Math.random() * (this.panelHeight / this.edge)); 
        let newX: number = 0;
        let newY: number = 0;
        while(newX == 0 || newX == Math.floor(this.panelWidth / this.edge) - 1 || this.snake.arr.find((pos)=>{return pos.x == newX})) {
            newX = Math.floor(Math.random() * (this.panelWidth / this.edge));
        };
        while(newY == 0 || newY == Math.floor(this.panelHeight / this.edge) - 1 || this.snake.arr.find((pos)=>{return pos.y == newY})) {
            newY = Math.floor(Math.random() * (this.panelHeight / this.edge));
        };
        this.food = {x: newX, y: newY};
        this.highLightBlock(newX, newY);
        console.log('this.food', this.food);
    }
    /**隐藏色块*/  
    private hideBlock(x:number, y:number) {
        const graphics = this.blockArr[x][y].getComponent(Graphics);
        graphics.fillColor = this.defaultColor;
        graphics.fill();
    }
    /**高亮色块*/ 
    private highLightBlock(x:number, y:number) {
        const graphics = this.blockArr[x][y].getComponent(Graphics);
        graphics.fillColor = this.highLightColor;
        graphics.fill();
    }
    /**碰撞检测*/
    private collideCheck() {
        const arr = this.snake.arr;
        const pos = arr[arr.length - 1];
        //撞墙，结束游戏
        if(pos.x == 0 || pos.y == 0 || pos.x == Math.floor(this.panelWidth / this.edge) - 1 || pos.y == Math.floor(this.panelHeight / this.edge) - 1) {
            this.isOver = true;
            return
        }
        //撞到自身，结束游戏
        //  if(arr.find((self, idx) => {return idx != 0 && self == pos})) {
        //     this.isOver = true;
        //     return
        //  }
        // 吃到食物，变长
        if(pos.x == this.food.x && pos.y == this.food.y) {
            // arr.push(this.food);
            const posA = arr[arr.length - 1];
            const posB = arr[arr.length - 2] ?? posA;
            if(posA.x > posB.x && posA.y == posB.y) {
                arr.push({x: posA.x + 1, y: posA.y});
            }
            else if(posA.x < posB.x && posA.y == posB.y) {
                arr.push({x: posA.x - 1, y: posA.y});
            }
            else if(posA.y > posB.y && posA.x == posB.x) {
                arr.push({x: posA.x, y: posA.y + 1});
            }
            else if(posA.y < posB.y && posA.x == posB.x) {
                arr.push({x: posA.x, y: posA.y - 1});
            }
            else if(posA == posB) {
                switch(this.snake.direction) {
                    case Direction.UP:
                        arr.push({x: posA.x, y: posA.y - 1});
                    break;
                    case Direction.DOWN:
                        arr.push({x: posA.x, y: posA.y + 1});
                    break;
                    case Direction.LEFT:
                        arr.push({x: posA.x + 1, y: posA.y})
                    break;
                    case Direction.RIGHT:
                        arr.push({x: posA.x - 1, y: posA.y});
                    break;
                }
            }
            this.createFood();
        }
        // for(let i = 0; i < arr.length; i++) {

        // }
    }

    private counter = 0;
    private interval = 0.1;
    private isOver: boolean = false;
    update(deltaTime: number) {
        if(this.isOver) {
            console.log('Game Over');
            return
        }
        if((this.counter += deltaTime) >= this.interval) {
            this.counter -= this.interval;
            const arr = this.snake.arr;
            switch(this.snake.direction) {
                case Direction.UP:
                    arr.unshift({x: arr[0].x, y: arr[0].y + 1});
                break;
                case Direction.DOWN:
                    arr.unshift({x: arr[0].x, y: arr[0].y - 1});
                break;
                case Direction.LEFT:
                    arr.unshift({x: arr[0].x - 1, y: arr[0].y});
                break;
                case Direction.RIGHT:
                    arr.unshift({x: arr[0].x + 1, y: arr[0].y});
                break;
            }
            this.highLightBlock(arr[0].x, arr[0].y);
            const last = arr.pop();
            this.hideBlock(last.x, last.y);

            this.collideCheck();
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown);
    }
}


