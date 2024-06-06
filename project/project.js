import { ProjectDataReader } from './data/project-data-reader.js';
import { ProjectDataWriter } from './data/project-data-writer.js';
import { ProjectScene } from './project-scene.js';
import { ProjectDeserializer } from './serialization/project-deserializer.js';
import { ProjectSerializer } from './serialization/project-serializer.js';

export class Project {

    constructor({
        name,
        scenes=[],
        dataIOMethod='local-storage',
    }) {
        this.name = name;
        this.scenes = scenes;
        this.dataIOMethod = dataIOMethod;

        this.dataWriter = new ProjectDataWriter({ method: dataIOMethod });
        this.serializer = new ProjectSerializer();
    }

    createScene({
        name,
        componentRegistry=null,
        resourceRegistry=null,
        objects=[],
    }) {
        if (this.player != null) { return }

        const projectScene = new ProjectScene({
            name, componentRegistry, resourceRegistry, objects,
        });

        this.scenes.push(projectScene);

        return projectScene;
    }

    save(...args) {
        const serializedProject = this.serialize();
        const text = JSON.stringify(serializedProject, null, 4);

        this.dataWriter.write(text, ...args);
    }

    static async load(dataIOMethod, ...args) {
        const dataReader = new ProjectDataReader({ method: dataIOMethod });

        const text = await dataReader.read(...args);

        if (text == null) { return null }

        const serializedProject = JSON.parse(text);

        return await Project.deserialize(serializedProject);
    }

    serialize() {
        return this.serializer.serialize(this);
    }

    static async deserialize(serializedProject) {
        const deserializer = new ProjectDeserializer();

        return deserializer.deserialize(serializedProject);
    }
}