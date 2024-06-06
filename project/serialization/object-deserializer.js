import { Deserializer } from './deserializer.js';
import { ComponentDeserializer } from './component-deserializer.js';
import { ProjectObject } from '../project-object.js';

export class ObjectDeserializer extends Deserializer {

    constructor() {
        super();

        this.componentDeserializer = new ComponentDeserializer();
    }

    deserializeObjectRecursively(serializedProjectObject, deserializedProjectScene) {
        if (serializedProjectObject['@type'] !== 'object') {
            throw `Invalid type "${serializedProjectObject['@type']}".`;
        }

        const scene = deserializedProjectScene;
        const id = this.#deserializeId(serializedProjectObject);
        const name = this.#deserializeName(serializedProjectObject);
        const enable = this.#deserializeEnable(serializedProjectObject);
        const tags = this.#deserializeTags(serializedProjectObject);
        const components = [];
        const objects = this.#deserializeObjects(serializedProjectObject);

        const deserialized = new ProjectObject({
            scene, id, name, enable, tags, components, objects,
        });

        return deserialized;
    }

    #deserializeId(serializedProjectObject) { return serializedProjectObject.id }
    #deserializeName(serializedProjectObject) { return serializedProjectObject.name }
    #deserializeEnable(serializedProjectObject) { return serializedProjectObject.enable }
    #deserializeTags(serializedProjectObject) { return new Set(serializedProjectObject.tags) }
    #deserializeObjects(serializedProjectObject) {
        return serializedProjectObject.objects?.map(
            serializedProjectObject => this.deserializeObjectRecursively(serializedProjectObject)
        )
    }

    deserializeComponentsRecursively(serializedProjectObject, deserializedProjectObject, deserializedProjectScene) {
        serializedProjectObject.components.forEach(serializedProjectComponent => {
            const deserializedProjectComponent = this.componentDeserializer.deserialize(
                serializedProjectComponent, deserializedProjectObject, deserializedProjectScene
            );

            deserializedProjectObject.components.push(deserializedProjectComponent);
        });

        serializedProjectObject.objects?.forEach(
            (object, index) => this.deserializeComponentsRecursively(
                object, deserializedProjectObject.objects[index], deserializedProjectScene
            )
        );
    }
}