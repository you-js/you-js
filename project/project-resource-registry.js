import { ProjectResourceRegistryEntry } from './project-resource-registry-entry.js';

export class ProjectResourceRegistry {

    constructor({
        entries=[],
    }={}) {
        this.entries = entries;
    }

    add({ name, resource }) {
        const entry = new ProjectResourceRegistryEntry({
            name, resource,
        });

        this.entries.push(entry);
    }

    remove(name) {
        this.entries = this.entries.filter(entry => entry.name !== name);
    }

    removeByName(name) {
        this.entries = this.entries.filter(entry => entry.name !== name);
    }

    has(name) {
        return this.entries.some(entry => entry.name === name);
    }

    findByName(name) {
        return this.entries.find(entry => entry.name === name);
    }

    findById(id) {
        return this.entries.find(entry => entry.id === id);
    }

    findBySource(source) {
        return this.entries.find(entry => entry.resource?.source === source);
    }
}