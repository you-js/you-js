import { Image } from "../graphic/image.js";
import { Sprite } from "../graphic/sprite.js";

export class ProjectResourceRegistryEntry {

    constructor({
        id=null,
        name,
        resource=null,
    }) {
        this.id = id ?? crypto.randomUUID();
        this.name = name;
        this.resource = resource;
    }

    getType(resource) {
        if (resource instanceof Image) {
            return 'image';
        }
        else if (resource instanceof Sprite) {
            return 'sprite';
        }
        else {
            return 'unknown';
        }
    }
}