import { EventEmitter } from '../utility/event.js';
import { ViewEvaluater } from "./view-evaluater.js";
import { EventHandlingPolicy } from "./event-handling-policy.js";
import { ViewEventHandler } from "./view-event-handler.js";
import { UpdatingPolicy } from "./updating-policy.js";
import { ViewUpdater } from "./view-updater.js";
import { RenderingPolicy } from "./rendering-policy.js";
import { ViewRenderer } from "./view-renderer.js";
import { ViewContainer } from "./view-container.js";

const Position = {
    Start:  Symbol('position-start'),
    Center: Symbol('position-center'),
    End:    Symbol('position-end'),
};

const Size = {
    Fill: Symbol('size-fill'),
    Wrap: Symbol('size-wrap'),
};

const TargetPolicy = {
    Both:     Symbol('target-policy-both'),
    Self:     Symbol('target-policy-self'),
    Children: Symbol('target-policy-children'),
};

export class View {

    static Position = Position;
    static Size = Size;
    static TargetPolicy = TargetPolicy;

    constructor({
        name,
        evaluater,
        eventHandlingPolicy,
        eventHandler,
        updatingPolicy,
        updater,
        renderingPolicy,
        renderer,
        position=[0, 0], size=[View.Size.Wrap, View.Size.Wrap],
        alpha,
        backgroundColor=null,
        borderColor=null, borderWidth=1,
        clipping=true,
        padding=0,
        events={},
    }, ...children) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.padding = padding;
        this.events = new EventEmitter({ bindee: this, handlers: events });

        this.evaluater = this.#setWithDefault(
            evaluater, 
            new ViewEvaluater({
                position,
                size,
            })
        );

        this.eventHandlingPolicy = this.#setWithDefault(
            eventHandlingPolicy,
            new EventHandlingPolicy({
                eventHandling: true,
                targetPolicy: TargetPolicy.Both,
            })
        );

        this.eventHandler = this.#setWithDefault(
            eventHandler,
            new ViewEventHandler({ events: this.events })
        );

        this.updatingPolicy = this.#setWithDefault(
            updatingPolicy,
            new UpdatingPolicy({
                updating: true,
                targetPolicy: TargetPolicy.Both,
            })
        );

        this.updater = this.#setWithDefault(
            updater,
            new ViewUpdater()
        );

        this.renderingPolicy = this.#setWithDefault(
            renderingPolicy,
            new RenderingPolicy({
                rendering: true,
                targetPolicy: TargetPolicy.Both,
            })
        );

        this.renderer = this.#setWithDefault(
            renderer,
            new ViewRenderer({
                alpha,
                backgroundColor,
                borderColor, borderWidth,
                clipping,
            })
        );

        this.container = new ViewContainer({ view: this, children });

        this.scene = null;
        this.parent = null;
    }

    #setWithDefault(value, defaultValue) {
        return value ?? (value === null ? null : defaultValue);
    }

    get x() { return this.evaluater.actualPosition[0] }
    set x(value) {
        this.evaluater.setPosition([value, this.evaluater.position[1]], this);
    }
    get y() { return this.evaluater.actualPosition[1] }
    set y(value) {
        this.evaluater.setPosition([this.evaluater.position[0], value], this);
    }
    get position() { return [...this.evaluater.actualPosition] }
    set position(value) {
        this.evaluater.setPosition(value, this);
    }
    get globalPosition() {
        return (this.parent != null
            ? this.parent.globalPosition.add(this.evaluater.actualPosition).add(this.parent.padding)
            : this.evaluater.actualPosition
        );
    }

    get width() { return this.evaluater.actualSize[0] }
    set width(value) {
        this.evaluater.setSize([value, this.evaluater.size[1]], this);
    }
    get height() { return this.evaluater.actualSize[1] }
    set height(value) {
        this.evaluater.setSize([this.evaluater.size[0], value], this);
    }
    get size() { return [...this.evaluater.actualSize] }
    set size(value) {
        this.evaluater.setSize(value, this);
    }
    get innerSize() { return [...this.evaluater.actualSize.sub(this.padding * 2)] }

    get area() { return [...this.evaluater.actualPosition, ...this.evaluater.actualSize] }
    get globalArea() { return [...this.globalPosition, ...this.evaluater.actualSize] }

    evaluate(parentSize) {
        this.evaluater.evaluate(parentSize, this);
    }

    evaluateWrapSize() {
        this.evaluater.evaluateWrapSize(this);
    }

    evaluateFillSize(parentSize) {
        this.evaluater.evaluateFillSize(parentSize, this);
    }

    get backgroundColor() { return this.renderer.backgroundColor }
    set backgroundColor(value) { this.renderer.backgroundColor = value }

    get borderColor() { return this.renderer.borderColor }
    set borderColor(value) { this.renderer.borderColor = value }

    get borderWidth() { return this.renderer.borderWidth }
    set borderWidth(value) { this.renderer.borderWidth = value }

    get clipping() { return this.renderer.clipping }
    set clipping(value) { this.renderer.clipping = value }

    get children() { return this.container.children }
    set children(value) { this.container.children = value }

    add(view) {
        this.container.add(view, this);
        this.evaluate();
    }

    remove(view) {
        this.container.remove(view);
        this.evaluate();
    }

    clear() {
        this.container.clear();
        this.evaluate();
    }

    findViewById(id) {
        return this.container.findById(id);
    }

    findViewByName(name) {
        return this.container.findByName(name);
    }

    findViewsByName(name) {
        return this.container.findAllByName(name);
    }

    create() {
        this.onCreate();

        for (const object of this.container._children) {
            object.create();
        }
    }

    onCreate() {}

    destroy() {
        this.onDestroy();

        for (const object of this.container._children) {
            object.destroy();
        }
    }

    onDestroy() {}

    handle(events) {
        this.eventHandler.handle(events, this);
    }

    update(deltaTime) {
        this.updater.update(deltaTime, this);
    }

    render(context, screenSize) {
        this.renderer.render(context, screenSize, this);
    }

    show() {
        this.renderingPolicy.rendering = true;
    }

    hide() {
        this.renderingPolicy.rendering = false;

        this.eventHandler.resetStates(this.container._children);
    }
}