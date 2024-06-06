import { Deserializer } from './deserializer.js';
import { ProjectComponentRegistry } from '../project-component-registry.js';
import { ProjectComponentRegistryEntry } from '../project-component-registry-entry.js';

export class ComponentRegistryDeserializer extends Deserializer {

    /**
     * 직렬화된 ComponentRegistry를 역직렬화하여 ProjectComponentRegistry 인스턴스를 생성합니다.
     * @param {Object} serializedComponentRegistry
     * @param {string} serializedComponentRegistry.type
     * @param {Array.<{ id: string, path: string, type: string, name: string }>} serializedComponentRegistry.entries
     */
    async deserialize(serializedComponentRegistry) {
        const deserialized = new ProjectComponentRegistry({
            entries: await this.#deserializeComponentRegistryEntries(serializedComponentRegistry.entries),
        });

        return deserialized;
    }

    /**
     * 직렬화된 ComponentRegistryEntry 배열을 역직렬화하여 ProjectComponentRegistryEntry 인스턴스 배열을 생성합니다.
     * @param {Array.<{ id: string, path: string, type: string, name: string }>} serializedComponentRegistryEntries
     * @returns {Promise<ProjectComponentRegistryEntry>}
     */
    async #deserializeComponentRegistryEntries(serializedComponentRegistryEntries) {
        return await Promise.all(
            serializedComponentRegistryEntries.map(
                entry => this.#deserializeComponentRegistryEntry(entry)
            )
        );
    }

    /**
     * 직렬화된 ComponentRegistryEntry를 역직렬화하여 ProjectComponentRegistryEntry 인스턴스를 생성합니다.
     * @param {{ id: string, path: string, type: string, name: string }} entry
     */
    async #deserializeComponentRegistryEntry(entry) {
        const componentName = entry.name;
        const componentPath = import.meta.resolve('app') + entry.path;

        const module = await import(componentPath);
        const componentType = module[componentName];

        return new ProjectComponentRegistryEntry({
            id: entry.id,
            path: entry.path,
            type: componentType,
        });
    }
}