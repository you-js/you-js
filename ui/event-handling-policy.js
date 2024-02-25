import { View } from "./view.js";

export class EventHandlingPolicy {

    constructor({
        eventHandling=true,
        targetPolicy=View.TargetPolicy.Both,
    }) {
        this.eventHandling = eventHandling;
        this.targetPolicy = targetPolicy;
    }
}