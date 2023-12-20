const STATE = Symbol('object-state');
const STATES = {
    INSTANTIATED: Symbol('object-instantiated'),
    CREATED: Symbol('object-created'),
    DESTROYED: Symbol('object-destroyed'),
};

export class Object {

    static STATE = STATE;
    static STATES = STATES;

    constructor() {
        this[STATE] = STATES.INSTANTIATED;
    }

    get instantiated() { return this[STATE] === STATES.INSTANTIATED }
    get created() { return this[STATE] === STATES.CREATED }
    get destroyed() { return this[STATE] === STATES.DESTROYED }

    create() {
        if (!this.instantiated) { return }

        this[STATE] = STATES.CREATED;

        this.onCreate();
    }

    onCreate() {}

    destroy() {
        if (!this.created) { return }

        this[STATE] = STATES.DESTROYED;

        this.onDestroy();
    }

    onDestroy() {}
}