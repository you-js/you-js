import { EventEmitter } from '../utility/event.js';

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
    Ignore:   Symbol('target-policy-ignore'),
};

export class View {

    static Position = Position;
    static Size = Size;
    static TargetPolicy = TargetPolicy;

    _objects = [];
    _position = [0, 0];
    _size = [0, 0];
    _realPosition = [null, null];
    _realSize = [null, null];

    constructor({
        name,
        objects=[],
        eventHandling=TargetPolicy.Both,
        rendering=TargetPolicy.Both,
        updating=TargetPolicy.Both,
        events={},
        position=[0, 0], size=[0, 0],
        backgroundColor=null,
        borderColor=null, borderWidth=1,
        clipping=true,
        padding=0,
    }) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.objects = objects;
        this.eventHandling = eventHandling;
        this.rendering = rendering;
        this.updating = updating;
        this.events = new EventEmitter({ bindee: this, handlers: events });
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.clipping = clipping;
        this.padding = padding;
        this.position = position;
        this.size = size;

        this.parent = null;
        this._mouseDown = false;
        this._mouseIn = false;
    }

    get x() { return this._realPosition[0] }
    set x(value) {
        this.position = [value, this._position[1]];
    }
    get y() { return this._realPosition[1] }
    set y(value) {
        this.position = [this._position[0], value];
    }
    get position() { return [...this._realPosition] }
    set position(value) {
        this._position.splice(0, 2, ...value);

        const [x, y] = value;

        if (typeof x === 'number') {
            this._realPosition[0] = x;
        }

        if (typeof y === 'number') {
            this._realPosition[1] = y;
        }

        if (this.parent != null) {
            this.evaluatePosition(this.parent.innerSize);
            this.parent.evaluateWrapSize();
        }
    }

    get width() { return this._realSize[0] }
    set width(value) {
        this.size = [value, this._size[1]];
    }
    get height() { return this._realSize[1] }
    set height(value) {
        this.size = [this._size[0], value];
    }
    get innerSize() { return [...this._realSize.sub(this.padding * 2)] }
    get size() { return [...this._realSize] }
    set size(value) {
        this._size.splice(0, 2, ...value);

        const [width, height] = value;

        if (width === Size.Fill) {
            if (this.parent != null) {
                this.evaluateFillSize(this.parent.size);
            }
        }
        else if (width === Size.Wrap) {
            if (this.parent != null)
            {
                this.evaluateWrapSize();
            }
        }
        else {
            this._realSize[0] = width;
        }

        if (height === Size.Fill) {
            if (this.parent != null) {
                this.evaluateFillSize(this.parent.size);
            }
        }
        else if (height === Size.Wrap) {
            if (this.parent != null)
            {
                this.evaluateWrapSize();
            }
        }
        else {
            this._realSize[1] = height;
        }

        if (this.parent != null) {
            if (this._realSize[0] != null && this._realSize[1] != null) {
                this.parent.evaluate();
            }
        }
    }

    evaluate(parentSize) {
        if (parentSize == null && this.parent == null) { return }

        parentSize ??= this.parent.innerSize;

        this.evaluateWrapSize();
        this.evaluateFillSize(parentSize);
    }

    evaluateWrapSize() {
        this._objects.forEach(object => object.evaluateWrapSize());

        this.evaluateWrapSizeSelf();
    }

    evaluateWrapSizeSelf() {
        if (this._size[0] === Size.Wrap) {
            this._realSize[0] = 0;

            let end = null;

            for (const object of this._objects) {
                if (end == null || end < (object._realPosition[0] ?? 0) + (object._realSize[0] ?? 0)) {
                    end = (object._realPosition[0] ?? 0) + (object._realSize[0] ?? 0);
                }
            }

            if (end != null) {
                this._realSize[0] = end + this.padding * 2;
            }
        }

        if (this._size[1] === Size.Wrap) {
            this._realSize[1] = 0;

            let end = null;

            for (const object of this._objects) {
                if (end == null || end < object._realPosition[1] + (object._realSize[1] ?? 0)) {
                    end = object._realPosition[1] + (object._realSize[1] ?? 0);
                }
            }

            if (end != null) {
                this._realSize[1] = end + this.padding * 2;
            }
        }
    }

    evaluateFillSize(parentSize) {
        this.evaluateFillSizeSelf(parentSize);
        this.evaluatePosition(parentSize);

        this._objects.forEach(object => object.evaluateFillSize(this.innerSize));
    }

    evaluateFillSizeSelf(parentSize) {
        const [parentWidth, parentHeight] = parentSize;

        if (this._size[0] === Size.Fill) {
            this._realSize[0] = parentWidth;
            this._realPosition[0] = 0;
        }

        if (this._size[1] === Size.Fill) {
            this._realSize[1] = parentHeight;
            this._realPosition[1] = 0;
        }
    }

    evaluatePosition(parentSize) {
        const [parentWidth, parentHeight] = parentSize ?? this.parent.innerSize;

        if (this._position[0] === Position.Start) {
            this._realPosition[0] = 0;
        }
        else if (this._position[0] === Position.Center) {
            this._realPosition[0] = Math.floor((parentWidth - this._realSize[0]) / 2);
        }
        else if (this._position[0] === Position.End) {
            this._realPosition[0] = parentWidth - this._realSize[0];
        }

        if (this._position[1] === Position.Start) {
            this._realPosition[1] = 0;
        }
        else if (this._position[1] === Position.Center) {
            this._realPosition[1] = Math.floor((parentHeight - this._realSize[1]) / 2);
        }
        else if (this._position[1] === Position.End) {
            this._realPosition[1] = parentHeight - this._realSize[1];
        }
    }

    get positionInGlobal() { return this.parent ? this.parent.positionInGlobal.add(this._realPosition).add(this.parent.padding) : this._realPosition }
    get area() { return [...this._realPosition, ...this._realSize] }
    get areaInGlobal() { return [...this.positionInGlobal, ...this._realSize] }

    get objects() { return this._objects }
    set objects(value) {
        if (!(value instanceof Array)) {
            throw `Expected an array, but got ${value}`;
        }

        this._objects.forEach(object => object.parent = null);
        this._objects.splice(0, this._objects.length, ...value);
        this._objects.forEach(object => object.parent = this);
    }

    add(object) {
        this._objects.push(object);
        object.parent = this;
    }

    remove(object) {
        const index = this._objects.indexOf(object);
        if (index >= 0) {
            this._objects.splice(index, 1);
            object.parent = null;
        }
    }

    clear() {
        this._objects.forEach(object => object.parent = null);
        this._objects.splice(0, this._objects.length);
    }

    findById(id) {
        return this._objects.find(object => object.id === id);
    }

    findByName(name) {
        return this._objects.find(object => object.name === name);
    }

    findAllByName(name) {
        return this._objects.filter(object => object.name === name);
    }

    create() {
        this.onCreate();

        for (const object of this._objects) {
            object.create();
        }
    }

    onCreate() {}

    destroy() {
        this.onDestroy();

        for (const object of this._objects) {
            object.destroy();
        }
    }

    onDestroy() {}

    handle(events) {
        if (this.eventHandling === TargetPolicy.Ignore || this.rendering === TargetPolicy.Ignore) { return }

        const area = this.areaInGlobal;

        let propagatingEvents = [];

        for (const event of events) {
            if (event.type.startsWith('mouse')) {
                const containsMousePosition = area.contains(event.position);

                if (event.type === 'mouseup' ||
                    event.type === 'mousemove' && this._mouseIn ||
                    containsMousePosition) {
                    propagatingEvents.push(event);
                }
            }
            else {
                if (event.handled) { continue }

                propagatingEvents.push(event);
            }
        }

        if (!(this.eventHandling === TargetPolicy.Self || this.rendering === TargetPolicy.Self)) {
            if (propagatingEvents.length > 0) {
                [...this._objects].reverse().forEach(object => object.handle(propagatingEvents));
            }
        }

        if (!(this.eventHandling === TargetPolicy.Children || this.rendering === TargetPolicy.Children)) {
            this.onHandle(events);

            for (const event of events) {
                if (event.type === 'mousedown') {
                    if (event.handled) { continue }
                    if (propagatingEvents.includes(event)) {
                        this.events.emit('mousedown', event);
                        event.handled = true;

                        this._mouseDown = true;
                    }
                }
                else if (event.type === 'mousemove') {
                    const screenPosition = event.position;
                    if (area.contains(screenPosition)) {
                        if (!event.handled) {
                            this.events.emit('mousemove', event);
                            event.handled = true;
                        }

                        if (!this._mouseIn) {
                            this.events.emit('mousein', event);
                            this._mouseIn = true;
                        }
                    }
                    else {
                        if (this._mouseIn) {
                            this.events.emit('mouseout', event);
                            this._mouseIn = false;
                        }
                    }
                }
                else if (event.type === 'mouseup') {
                    const screenPosition = event.position;
                    if (area.contains(screenPosition)) {
                        if (!event.handled) {
                            this.events.emit('mouseup', event);
                            event.handled = true;

                            if (this._mouseDown) {
                                this.events.emit('click', event);
                            }
                        }
                    }

                    this._mouseDown = false;
                }
            }
        }
    }

    onHandle(events) {}

    update(deltaTime) {
        if (this.updating === TargetPolicy.Ignore) { return }

        if (this.updating !== TargetPolicy.Children) {
            this.onUpdate(deltaTime);
            this.events.emit('update', deltaTime);
        }

        if (this.updating !== TargetPolicy.Self) {
            this._objects.forEach(object => object.update(deltaTime));
        }
    }

    onUpdate(deltaTime) {}

    render(context, screenSize) {
        if (this.rendering === TargetPolicy.Ignore) { return }
        if (this._realSize[0] == null || this._realSize[1] == null) { return }
        if (this._realSize[0] === 0 || this._realSize[1] === 0) { return }

        context.save();
        context.translate(...this._realPosition.map(Math.floor));

        context.beginPath();
        context.rect(0, 0, ...this._realSize.map(Math.floor));
        context.clip();

        if (this.rendering !== TargetPolicy.Children) {
            if (this.backgroundColor) {
                context.fillStyle = this.backgroundColor;
                context.fillRect(0, 0, ...this._realSize.map(Math.floor));
            }

            this.onRender(context, screenSize);
            this.events.emit('render', context, screenSize);
        }

        if (this.rendering !== TargetPolicy.Self) {
            context.save();
            context.translate(Math.floor(this.padding), Math.floor(this.padding));
            this._objects.forEach(object => object.render(context, screenSize));
            context.restore();
        }

        if (this.rendering !== TargetPolicy.Children) {
            if (this.borderColor && this.borderWidth > 0) {
                context.lineWidth = this.borderWidth;
                context.strokeStyle = this.borderColor;
                context.strokeRect(.5, .5, ...this._realSize.sub(1));
            }
        }

        context.restore();
    }

    onRender(context, screenSize) {}
}