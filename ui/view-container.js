export class ViewContainer {

    _children = [];

    constructor({
        view,
        children=[]
    }) {
        this.view = view;

        children.forEach(childView => this.add(childView, view));
    }

    get children() { return this._children }
    set children(value) {
        if (!(value instanceof Array)) {
            throw `Expected an array, but got ${value}`;
        }

        this._children.forEach(view => view.parent = null);
        this._children.splice(0, this._children.length, ...value);
        this._children.forEach(view => view.parent = this);
    }

    add(childView, view) {
        this._children.push(childView);

        childView.scene = view.scene;
        childView.parent = view;
    }

    remove(childView) {
        const index = this._children.indexOf(childView);

        if (index >= 0) {
            childView.scene = null;
            childView.parent = null;

            this._children.splice(index, 1);
        }
    }

    clear() {
        this._children.forEach(view => {
            view.scene = null;
            view.parent = null;
        });

        this._children.splice(0, this._children.length);
    }

    findById(id) {
        return this._children.find(view => view.id === id);
    }

    findByName(name) {
        return this._children.find(view => view.name === name);
    }

    findAllByName(name) {
        return this._children.filter(view => view.name === name);
    }
}