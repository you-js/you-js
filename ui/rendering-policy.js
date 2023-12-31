import { View } from "./view.js";

export class RenderingPolicy {

    constructor({
        rendering=true,
        targetPolicy=View.TargetPolicy.Both,
    }) {
        this.rendering = rendering;
        this.targetPolicy = targetPolicy;
    }
}