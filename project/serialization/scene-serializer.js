import { Serializer } from './serializer.js';
import { ComponentRegistrySerializer } from './component-registry-serializer.js';
import { ResourceRegistrySerializer } from './resource-registry-serializer.js';
import { ObjectSerializer } from './object-serializer.js';
import { ViewSerializer } from "./view-serializer.js";

export class SceneSerializer extends Serializer {

    constructor() {
        super();

        this.componentRegistrySerializer = new ComponentRegistrySerializer();
        this.resourceRegistrySerializer = new ResourceRegistrySerializer();
        this.viewSerializer = new ViewSerializer();
    }

    serialize(projectScene) {
        const serialized = { '@type': 'scene' };

        serialized.name = this.#serializeSceneName(projectScene);
        serialized.componentRegistry = this.#serializeComponentRegistry(projectScene);
        serialized.resourceRegistry = this.#serializeResourceRegistry(projectScene);
        serialized.objects = this.#serializeObjects(projectScene);
        serialized.views = this.#serializeViews(projectScene);
        serialized.data = this.#serializeData(projectScene);

        return serialized;
    }

    #serializeSceneName(projectScene) { return projectScene.name }

    #serializeComponentRegistry(projectScene) {
        return this.componentRegistrySerializer.serialize(projectScene.componentRegistry);
    }

    #serializeResourceRegistry(projectScene) {
        return this.resourceRegistrySerializer.serialize(projectScene.resourceRegistry);
    }

    #serializeObjects(projectScene) {
        const objectSerializer = new ObjectSerializer({
            componentRegistry: projectScene.componentRegistry,
        });

        return projectScene.objects.map(
            projectObject => this.#serializeObject(projectObject, objectSerializer)
        );
    }

    #serializeObject(projectObject, objectSerializer) {
        const serializedProjectObject = objectSerializer.serializeObjectRecursively(projectObject);

        objectSerializer.serializeComponentsRecursively(projectObject, serializedProjectObject);

        return serializedProjectObject;
    }

    #serializeViews(projectScene) {
        return projectScene.views.map(view => this.#serializeView(view));
    }

    #serializeView(projectView) {
        return this.viewSerializer.serializeViewRecursively(projectView);
    }

    #serializeData(projectScene) { return projectScene.data }
}