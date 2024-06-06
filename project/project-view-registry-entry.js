export class ProjectViewRegistryEntry {

    constructor({
        id=null,
        path,
        type,
    }) {
        this.id = id ?? crypto.randomUUID();
        this.path = path;
        this.type = type;
        this.name = type.name;
    }
}