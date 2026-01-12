import { Component } from '../component.js';

export class BoxCollider extends Component {
    constructor({ width, height, offsetX = 0, offsetY = 0, isStatic = false } = {}) {
        super();
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.isStatic = isStatic;
        
        // Collisions that happened this frame
        this.collisions = [];
    }

    onAttach(entity) {
        super.onAttach(entity);
        // If width/height not specified, try to match entity size
        if (this.width === undefined) this.width = this.entity.width;
        if (this.height === undefined) this.height = this.entity.height;
    }

    // Get absolute bounds
    get bounds() {
        return {
            x: this.entity.x + this.offsetX,
            y: this.entity.y + this.offsetY,
            width: this.width,
            height: this.height
        };
    }
}
