import { Deserializer } from './deserializer.js';
import { ComponentRegistryDeserializer } from './component-registry-deserializer.js';
import { ResourceRegistryDeserializer } from './resource-registry-deserializer.js';
import { ProjectScene } from '../project-scene.js';
import { ObjectDeserializer } from './object-deserializer.js';
import { ViewDeserializer } from "./view-deserializer.js";

export class SceneDeserializer extends Deserializer {

    constructor() {
        super();

        this.componentRegistryDeserializer = new ComponentRegistryDeserializer();
        this.resourceRegistryDeserializer = new ResourceRegistryDeserializer();
    }

    async deserialize(serializedProjectScene) {
        if (serializedProjectScene['@type'] !== 'scene') {
            throw `Invalid type "${serializedProjectScene.type}".`;
        }

        const name = this.#deserializeSceneName(serializedProjectScene);
        const componentRegistry = await this.#deserializeComponentRegistry(serializedProjectScene);
        const resourceRegistry = this.#deserialzeResourceRegistry(serializedProjectScene);
        const data = this.#deserializeData(serializedProjectScene);

        const deserializedProjectScene = new ProjectScene({
            name, componentRegistry, resourceRegistry, data
        });

        this.#deserializeObjects(serializedProjectScene, deserializedProjectScene);
        await this.#deserializeViews(serializedProjectScene, deserializedProjectScene);

        return deserializedProjectScene;
    }

    #deserializeSceneName(projectScene) { return projectScene.name }

    async #deserializeComponentRegistry(projectScene) {
        return await this.componentRegistryDeserializer.deserialize(projectScene.componentRegistry);
    }

    #deserialzeResourceRegistry(projectScene) {
        return this.resourceRegistryDeserializer.deserialize(projectScene.resourceRegistry);
    }

    #deserializeData(projectScene) { return projectScene.data }

    #deserializeObjects(serializedProjectScene, deserializedProjectScene) {
        const objectDeserializer = new ObjectDeserializer();

        serializedProjectScene.objects.forEach(serializedProjectObject => {
            const deserializedProjectObject = objectDeserializer.deserializeObjectRecursively(
                serializedProjectObject, deserializedProjectScene
            );

            deserializedProjectScene.addObject(deserializedProjectObject);
        });

        serializedProjectScene.objects.forEach((object, index) => {
            objectDeserializer.deserializeComponentsRecursively(
                object, deserializedProjectScene.objects[index], deserializedProjectScene
            );
        });

        return serializedProjectScene.objects;
    }

    async #deserializeViews(serializedProjectScene, deserializedProjectScene) {
        const viewDeserializer = new ViewDeserializer();

        for (const view of serializedProjectScene.views) {
            const deserializedProjectView = await viewDeserializer.deserializeViewRecursively(
                view, deserializedProjectScene
            );

            deserializedProjectScene.views.push(deserializedProjectView);
        }

        return serializedProjectScene.views;
    }
}