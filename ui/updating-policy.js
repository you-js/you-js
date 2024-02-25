import { View } from "./view.js";

export class UpdatingPolicy {

    constructor({
        updating=true,
        targetPolicy=View.TargetPolicy.Both,
    }) {
        this.updating = updating;
        this.targetPolicy = targetPolicy;
    }
}