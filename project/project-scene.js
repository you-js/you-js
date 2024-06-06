import { ProjectComponentRegistry } from './project-component-registry.js';
import { ProjectObject } from './project-object.js';
import { ProjectResourceRegistry } from './project-resource-registry.js';
import { ProjectView } from "./project-view.js";

export class ProjectScene {

    constructor({
        name,
        componentRegistry=null,
        resourceRegistry=null,
        objects=[],
        views=[],
        data={},
    }) {
        this.name = name;
        this.componentRegistry = componentRegistry ?? new ProjectComponentRegistry();
        this.resourceRegistry = resourceRegistry ?? new ProjectResourceRegistry();
        this.objects = objects;
        this.views = views;
        this.data = data;
    }

    createObject(projectObjectData) {
        const projectObject = ProjectObject.createEmpty(projectObjectData, this);

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

    createView(projectViewData) {
        const projectView = ProjectView.create(projectViewData, this);

        this.views.push(projectView);

        return projectView;
    }

    registerComponent({ path, type }) {
        if (this.componentRegistry.has(type)) {
            throw `Component type "${type.name}" is already registered.`;
        }

        this.componentRegistry.add({ path, type });
    }

    deregisterComponent(type) {
        this.componentRegistry.remove(type);
    }

    deregisterComponentByType(type) {
        this.componentRegistry.remove(type);
    }

    deregisterComponentByTypeName(typeName) {
        this.componentRegistry.removeByTypeName(typeName);
    }

    registerResource({ name, resource }) {
        if (this.resourceRegistry.has(name)) {
            throw `Resource name "${name}" is already registered.`;
        }

        this.resourceRegistry.add({ name, resource });
    }

    deregisterResource(name) {
        this.resourceRegistry.remove(name);
    }

    deregisterResourceByName(name) {
        this.resourceRegistry.remove(name);
    }

    findResource(name) {
        return this.resourceRegistry.findByName(name);
    }

    findResourceByName(name) {
        return this.resourceRegistry.findByName(name);
    }

    findResourceById(id) {
        return this.resourceRegistry.findById(id);
    }
}