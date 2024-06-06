import { ProjectComponentRegistryEntry } from './project-component-registry-entry.js';

export class ProjectComponentRegistry {

    /**
     * @param {Object} [parameters={}]
     * @param {Array.<ProjectComponentRegistryEntry>} parameters.entries 
     */
    constructor({
        entries=[],
    }={}) {
        this.entries = entries;
    }

    add({ path, type }) {
        const entry = new ProjectComponentRegistryEntry({
            path, type,
        });

        this.entries.push(entry);
    }

    remove(type) {
        this.entries = this.entries.filter(entry => entry.type !== type);
    }

    removeByType(type) {
        this.entries = this.entries.filter(entry => entry.type !== type);
    }

    removeByTypeName(typeName) {
        this.entries = this.entries.filter(entry => entry.name !== typeName);
    }

    has(type) {
        return this.entries.some(entry => entry.type === type);
    }

    findByType(type) {
        return this.entries.find(entry => entry.type === type);
    }

    findById(id) {
        return this.entries.find(entry => entry.id === id);
    }
}