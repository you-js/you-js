import { ComponentContainer } from './component-container.js';
import { ObjectContainer } from './object-container.js';
import { ObjectState } from './object-state.js';
import { ObjectCreator } from './object-creator.js';
import { ObjectDestroyer } from './object-destroyer.js';
import { ObjectEventHandler } from './object-event-handler.js';
import { ObjectUpdater } from './object-updater.js';
import { ObjectRenderer } from './object-renderer.js';
import { Transform } from "./components/transform.js";

export class Object {

    _parent = null;

    constructor({
        scene=null,
        id=null,
        name=null,
        enable=true,
        components=[],
        objects=[],
    }) {
        this.scene = scene;
        this.id = id ?? crypto.randomUUID();
        this.name = name;
        this.enable = enable;

        this.componentContainer = new ComponentContainer({ object: this, components });
        this.objectContainer = new ObjectContainer({ object: this, objects });

        this.state = new ObjectState({ object: this });
        this.creator = new ObjectCreator({ object: this });
        this.destroyer = new ObjectDestroyer({ object: this });
        this.eventHandler = new ObjectEventHandler({ object: this });
        this.updater = new ObjectUpdater({ object: this });

        const transform = this.componentContainer.find(Transform);

        this.transform = transform;
        this.renderer = new ObjectRenderer({ object: this, transform });
    }

    get parent() { return this._parent }
    get isAdded() { return this.parent != null }

    get positionInGlobal() {
        const position = this.transform?.position ?? [0, 0];

        return (
            this._parent == null
            ? position
            : this._parent.positionInGlobal.add(position)
        );
    }

    add(...objects) {
        this.objectContainer.add(...objects);
    }

    remove(...objects) {
        this.objectContainer.remove(...objects);
    }

    findObjectById(id) {
        return this.objectContainer.findById(id);
    }

    findObjectByName(name) {
        return this.objectContainer.findByName(name);
    }

    findObjectsByName(name) {
        return this.objectContainer.findAllByName(name);
    }

    addComponent(...types) {
        this.componentContainer.add(...types);

        if (this.componentContainer.has(Transform)) {
            const transform = this.componentContainer.find(Transform);

            this.transform = transform;
            this.renderer.transform = transform;
        }
    }

    removeComponent(...types) {
        this.componentContainer.remove(...types);

        if (!this.componentContainer.has(Transform)) {
            this.transform = null;
            this.renderer.transform = null;
        }
    }

    findComponent(type) {
        return this.componentContainer.find(type);
    }

    requireComponent(type) {
        if (this.componentContainer.has(type)) { return }

        throw `Component "${type.name}" is required.`;
    }

    create() {
        if (!this.state.isInstantiated) { return }

        this.state.set(ObjectState.States.Creating);
        this.creator.create();
        this.state.set(ObjectState.States.Created);
    }

    destroy() {
        if (!this.state.isCreated) { return }

        this.state.set(ObjectState.States.Destroying);
        this.destroyer.destroy();
        this._parent?.objectContainer.invalidate();
        this.state.set(ObjectState.States.Destroyed);
    }

    handle(events) {
        if (!this.enable) { return }
        if (!this.state.isCreated) { return }

        this.eventHandler.handle(events);
    }

    update(deltaTime) {
        if (!this.enable) { return }
        if (!this.state.isCreated) { return }

        this.updater.update(deltaTime);
    }

    render(context, screenSize) {
        if (!this.enable) { return }
        if (!this.state.isCreated) { return }

        this.renderer.render(context, screenSize);
    }
}