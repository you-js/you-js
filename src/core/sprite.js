import { Vector2 } from '../math/vector.js';

export class Sprite {
    constructor(image, { areaPosition = new Vector2(0, 0), areaSize = null, pivot = new Vector2(0.5, 0.5) } = {}) {
        // Handle string path or Image object
        if (typeof image === 'string') {
            const img = new Image();
            img.src = image;
            this.image = img;
            
            // If areaSize is explicitly set, use it for logical size immediately
            if (areaSize) {
                this.width = areaSize.x;
                this.height = areaSize.y;
            } else {
                this.width = 0;
                this.height = 0;
            }

            img.onload = () => {
                // If areaSize wasn't set, default logical size to full image size
                if (!areaSize) {
                    if (this.width === 0) this.width = img.naturalWidth;
                    if (this.height === 0) this.height = img.naturalHeight;
                }
            };
        } else {
            this.image = image;
            if (areaSize) {
                 this.width = areaSize.x;
                 this.height = areaSize.y;
            } else {
                 this.width = image.naturalWidth;
                 this.height = image.naturalHeight;
            }
        }
        
        // Define source area (cutout from the image)
        this.areaPosition = areaPosition instanceof Vector2 ? areaPosition : new Vector2(areaPosition.x, areaPosition.y);
        this.areaSize = areaSize ? (areaSize instanceof Vector2 ? areaSize : new Vector2(areaSize.x, areaSize.y)) : null;
        
        // Pivot/Anchor point (0.5, 0.5 is center)
        this.pivot = pivot instanceof Vector2 ? pivot : new Vector2(pivot.x ?? 0.5, pivot.y ?? 0.5);
    }

    // Render the sprite to the context
    draw(context, width, height) {
        // If image is not loaded yet and we don't have dimensions, skip
        if (!this.image || (this.image.complete === false && this.image.naturalWidth === 0)) return;

        // Determine Source Area
        const imgW = this.image.naturalWidth;
        const imgH = this.image.naturalHeight;

        // If areaSize is not set, we default to the full image size
        // If it IS set, we use it.
        const sX = this.areaPosition.x;
        const sY = this.areaPosition.y;
        
        let sW, sH;
        if (this.areaSize) {
            sW = this.areaSize.x;
            sH = this.areaSize.y;
        } else {
            sW = imgW;
            sH = imgH;
            // Update logical width/height if they were waiting for load
            if (this.width === 0) this.width = sW;
            if (this.height === 0) this.height = sH;
        }

        // Destination Size (defaults to logical sprite size)
        const dW = width ?? this.width;
        const dH = height ?? this.height;

        // Calculate offset based on pivot
        const offsetX = -dW * this.pivot.x;
        const offsetY = -dH * this.pivot.y;

        try {
            if (sW <= 0 || sH <= 0) return;

            context.drawImage(
                this.image,
                sX, sY, sW, sH, // Source rect (cutout)
                offsetX, offsetY, dW, dH // Destination rect (draw on screen)
            );
        } catch (e) {
            // Suppress drawing errors
        }
    }
}