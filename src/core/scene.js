import { Entity } from './entity.js';

export class Scene {
    constructor() {
        this.game = null;
        this.entities = [];
        this.entitiesToAdd = [];
        this.entitiesToRemove = [];
        this._hasEntered = false;
        this._isClosed = false;
    }

    enter() {}
    exit() {}
    update(_deltaTime) {}
    draw(_context) {}

    add(entity) {
        if (this._isClosed) throw new Error('Scene.add: scene is closed');
        if (!(entity instanceof Entity) || entity.isDestroyed) {
            throw new Error('Scene.add: expected a live Entity');
        }
        if (!this.entities.includes(entity) && !this.entitiesToAdd.includes(entity)) {
            this.entitiesToAdd.push(entity);
        }
        return entity;
    }

    remove(entity) {
        if (this._isClosed) throw new Error('Scene.remove: scene is closed');
        if (!this.entitiesToRemove.includes(entity)) this.entitiesToRemove.push(entity);
    }

    _processLifecycle() {
        const additions = this.entitiesToAdd.splice(0);
        for (const entity of additions) {
            if (entity.isDestroyed) continue;
            this.entities.push(entity);
            entity.onAdd(this.game);
            entity.start();
        }
        for (const entity of this.entities) {
            if (entity.isDestroyed) this.remove(entity);
        }
        const removals = this.entitiesToRemove.splice(0);
        for (const entity of removals) {
            const index = this.entities.indexOf(entity);
            if (index !== -1) {
                this.entities.splice(index, 1);
                entity.onRemove(this.game);
            }
        }
    }

    _updateEntities(deltaTime) {
        for (const entity of this.entities) entity.update(deltaTime);
    }

    _drawEntities(context) {
        for (const entity of this.entities) entity.draw(context);
    }

    _close() {
        try {
            if (this._hasEntered) this.exit();
        } finally {
            this._isClosed = true;
            try {
                for (const entity of new Set([...this.entities, ...this.entitiesToAdd])) {
                    if (!entity.isDestroyed) entity.destroy();
                    if (this.entities.includes(entity)) entity.onRemove(this.game);
                }
            } finally {
                this.entities.length = 0;
                this.entitiesToAdd.length = 0;
                this.entitiesToRemove.length = 0;
                this.game = null;
            }
        }
    }
}
