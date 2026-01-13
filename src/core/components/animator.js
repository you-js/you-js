import { Component } from '../component.js';
import { Animation } from '../animation.js';

export class Animator extends Component {
    constructor({ animations = {}, defaultAnimation = null, speed = 1 } = {}) {
        super();
        this.animations = animations; // Dictionary: 'idle': AnimationInstance
        this.speed = speed;
        this.currentAnimation = null;
        this.currentAnimationName = null;

        if (defaultAnimation && this.animations[defaultAnimation]) {
            this.play(defaultAnimation);
        } else {
            // Pick first one if available
            const keys = Object.keys(animations);
            if (keys.length > 0) {
                this.play(keys[0]);
            }
        }
    }

    addAnimation(name, animation) {
        if (!(animation instanceof Animation)) {
            throw new Error('Animator.addAnimation: Argument must be an instance of Animation');
        }
        this.animations[name] = animation;
        // If nothing playing, play this
        if (!this.currentAnimation) {
            this.play(name);
        }
    }

    play(name) {
        if (this.currentAnimationName === name) return;

        const anim = this.animations[name];
        if (anim) {
            this.currentAnimation = anim;
            this.currentAnimationName = name;
            anim.reset();
        } else {
            console.warn(`Animator: Animation '${name}' not found.`);
        }
    }

    update(deltaTime) {
        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime * this.speed);
        }
    }

    draw(context) {
        if (this.currentAnimation && this.entity) {
            const sprite = this.currentAnimation.currentSprite;
            // Draw sprite at entity's size (or sprite's own size if desired? Usually entity size controls bounds)
            // But preserving aspect ratio might be important.
            // For now, stretch to entity width/height (which is scaled by transform)
            // Note: context is already transformed. width/height in draw should be the BASE size.
            // But wait, Entity.draw applies transform scale.
            // So we should draw with the BASE dimensions (Entity._width/height).
            
            // However, Entity width/height getters return scaled values.
            // We need the raw dimensions for drawing inside the scaled context?
            // Actually, if we draw rect 0,0,100,100 in a 2x scaled context, it appears as 200,200.
            // So we should pass the UN-SCALED base dimensions.
            // But Entity class aliases width/height to getters that INCLUDE scale.
            // This is tricky.
            // Let's rely on Entity properties assuming they represent the visual bounds.
            // If the user sets Entity width=100 and Scale=2, result is 200.
            // If we draw 100 inside 2x scale context, result is 200. Consistent.
            // BUT, if we use entity.width (which is 200) inside 2x scale, result is 400! Double scaling.
            
            // Solution: We need the 'base' size of the entity.
            // In Entity.js, we stored it as _width, _height.
            // But components don't access private/underscored props ideally.
            // Let's assume for now we draw at sprite's native size if not specified?
            // Or use a convention.
            // Most engines: SpriteRenderer has a size, OR it matches Entity size.
            
            // Let's assume we want to match Entity's *visual* bounds.
            // Since context is scaled, we should draw at (width / scaleX).
            // Or simpler: Just draw the sprite's width/height and let the transform handle scaling?
            // If we want the entity to be 32x32, and scale is 1, we draw 32x32.
            
            // Let's use the Sprite's native size by default.
            sprite.draw(context); 
        }
    }
}
