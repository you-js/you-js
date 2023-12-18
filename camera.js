export class Camera {

    screen;
    position;
    scale;

    constructor({
        screen,
        position=[0, 0],
        scale=[1, 1],
    }={}) {
        this.screen = screen;
        this.position = position;
        this.scale = scale;
    }

    get size() {
        const screenSize = this.screen.size;
        const scale = this.scale;
        const cameraSize = screenSize.div(scale);
        return cameraSize;
    }

    set size(value) {
        const screenSize = this.screen.size;
        const cameraSize = value;
        const scale = screenSize.div(cameraSize);
        this.scale = scale;
    }

    toWorld(positionInScreen) {
        const screenSize = this.screen.size;

        const positionInViewport = positionInScreen.div(screenSize);
        const centerInViewport = positionInViewport.sub([0.5, 0.5]);
        const positionInCamera = centerInViewport.mul(screenSize.div(this.scale));
        const positionInWorld = positionInCamera.add(this.position);

        return positionInWorld;
    }

    toScreen(positionInWorld) {
        const screenSize = this.screen.size;

        const positionInCamera = positionInWorld.sub(this.position);
        const centerInViewport = positionInCamera.div(screenSize.div(this.scale));
        const positionInViewport = centerInViewport.add([0.5, 0.5]);
        const positionInScreen = positionInViewport.mul(screenSize);

        return positionInScreen;
    }
}