import { Animation } from "../../graphic/animation.js";
import { Image } from "../../graphic/image.js";
import { Sprite } from "../../graphic/sprite.js";
import { ProjectResourceRegistryEntry } from '../project-resource-registry-entry.js';
import { ProjectResourceRegistry } from '../project-resource-registry.js';
import { Deserializer } from './deserializer.js';

const RESOURCE_ORDER = ['image', 'sprite', 'animation'];

export class ResourceRegistryDeserializer extends Deserializer {

    deserialize(serializedResourceRegistry) {
        serializedResourceRegistry.entries.sort((a, b) => {
            return RESOURCE_ORDER.indexOf(a.resource['@type']) - RESOURCE_ORDER.indexOf(b.resource['@type']);
        });

        const entries = this.#deserializeResourceRegistryEntriesWithoutResoureInstantiation(serializedResourceRegistry);

        const deserialized = new ProjectResourceRegistry({
            entries,
        });

        this.#deserializeResources(deserialized, serializedResourceRegistry);

        return deserialized;
    }

    #deserializeResourceRegistryEntriesWithoutResoureInstantiation(serializedResourceRegistry) {
        return serializedResourceRegistry.entries.map(
            entry => this.#deserializeResourceRegistryEntryWithoutResoureInstantiation(entry)
        );
    }

    #deserializeResourceRegistryEntryWithoutResoureInstantiation(entry) {
        const id = entry.id;
        const name = entry.name;

        const deserialized = new ProjectResourceRegistryEntry({
            id, name
        });

        return deserialized;
    }

    #deserializeResources(deserializedResourceRegistry, serializedResourceRegistry) {
        for (let i = 0; i < deserializedResourceRegistry.entries.length; i++) {
            const deserializedEntry = deserializedResourceRegistry.entries[i];
            const serializedEntry = serializedResourceRegistry.entries[i];

            deserializedEntry.resource = this.#deserializeResource(serializedEntry.resource, deserializedResourceRegistry);
        }
    }

    #deserializeResource(serializedResource, deserializedResourceRegistry) {
        if (serializedResource['@type'] === 'image') {
            return this.#deserializeImage(serializedResource);
        }
        else if (serializedResource['@type'] === 'sprite') {
            return this.#deserializeSprite(serializedResource, deserializedResourceRegistry);
        }
        else if (serializedResource['@type'] === 'animation') {
            return this.#deserializeAnimation(serializedResource, deserializedResourceRegistry);
        }
        else {
            throw 'unknown resource type';
        }
    }

    #deserializeImage(image) {
        const source = new URL(image.source, import.meta.resolve('app')).href;

        const deserialized = new Image({
            source,
        });

        return deserialized;
    }

    #deserializeSprite(sprite, deserializedResourceRegistry) {
        const source = new URL(sprite.sheet.source, import.meta.resolve('app')).href
        const entry = deserializedResourceRegistry.findBySource(source);

        const sheet = entry == null ? this.#deserializeImage(sprite.sheet, deserializedResourceRegistry) : entry.resource;

        const deserialized = new Sprite({
            source: sprite.source,
            anchor: sprite.anchor,
            scale: sprite.scale,
            sourceArea: sprite.sourceArea,
            sheet,
        });

        return deserialized;
    }

    #deserializeAnimation(animation, deserializedResourceRegistry) {
        const frames = animation.frames.map(frame => {
            const entry = deserializedResourceRegistry.findBySource(frame.sprite.sheet.source);

            const sprite = entry == null ? this.#deserializeSprite(frame.sprite, deserializedResourceRegistry) : entry.resource;

            return {
                duration: frame.duration,
                sprite,
            };
        });

        const deserialized = new Animation({
            source: animation.source,
            frames,
            speed: animation.speed,
            loop: animation.loop,
        });

        deserialized.currentTime = animation.currentTime;

        return deserialized;
    }
}