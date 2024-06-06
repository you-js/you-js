import { Serializer } from './serializer.js';
import { ProjectObject } from '../project-object.js';
import { ProjectResourceRegistryEntry } from '../project-resource-registry-entry.js';

export class ComponentSerializer extends Serializer {

    constructor({
        componentRegistry,
    }) {
        super();

        this.componentRegistry = componentRegistry;
    }

    serialize(projectComponent) {
        const serialized = { '@type': 'component' };

        serialized.id = this.#serializeId(projectComponent);
        serialized.properties = this.#serializeProperties(projectComponent);

        serialized.properties == null && delete serialized.properties;

        return serialized;
    }

    #serializeId(projectComponent) { return this.componentRegistry.findByType(projectComponent.type).id }
    #serializeProperties(projectComponent) {
        if (Object.keys(projectComponent.properties).length === 0) { return null }

        const properties = {};

        for (const key in projectComponent.properties) {
            const value = projectComponent.properties[key];

            properties[key] = this.#serializeValue(value);
        }

        return properties;
    }

    #serializeValue(value) {
        if (value instanceof ProjectObject) {
            return { '@type': 'object-reference', id: value.id };
        }
        else if (value instanceof ProjectResourceRegistryEntry) {
            return { '@type': 'resource-reference', id: value.id };
        }
        else if (value instanceof Array) {
            return value.map(v => this.#serializeValue(v));
        }
        else if (value instanceof Object) {
            return Object.fromEntries(
                Object.entries(value).map(
                    ([k, v]) => [k, this.#serializeValue(v)]
                )
            );
        }
        else {
            return value;
        }
    }
}