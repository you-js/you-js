import { Object } from "../object/object.js";
import { Scene } from "../scene.js";
import { ProjectObject } from './project-object.js';
import { ProjectResourceRegistryEntry } from './project-resource-registry-entry.js';

export class ProjectSceneInstantiater {

    instantiate(projectScene) {
        const scene = new Scene();

        const objects = this.#generateObjectsWithoutComponents(projectScene, scene);

        objects.forEach(object => scene.add(object));

        this.#generateComponents(projectScene, scene);

        this.#generateViews(projectScene, scene);

        scene.data = projectScene.data;

        globalThis.$ = (objectReference, componentType) => {
            const names = objectReference[0].split('.');

            let object = scene;

            for (const name of names) {
                if (object == null) { break }

                object = object.findObjectByName(name);
            }

            return componentType == null ? object : object.findComponent(componentType);
        };

        return scene;
    }

    #generateObjectsWithoutComponents(projectScene, scene) {
        const objects = [];

        for (const projectObject of projectScene.objects) {
            const object = this.#instantiateObjectRecursively(projectObject, scene);

            objects.push(object);
        }

        return objects;
    }

    #instantiateObjectRecursively(projectObject, scene) {
        const object = new Object({
            scene,
            id: projectObject.id,
            name: projectObject.name,
            tags: projectObject.tags,
            enable: projectObject.enable,
            components: [],
            objects: projectObject.objects.map(object => this.#instantiateObjectRecursively(object, scene)),
        });

        return object;
    }

    #generateComponents(projectScene, scene) {
        for (let i = 0; i < projectScene.objects.length; i++) {
            const projectObject = projectScene.objects[i];
            const object = scene.objects[i];

            this.#instantiateComponentsRecursively(object, projectObject, scene, projectScene);
        }
    }

    #instantiateComponentsRecursively(object, projectObject, scene, projectScene) {
        for (const projectComponent of projectObject.components) {
            const componentType = projectComponent.type;

            object.addComponent(componentType);

            const component = object.findComponent(componentType);

            for (const key in projectComponent.properties) {
                const value = projectComponent.properties[key];

                component[key] = this.#parseValue(value, scene, projectScene);
            }
        }

        for (let i = 0; i < projectObject.objects.length; i++) {
            const childProjectObject = projectObject.objects[i];
            const chilObject = object.objectContainer.objects[i];

            this.#instantiateComponentsRecursively(chilObject, childProjectObject, scene, projectScene);
        }
    }

    #findObjectByIdInScene(id, scene) {
        for (const object of scene.objects) {
            const found = this.#findObjectByIdRecursively(id, object);

            if (found) {
                return found;
            }
        }

        return null;
    }

    #findObjectByIdRecursively(id, object) {
        if (object.id != null && object.id === id) {
            return object;
        }

        for (const child of object.objectContainer.objects) {
            const found = this.#findObjectByIdRecursively(id, child);

            if (found) {
                return found;
            }
        }

        return null;
    }

    #parseValue(value, scene, projectScene) {
        if (value instanceof ProjectObject) {
            const referedObject = this.#findObjectByIdInScene(value.id, scene);

            if (referedObject == null) {
                throw `Object with id "${value.id}" not found.`;
            }

            return referedObject;
        }
        else if (value instanceof ProjectResourceRegistryEntry) {
            const referedResourceRegistryEntry = projectScene.resourceRegistry.findById(value.id);
            const referedResource = referedResourceRegistryEntry.resource;

            return referedResource;
        }
        else if (value instanceof Array) {
            return value.map(v => this.#parseValue(v, scene, projectScene));
        }
        else if (value instanceof globalThis.Object) {
            return globalThis.Object.fromEntries(
                globalThis.Object.entries(value).map(
                    ([k, v]) => [k, this.#parseValue(v, scene, projectScene)]
                )
            );
        }
        else {
            return value;
        }
    }

    #generateViews(projectScene, scene) {
        for (const projectView of projectScene.views) {
            const view = this.#instantiateView(projectView, scene, projectScene);

            scene.add(view);
        }
    }

    #instantiateView(projectView, scene, projectScene) {
        const view = this.#instantiateViewRecursively(projectView, scene, projectScene);

        view.scene = scene;

        return view;
    }

    #instantiateViewRecursively(projectView, scene, projectScene) {
        const type = projectView.type;

        const view = new type(
            this.#parseViewProperties(projectView.properties, scene, projectScene),
            ...projectView.children?.map(
                child => this.#instantiateViewRecursively(child, scene, projectScene)
            ) ?? []
        );

        return view;
    }

    #parseViewProperties(properties, scene, projectScene) {
        const parsedProperties = {};

        for (const key in properties) {
            const value = properties[key];

            parsedProperties[key] = this.#parseValue(value, scene, projectScene);
        }

        return parsedProperties;
    }
}