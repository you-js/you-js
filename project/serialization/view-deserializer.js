import { ProjectView } from "../project-view.js";
import { Deserializer } from "./deserializer.js";

export class ViewDeserializer extends Deserializer {

    async deserializeViewRecursively(serializedProjectView, deserializedProjectScene) {
        if (serializedProjectView['@type'] !== 'view') {
            throw `Invalid type "${serializedProjectView['@type']}".`;
        }

        const scene = deserializedProjectScene;
        const id = this.#deserializeId(serializedProjectView);
        const name = this.#deserializeName(serializedProjectView);
        const type = await this.#deserializeType(serializedProjectView);
        const properties = this.#deserializeProperties(serializedProjectView, deserializedProjectScene);
        const children = await this.#deserializeChildren(serializedProjectView, deserializedProjectScene);

        const deserialized = new ProjectView({
            scene, id, name, type, properties, children,
        });

        return deserialized;
    }

    #deserializeId(serializedProjectView) { return serializedProjectView.id }
    #deserializeName(serializedProjectView) { return serializedProjectView.name }
    async #deserializeType(serializedProjectView) {
        const { name, path } = serializedProjectView.type;

        const viewTypeName = name;
        const viewTypePath = import.meta.resolve('app') + path;

        const module = await import(viewTypePath);
        const type = module[viewTypeName];

        return type;
    }

    #deserializeProperties(serializedProjectView, deserializedProjectScene) {
        const properties = {};

        for (const key in serializedProjectView.properties) {
            const value = serializedProjectView.properties[key];

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
        else if (typeof value === 'string' && value.startsWith('Symbol(') && value.endsWith(')')) {
            return Symbol.for(value.slice(7, -1));
        }
        else {
            return value;
        }
    }

    async #deserializeChildren(serializedProjectView, deserializedProjectScene) {
        return await Promise.all(
            (serializedProjectView.children ?? []).map(
                serializedProjectView => this.deserializeViewRecursively(serializedProjectView, deserializedProjectScene)
            )
        )
    }
}