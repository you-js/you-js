const States = {
    Instantiated: Symbol('instantiated'),
    Creating: Symbol('creating'),
    Created: Symbol('created'),
    Destroying: Symbol('destroying'),
    Destroyed: Symbol('destroyed'),
};

const StateList = Object.values(States);

export class ObjectState {

    static States = States;

    state = States.Instantiated;

    constructor({
        object,
    }) {
        this.object = object;
    }

    get isInstantiated() { return this.state === States.Instantiated }
    get isCreating() { return this.state === States.Creating }
    get isCreated() { return this.state === States.Created }
    get isDestroying() { return this.state === States.Destroying }
    get isDestroyed() { return this.state === States.Destroyed }

    set(state) {
        if (!(StateList.includes(state))) {
            throw `Invalid state: ${state}`;
        }

        this.state = state;
    }
}