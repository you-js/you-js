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

    send(message, receiver, options) {
        this._owner.send(message, receiver, options);
    }

    receive(message, sender, options) {
        this.onReceive(message, sender, options);
    }

    onCreate() {}
    onDestroy() {}
    onHandle(events) {}
    onUpdate(deltaTime) {}
    onRender(context, screenSize) {}
    onReceive(message, sender, options) {}
}