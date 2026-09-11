import { Game, Scene, Entity, input } from '../../src/index.js';

class Player extends Entity {
    update(deltaTime) {
        this.x += 100 * deltaTime;
    }

    draw(context) {
        context.fillStyle = '#65d8e8';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

class TitleScene extends Scene {
    update() {
        if (input.wasKeyPressed('Enter')) this.game.changeScene(new PlayScene());
    }

    draw(context) {
        drawLabel(context, 'Title', 'Enter: start');
    }
}

class PlayScene extends Scene {
    enter() {
        this.add(new Player(40, 220));
    }

    update() {
        if (input.wasKeyPressed('Enter')) this.game.changeScene(new ResultScene());
    }

    draw(context) {
        drawLabel(context, 'Play', 'Enter: finish');
    }
}

class ResultScene extends Scene {
    update() {
        if (input.wasKeyPressed('Enter')) this.game.changeScene(new PlayScene());
    }

    draw(context) {
        drawLabel(context, 'Result', 'Enter: restart with a new player');
    }
}

function drawLabel(context, title, instruction) {
    context.fillStyle = 'white';
    context.font = '32px sans-serif';
    context.fillText(title, 40, 70);
    context.font = '18px sans-serif';
    context.fillText(instruction, 40, 110);
}

const game = new Game(new TitleScene());
game.init({ width: 640, height: 360 });
game.start();
