import { Serializer } from './serializer.js';
import { ComponentSerializer } from './component-serializer.js';

export class ObjectSerializer extends Serializer {

    constructor({
        componentRegistry,
    }) {
        super();

        this.componentSerializer = new ComponentSerializer({ componentRegistry });
    }

    serializeObjectRecursively(projectObject) {
        const serialized = { '@type': 'object' };

        serialized.id = this.#serializeId(projectObject);
        serialized.name = this.#serializeName(projectObject);
        serialized.enable = this.#serializeEnable(projectObject);
        serialized.tags = this.#serializeTags(projectObject);
        serialized.components = [];
        serialized.objects = this.#serializeObjects(projectObject);

        serialized.objects == null && delete serialized.objects;

        return serialized;
    }

    #serializeId(projectObject) { return projectObject.id }
    #serializeName(projectObject) { return projectObject.name }
    #serializeEnable(projectObject) { return projectObject.enable }
    #serializeTags(projectObject) { return Array.from(projectObject.tags) }
    #serializeObjects(projectObject) {
        if (projectObject.objects.length === 0) { return null }

        return projectObject.objects.map(
            projectObject => this.serializeObjectRecursively(projectObject)
        );
    }

    serializeComponentsRecursively(projectObject, serializedProjectObject) {
        projectObject.components.forEach(projectComponent => {
            const serializedProjectComponent = this.componentSerializer.serialize(projectComponent);

            serializedProjectObject.components.push(serializedProjectComponent);
        });

        projectObject.objects.forEach(
            (object, index) => this.serializeComponentsRecursively(object, serializedProjectObject.objects[index])
        );
    }
}