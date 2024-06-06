import { Deserializer } from './deserializer.js';
import { SceneDeserializer } from './scene-deserializer.js';
import { Project } from '../project.js';

export class ProjectDeserializer extends Deserializer {

    constructor() {
        super();

        this.sceneDeserializer = new SceneDeserializer();
    }

    async deserialize(serializedProject) {
        const name   = this.#deserializeProjectName(serializedProject);
        const scenes = await this.#deserializeScenes(serializedProject);
        const dataIOMethod = this.#deserializeDataIOMethod(serializedProject);

        const project = new Project({
            name, scenes, dataIOMethod,
        });

        return project;
    }

    #deserializeProjectName(serializedProject) { return serializedProject['name'] }

    async #deserializeScenes(serializedProject) {
        return await Promise.all(
            serializedProject['scenes'].map(
                serializedScene => this.#deserializeScene(serializedScene)
            )
        );
    }

    async #deserializeScene(serializedScene) {
        return await this.sceneDeserializer.deserialize(serializedScene);
    }

    #deserializeDataIOMethod(serializedProject) { return serializedProject['data-io-method'] }
}