export class Camera {

    constructor(screen) {
        this.screen = screen;
        this.position = [0, 0];
        this.size = screen.size;
    }

    get scale() {
        const screenSize = this.screen.size;
        const cameraSize = this.size;
        const scale = screenSize.div(cameraSize);
        return scale;
    }

    set scale(value) {
        const screenSize = this.screen.size;
        const scale = value;
        const cameraSize = screenSize.div(scale);
        this.size = cameraSize;
    }

    toWorld(positionInScreen) {
        const screenSize = this.screen.size;
        const cameraSize = this.size;

        const positionInViewport = positionInScreen.div(screenSize);
        const centerInViewport = positionInViewport.sub([0.5, 0.5]);
        const positionInCamera = centerInViewport.mul(cameraSize);
        const positionInWorld = positionInCamera.add(this.position);

        return positionInWorld;
    }

    toScreen(positionInWorld) {
        const screenSize = this.screen.size;
        const cameraSize = this.size;

        const positionInCamera = positionInWorld.sub(this.position);
        const centerInViewport = positionInCamera.div(cameraSize);
        const positionInViewport = centerInViewport.add([0.5, 0.5]);
        const positionInScreen = positionInViewport.mul(screenSize);

        return positionInScreen;
    }
}