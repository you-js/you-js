import { Serializer } from './serializer.js';

export class ComponentRegistrySerializer extends Serializer {

    serialize(componentRegistry) {
        const serialized = { '@type': 'component-registry' };

        serialized.entries = this.#serializeComponentRegistryEntries(componentRegistry);

        return serialized;
    }

    #serializeComponentRegistryEntries(componentRegistry) {
        return componentRegistry.entries.map(
            entry => this.#serializeComponentRegistryEntry(entry)
        );
    }

    #serializeComponentRegistryEntry(entry) {
        return {
            '@type': 'component-registry-entry',
            id: entry.id,
            path: entry.path,
            name: entry.name,
        };
    }
}