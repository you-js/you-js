import { ProjectObject } from "../project-object.js";
import { ProjectResourceRegistryEntry } from "../project-resource-registry-entry.js";
import { Serializer } from "./serializer.js";

export class ViewSerializer extends Serializer {

    serializeViewRecursively(projectView) {
        const serialized = { '@type': 'view' };

        serialized.id = this.#serializeId(projectView);
        serialized.name = this.#serializeName(projectView);
        serialized.type = this.#serializeType(projectView);
        serialized.properties = this.#serializeProperties(projectView);
        serialized.children = this.#serializeChildren(projectView);

        serialized.name == null && delete serialized.name;
        serialized.properties == null && delete serialized.properties;
        serialized.children == null && delete serialized.children;

        return serialized;
    }

    #serializeId(projectView) {
        if (projectView.id == null) {
            throw `Project view ID is null.`;
        }

        return projectView.id;
    }

    #serializeName(projectView) {
        return projectView.name;
    }

    #serializeType(projectView) {
        if (projectView.type == null) {
            throw `Project view type is null.`;
        }

        return {
            path: projectView.type.path,
            name: projectView.type.name,
        };
    }

    #serializeProperties(projectView) {
        const properties = {};

        for (const key in projectView.properties) {
            const value = projectView.properties[key];

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
        else if (typeof value === 'symbol') {
            return value.toString();
        }
        else {
            return value;
        }
    }

    #serializeChildren(projectView) {
        if (projectView.children.length === 0) { return null }

        const children = projectView.children.map(
            child => this.serializeViewRecursively(child)
        );

        return children;
    }
}