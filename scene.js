import { View } from "./ui/view.js";

export class Scene {

    screen;
    camera;
    objects = [];
    views = [];

    add(object) {
        if (object instanceof View) {
            this.views.push(object);
        }
        else {
            this.objects.push(object);
        }
    }

    remove(object) {
        if (object instanceof View) {
            this.views.remove(object);
        }
        else {
            this.objects.remove(object);
        }
    }

    findObjectById(objectId) {
        return this.objects.find(object => object.id === objectId);
    }

    findObjectByName(objectName) {
        return this.objects.find(object => object.name === objectName);
    }

    findObjectsByName(objectName) {
        return this.objects.filter(object => object.name === objectName);
    }

    findViewById(viewId) {
        return this.views.find(view => view.id === viewId);
    }

    findViewByName(viewName) {
        return this.views.find(view => view.name === viewName);
    }

    findViewsByName(viewName) {
        return this.views.filter(view => view.name === viewName);
    }

    create() {
        this.willCreate();
        this.views.forEach(view => view.create());
        this.views.forEach(view => view.evaluate(this.screen.size));
        this.didCreate();
    }

    willCreate() {}
    didCreate() {}

    destroy() {
        this.willDestroy();
        this.views.forEach(view => view.destroy());
        this.didDestroy();
    }

    willDestroy() {}
    didDestroy() {}

    handle(events) {
        this.willHandle(events);

        for (const event of events) {
            if (event.type === 'resize') {
                this.views.forEach(view => view.evaluate(this.screen.size));
            }
        }

        if (this.camera != null) {
            this.objects.toReversed().forEach(object => object.handle?.(events, this.camera));
        }
        this.views.toReversed().forEach(view => view.handle?.(events));
        this.didHandle(events);
    }

    willHandle(events) {}
    didHandle(events) {}

    update(deltaTime) {
        this.willUpdate(deltaTime);
        this.objects.forEach(object => object.update?.(deltaTime));
        this.views.forEach(view => view.update?.(deltaTime));
        this.didUpdate(deltaTime);
    }

    willUpdate(deltaTime) {}
    didUpdate(deltaTime) {}

    render(context) {
        const screenSize = this.screen.size;

        this.willRender(context, screenSize);
        this.withCamera(context, screenSize, () => {
            this.willRenderWithCamera(context, screenSize);
            this.objects.forEach(object => object.render?.(context, screenSize));
            this.didRenderWithCamera(context, screenSize);
        });
        this.didRender(context, screenSize);

        this.views.forEach(view => view.render?.(context, screenSize));
    }

    willRender(context, screenSize) {}
    didRender(context, screenSize) {}
    willRenderWithCamera(context, screenSize) {}
    didRenderWithCamera(context, screenSize) {}

    withCamera(context, screenSize, render) {
        const camera = this.camera;

        if (camera == null) { return }

        context.save();
        context.translate(...screenSize.div(2).sub(camera.position.mul(camera.scale)).map(Math.floor));
        context.scale(...camera.scale);

        render(context, screenSize);

        context.restore();
    }
}