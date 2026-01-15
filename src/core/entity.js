import { Component } from './component.js';
import { Transform } from './components/transform.js';
import { Vector2 } from '../math/vector.js';

export class Entity {
    constructor(x = 0, y = 0, width = 32, height = 32) {
        // Base dimensions (often used for collision/rendering bounds logic)
        // Note: x, y are now effectively aliases for the Transform component's position
        // but we keep them for backward compatibility during migration and ease of access.
        this._width = width;
        this._height = height;
        
        this.components = [];
        this.isDestroyed = false;
        this.isEnabled = true;

        // Auto-add Transform component
        this.transform = new Transform({ position: new Vector2(x, y) });
        this.addComponent(this.transform);
    }

    // --- Transform Aliases for Convenience ---
    get x() { return this.transform.localPosition.x; }
    set x(value) { this.transform.localPosition.x = value; }

    get y() { return this.transform.localPosition.y; }
    set y(value) { this.transform.localPosition.y = value; }

    get rotation() { return this.transform.localRotation; }
    set rotation(value) { this.transform.localRotation = value; }

    get scale() { return this.transform.localScale; }
    set scale(v) { this.transform.localScale = v; }

    get width() { return this._width * this.transform.localScale.x; }
    set width(value) { this._width = value; } // Setting base width

    get height() { return this._height * this.transform.localScale.y; }
    set height(value) { this._height = value; } // Setting base height


    addComponent(component) {
        if (!(component instanceof Component)) {
            throw new Error('Entity.addComponent: argument must be an instance of Component');
        }
        
        // Prevent adding multiple transforms
        if (component instanceof Transform && this.getComponent(Transform)) {
             // We already have a transform (created in constructor), so we update it instead of replacing
             // unless this IS the one we added in constructor.
             const existing = this.getComponent(Transform);
             if (existing !== component) {
                 existing.localPosition = component.localPosition;
                 existing.localRotation = component.localRotation;
                 existing.localScale = component.localScale;
                 return this;
             }
        }

        this.components.push(component);
        component.onAttach(this);
        return this;
    }

    getComponent(componentClass) {
        return this.components.find(c => c instanceof componentClass);
    }

    hasComponent(componentClass) {
        return this.components.some(c => c instanceof componentClass);
    }


    removeComponent(component) {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
            component.onDetach?.();
        }
    }

    update(deltaTime) {
        if (!this.isEnabled) return;
        
        for (const component of this.components) {
            if (component.isEnabled !== false) {
                component.update(deltaTime);
            }
        }
    }

    draw(context) {
        if (!this.isEnabled) return;

        // Save context state for hierarchical transformation
        context.save();

        // Apply Global Transformation
        // Note: For a pure 2D engine, usually we transform by the entity's global state
        // before drawing components.
        const globalPos = this.transform.globalPosition;
        const globalRot = this.transform.globalRotation;
        const globalScale = this.transform.globalScale;

        context.translate(globalPos.x, globalPos.y);
        context.rotate(globalRot * Math.PI / 180);
        context.scale(globalScale.x, globalScale.y);

        // Draw components (relative to 0,0 since we already translated context)
        // Components should draw at relative offsets, usually centered or top-left depending on convention.
        // Legacy 'x,y' was top-left.
        for (const component of this.components) {
            if (component.isEnabled !== false) {
                component.draw(context);
            }
        }

        context.restore();
    }

    destroy() {
        this.isDestroyed = true;
        this.isEnabled = false;
        
        // Notify components
        for (const component of this.components) {
            component.onDestroy?.();
        }
        
        // Unparent
        if (this.transform.parent) {
            this.transform.setParent(null);
        }
    }
}
