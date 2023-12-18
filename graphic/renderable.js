export class Renderable {

    constructor({
        source,
    }={}) {
        this.source = source;
    }

    get size() { return null }

    render(context, position=[0, 0], scale=[1, 1]) {
        throw 'not implemented';
    }
}