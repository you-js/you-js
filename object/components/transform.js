import { Component } from "../component.js";

export class Transform extends Component {
    constructor({
        position=[0, 0],
        scale=[1, 1],
    }={}) {
        super();

        this.position = position;
        this.scale = scale;
    }
}