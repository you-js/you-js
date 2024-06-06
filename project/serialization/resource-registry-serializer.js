import { Animation } from "../../graphic/animation.js";
import { Image } from "../../graphic/image.js";
import { Sprite } from "../../graphic/sprite.js";
import { Serializer } from './serializer.js';

export class ResourceRegistrySerializer extends Serializer {

    serialize(resourceRegistry) {
        const serialized = { '@type': 'resource-registry' };

        serialized.entries = this.#serializeResourceRegistryEntries(resourceRegistry);

        return serialized;
    }

    #serializeResourceRegistryEntries(resourceRegistry) {
        return resourceRegistry.entries.map(
            entry => this.#serializeResourceRegistryEntry(entry)
        );
    }

    #serializeResourceRegistryEntry(entry) {
        return {
            '@type': 'resource-registry-entry',
            id: entry.id,
            name: entry.name,
            resource: this.#serializeResource(entry.resource),
        };
    }

    #serializeResource(resource) {
        if (resource instanceof Image) {
            return this.#serializeImage(resource);
        }
        else if (resource instanceof Sprite) {
            return this.#serializeSprite(resource);
        }
        else if (resource instanceof Animation) {
            return this.#serializeAnimation(resource);
        }
        else {
            throw 'unknown resource type';
        }
    }

    #serializeImage(image) {
        return {
            '@type': 'image',
            source: image.source.match(/.+\/(resources.+)/)[1],
        };
    }

    #serializeSprite(sprite) {
        return {
            '@type': 'sprite',
            source: sprite.source,
            anchor: sprite.anchor,
            scale: sprite.scale,
            sourceArea: sprite.sourceArea,
            sheet: this.#serializeImage(sprite.sheet),
        };
    }

    #serializeAnimation(animation) {
        const frames = animation.frames.map(frame => ({
            sprite: this.#serializeSprite(frame.sprite),
            duration: frame.duration,
        }));

        return {
            '@type': 'animation',
            frames,
            speed: animation.speed,
            loop: animation.loop,
            currentTime: animation.currentTime,
        };
    }
}