import { Deserializer } from './deserializer.js';
import { ProjectComponent } from '../project-component.js';

export class ComponentDeserializer extends Deserializer {

    deserialize(serializedProjectComponent, deserializedProjectObject, deserializedProjectScene) {
        if (serializedProjectComponent['@type'] !== 'component') {
            throw `Invalid type "${serializedProjectComponent['@type']}".`;
        }

        const owner = deserializedProjectObject;
        const type = this.#deserializeType(serializedProjectComponent, deserializedProjectScene);
        const properties = this.#deserializeProperties(serializedProjectComponent, deserializedProjectScene);

        const deserialized = new ProjectComponent({
            owner, type, properties,
        });

        return deserialized;
    }

    #deserializeType(serializedProjectComponent, deserializedProjectScene) {
        return deserializedProjectScene.componentRegistry.findById(serializedProjectComponent.id).type;
    }

    #deserializeProperties(serializedProjectComponent, deserializedProjectScene) {
        if (serializedProjectComponent.properties == null) { return null }

        const properties = {};

        for (const key in serializedProjectComponent.properties) {
            const value = serializedProjectComponent.properties[key];

            properties[key] = this.#parseValue(value, deserializedProjectScene);
        }

        return properties;
    }

    #parseValue(value, deserializedProjectScene) {
        if (value == null) {
            return null;
        }
        else if (value['@type'] === 'object-reference') {
            const referedObject = deserializedProjectScene.findObjectByIdRecursively(value.id);

            if (referedObject == null) {
                throw `Object id "${value.id}" not found.`;
            }

            return referedObject;
        }
        else if (value['@type'] === 'resource-reference') {
            const referedResourceRegistryEntry = deserializedProjectScene.resourceRegistry.findById(value.id);

            if (referedResourceRegistryEntry == null) {
                throw `Resource id "${value.id}" not found.`;
            }

            return referedResourceRegistryEntry;
        }
        else if (value instanceof Array) {
            return value.map(v => this.#parseValue(v, deserializedProjectScene));
        }
        else if (value instanceof globalThis.Object) {
            return globalThis.Object.fromEntries(
                globalThis.Object.entries(value).map(
                    ([k, v]) => [k, this.#parseValue(v, deserializedProjectScene)]
                )
            );
        }
        else {
            return value;
        }
    }
}