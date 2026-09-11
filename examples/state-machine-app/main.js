import {
    game,
    input,
    Entity,
    Component,
    State,
    StateMachine,
    StateMachineComponent,
} from '../../src/index.js';

class PlayerContext {
    constructor(entity, stateLabel) {
        this.entity = entity;
        this.stateLabel = stateLabel;
        this.speed = 200;
        this.color = 'cyan';
        this.stateMachine = new StateMachine(this);
    }

    get horizontalDirection() {
        return Number(input.isKeyDown('ArrowRight')) - Number(input.isKeyDown('ArrowLeft'));
    }

    get verticalDirection() {
        return Number(input.isKeyDown('ArrowDown')) - Number(input.isKeyDown('ArrowUp'));
    }

    get isMoving() {
        return this.horizontalDirection !== 0 || this.verticalDirection !== 0;
    }
}

class IdleState extends State {
    enter(context) {
        context.color = 'cyan';
        context.stateLabel.textContent = 'idle';
    }

    update(context) {
        if (context.isMoving) context.stateMachine.changeState('move');
    }
}

class MoveState extends State {
    enter(context) {
        context.color = 'orange';
        context.stateLabel.textContent = 'move';
    }

    update(context, deltaTime) {
        if (!context.isMoving) {
            context.stateMachine.changeState('idle');
            return;
        }
        const horizontalDirection = context.horizontalDirection;
        const verticalDirection = context.verticalDirection;
        const directionLength = Math.hypot(horizontalDirection, verticalDirection);
        context.entity.x += (horizontalDirection / directionLength) * context.speed * deltaTime;
        context.entity.y += (verticalDirection / directionLength) * context.speed * deltaTime;
        context.entity.x = Math.max(
            0,
            Math.min(game.width - context.entity.width, context.entity.x)
        );
        context.entity.y = Math.max(
            0,
            Math.min(game.height - context.entity.height, context.entity.y)
        );
    }
}

class PlayerRenderer extends Component {
    constructor(playerContext) {
        super();
        this.playerContext = playerContext;
    }

    draw(context) {
        context.fillStyle = this.playerContext.color;
        context.fillRect(0, 0, this.entity.width, this.entity.height);
    }
}

game.init({ width: 640, height: 360 });
const player = new Entity(100, 150, 32, 32);
const playerContext = new PlayerContext(player, document.getElementById('state-name'));
playerContext.stateMachine.addState('idle', new IdleState()).addState('move', new MoveState());
player.addComponent(new StateMachineComponent(playerContext.stateMachine, 'idle'));
player.addComponent(new PlayerRenderer(playerContext));
game.add(player);
game.start();
