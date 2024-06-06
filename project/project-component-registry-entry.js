export class ProjectComponentRegistryEntry {

    /**
     * @member {string} id
     * @member {string} path
     * @member {Component} type
     * @member {string} name
    */

    /**
     * @param {Object} parameters
     * @param {string} [parameters.id=null]
     * @param {string} parameters.path
     * @param {Component} parameters.type
     */
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