import { Component } from '../component.js';

export class BoxCollider extends Component {
    constructor({ width, height, offsetX = 0, offsetY = 0, anchorX = 0.5, anchorY = 0.5, isStatic = false } = {}) {
        super();
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.anchorX = anchorX;
        this.anchorY = anchorY;
        this.isStatic = isStatic;
        
        // Collisions that happened this frame
        this.collisions = [];
    }

    onAttach(entity) {
        super.onAttach(entity);
        // If width/height not specified, try to match entity size
        if (this.width === undefined) this.width = this.entity.width || 32;
        if (this.height === undefined) this.height = this.entity.height || 32;
    }

    // Get absolute bounds (AABB) - Does NOT support rotation for physics AABB check yet
    // This is axis-aligned bounding box. If the entity rotates, the AABB should grow to encompass it.
    // However, for simple AABB physics, we often ignore rotation or use a bounding circle/OBB.
    // For now, let's keep it simple AABB centered on position.
    get bounds() {
        const w = this.width;
        const h = this.height;
        
        // World position is center (if anchor 0.5)
        // Entity x,y is the pivot.
        
        // If entity is rotated, AABB should theoretically resize.
        // Implementing simple AABB for now, assuming no rotation for physics body
        // or accepting that the box rotates with the sprite visually but physics box stays axis aligned relative to pivot.
        // Wait, if box stays axis aligned, it shouldn't rotate.
        
        // Let's assume BoxCollider is always AABB in world space centered on Entity.
        // Calculating Top-Left world coordinate:
        const x = this.entity.x + this.offsetX - (w * this.anchorX);
        const y = this.entity.y + this.offsetY - (h * this.anchorY);

        return {
            x: x,
            y: y,
            width: w,
            height: h
        };
    }
    
    // Draw debug outline
    draw(context) {
        if (!this.entity) return;
        
        // Context is already transformed by Entity (translated/rotated/scaled)
        // We need to draw the collider relative to the entity's pivot (0,0 local)
        
        const w = this.width;
        const h = this.height;
        const x = this.offsetX - (w * this.anchorX);
        const y = this.offsetY - (h * this.anchorY);

        context.save();
        context.strokeStyle = 'lime';
        context.lineWidth = 1;
        context.strokeRect(x, y, w, h);
        context.restore();
    }
}
