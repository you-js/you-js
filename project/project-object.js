
import { Transform } from "../object/components/transform.js";
import { ProjectComponent } from './project-component.js';

export class ProjectObject {

    constructor({
        scene=null,
        id=null,
        name,
        enable=true,
        tags=[],
        components=[],
        objects=[],
    }) {
        this.scene = scene;
        this.id = id ?? crypto.randomUUID();
        this.name = name;
        this.enable = enable;
        this.tags = new Set(tags);

        this.components = components;
        this.objects = objects;
    }

    addComponent(projectComponentData) {
        const component = new ProjectComponent({ owner: this, ...projectComponentData });

        this.components.push(component);
    }

    removeComponent(componentType) {
        const index = this.components.findIndex(component => component.type === componentType);

        if (index === -1) { return }

        this.components[index].owner = null;

        this.components.splice(index, 1);
    }

    findComponent(componentType) {
        return this.components.find(component => component.type === componentType);
    }

    createObject(projectObjectData) {
        const projectObject = ProjectObject.create(projectObjectData, this.scene);

        this.objects.push(projectObject);

        return projectObject;
    }

    addObject(object) {
        object.scene = this;

        this.objects.push(object);
    }

    deleteObject(object) {
        const index = this.objects.indexOf(object);

        if (index === -1) { return }

        this.objects[index].scene = null;

        this.objects.splice(index, 1);
    }

    findObject(name) {
        return this.objects.find(object => object.name === name);
    }

    findObjectByName(name) {
        return this.objects.find(object => object.name === name);
    }

    findObjectById(id) {
        return this.objects.find(object => object.id === id);
    }

    findObjectByIdRecursively(id) {
        return this.#findObjectByIdRecursively(this, id);
    }

    #findObjectByIdRecursively(object, id) {
        if (object.id != null && object.id === id) {
            return object;
        }

        for (const child of object.objects) {
            const found = this.#findObjectByIdRecursively(child, id);

            if (found) {
                return found;
            }
        }

        return null;
    }

    static createEmpty(projectObjectData, scene) {
        const projectObject = new ProjectObject({
            scene,
            name: projectObjectData.name,
            enable: projectObjectData.enable,
            tags: projectObjectData.tags,
        });

        projectObjectData.components?.forEach(projectComponentData => {
            if (!scene.componentRegistry.has(projectComponentData.type)) {
                if (projectComponentData.type.path != null) {
                    scene.componentRegistry.add({
                        path: projectComponentData.type.path,
                        type: projectComponentData.type,
                    });
                }
                else {
                    throw `Component type "${projectComponentData.type.name}" is not registered.`;
                }
            }

            projectObject.addComponent(projectComponentData);
        });

        projectObjectData.objects?.forEach(projectObjectData => projectObject.createObject(projectObjectData));

        return projectObject;
    }

    static create(projectObjectData, scene) {
        const projectObject = new ProjectObject({
            scene,
            name: projectObjectData.name,
            enable: projectObjectData.enable,
            tags: projectObjectData.tags,
        });

        if (!projectObjectData.components?.some(projectComponentData => projectComponentData.type === Transform)) {
            projectObject.addComponent({ type: Transform });
        }

        projectObjectData.components?.forEach(projectComponentData => {
            if (!scene.componentRegistry.has(projectComponentData.type)) {
                if (projectComponentData.type.path != null) {
                    scene.componentRegistry.add({
                        path: projectComponentData.type.path,
                        type: projectComponentData.type,
                    });
                }
                else {
                    throw `Component type "${projectComponentData.type.name}" is not registered.`;
                }
            }

            projectObject.addComponent(projectComponentData);
        });

        projectObjectData.objects?.forEach(projectObjectData => projectObject.createObject(projectObjectData));

        return projectObject;
    }
}