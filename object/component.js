export class Component {

    _owner = null;

    get owner() { return this._owner }

    create() {
        this.onCreate();
    }

    destroy() {
        this.onDestroy();
    }

    handle(events) {
        this.onHandle(events);
    }

    update(deltaTime) {
        this.onUpdate(deltaTime);
    }

    render(context, screenSize) {
        this.onRender(context, screenSize);
    }

    onCreate() {}
    onDestroy() {}
    onHandle(events) {}
    onUpdate(deltaTime) {}
    onRender(context, screenSize) {}
}