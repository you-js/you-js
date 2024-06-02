import { Component } from "../component.js";

export class Transform extends Component {

    static path = import.meta.url.replace(import.meta.resolve('app'), '');

    constructor({
        position=[0, 0],
        rotation=0,
        scale=[1, 1],
    }={}) {
        super();

        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}