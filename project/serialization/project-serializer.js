import { Serializer } from './serializer.js';
import { SceneSerializer } from './scene-serializer.js';

export class ProjectSerializer extends Serializer {

    constructor() {
        super();

        this.sceneSerializer = new SceneSerializer();
    }

    serialize(project) {
        const serialized = { type: 'project' };

        serialized['name']   = this.#serializeProjectName(project);
        serialized['scenes'] = this.#serializeScenes(project);
        serialized['data-io-method'] = this.#serializeDataIOMethod(project);

        return serialized;
    }

    #serializeProjectName(project) { return project.name }

    #serializeScenes(project) {
        return project.scenes.map(scene => this.#serializeScene(scene));
    }

    #serializeScene(scene) {
        return this.sceneSerializer.serialize(scene);
    }

    #serializeDataIOMethod(project) { return project.dataIOMethod }
}