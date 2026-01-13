import { Component } from '../component.js';
import { Vector2 } from '../../math/vector.js';

export class Transform extends Component {
    constructor({ position = new Vector2(0, 0), rotation = 0, scale = new Vector2(1, 1) } = {}) {
        super();
        
        // Local transformations
        this.localPosition = position instanceof Vector2 ? position : new Vector2(position.x, position.y);
        this.localRotation = rotation; // In Degrees
        this.localScale = scale instanceof Vector2 ? scale : new Vector2(scale.x || 1, scale.y || 1);

        // Hierarchy
        this.parent = null;
        this.children = [];
    }

    /**
     * Sets the parent of this transform.
     * @param {Transform|Entity} parent The parent transform or entity (will try to find transform).
     */
    setParent(parent) {
        if (this.parent) {
            this.parent.removeChild(this);
        }

        let parentTransform = parent;
        if (parent && parent.constructor.name === 'Entity') {
            parentTransform = parent.getComponent(Transform);
            if (!parentTransform) {
                console.warn("Entity passed to setParent does not have a Transform component.");
                return;
            }
        }

        this.parent = parentTransform;
        if (this.parent) {
            this.parent.addChild(this);
        }
    }

    addChild(child) {
        if (child instanceof Transform) {
            if (!this.children.includes(child)) {
                this.children.push(child);
                child.parent = this;
            }
        }
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    // --- Global Getters (Recursive) ---

    get globalPosition() {
        if (!this.parent) return this.localPosition.clone();

        // Simple 2D transformation hierarchy logic
        // GlobalPos = ParentGlobalPos + (ParentGlobalScale * (Rotated LocalPos))
        
        // 1. Get parent's global properties
        const parentPos = this.parent.globalPosition;
        const parentRot = this.parent.globalRotation * (Math.PI / 180); // To Radians
        const parentScale = this.parent.globalScale;

        // 2. Scale local position
        const scaledX = this.localPosition.x * parentScale.x;
        const scaledY = this.localPosition.y * parentScale.y;

        // 3. Rotate local position by parent's rotation
        const rotatedX = scaledX * Math.cos(parentRot) - scaledY * Math.sin(parentRot);
        const rotatedY = scaledX * Math.sin(parentRot) + scaledY * Math.cos(parentRot);

        // 4. Add to parent's position
        return new Vector2(parentPos.x + rotatedX, parentPos.y + rotatedY);
    }

    get globalRotation() {
        if (!this.parent) return this.localRotation;
        return this.parent.globalRotation + this.localRotation;
    }

    get globalScale() {
        if (!this.parent) return this.localScale.clone();
        const parentScale = this.parent.globalScale;
        return new Vector2(this.localScale.x * parentScale.x, this.localScale.y * parentScale.y);
    }

    // --- Helper Methods ---
    
    translate(x, y) {
        this.localPosition.x += x;
        this.localPosition.y += y;
    }

    rotate(angle) {
        this.localRotation += angle;
    }
}
