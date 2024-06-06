export class ProjectComponent {

    constructor({
        owner=null,
        type,
        properties={},
    }) {
        this.owner = owner;
        this.type = type;
        this.properties = properties;
    }

    set(name, value) {
        this.properties[name] = value;
    }
}