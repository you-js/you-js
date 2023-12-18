export class EventEmitter {

    bindee;
    eventHandlerInfos = {};

    constructor({
        bindee=null,
        handlers={},
    }={}) {
        this.bindee = bindee;

        Object.entries(handlers).forEach(([eventId, handler]) => {
            this.on(eventId, handler);
        });
    }

    on(eventId, handler, count=Infinity) {
        if (handler == null) { return }

        this.eventHandlerInfos[eventId] ??= [];

        const eventHandlerInfo = {
            handler,
            boundHandler: handler.bind(this.bindee),
            count
        };

        this.eventHandlerInfos[eventId].push(eventHandlerInfo);
    }

    once(eventId, handler) {
        this.on(eventId, handler, 1);
    }

    remove(eventId, handler) {
        if (handler == null) {
            const handlerInfos = this.eventHandlerInfos[eventId];

            if (handlerInfos) {
                for (const handlerInfo of handlerInfos) {
                    handlerInfo.handler = null;
                    handlerInfo.boundHandler = null;
                    handlerInfo.count = null;
                }

                this.eventHandlerInfos[eventId].splice(0);
            }

            delete this.eventHandlerInfos[eventId];
        }
        else {
            const handlerInfos = this.eventHandlerInfos[eventId];
            if (handlerInfos == null) { return }

            const handlerInfo = handlerInfos.find(handlerInfo => handlerInfo.handler === handler);
            const index = handlerInfos.indexOf(handlerInfo);
            if (index >= 0) {
                handlerInfo.handler = null;
                handlerInfo.boundHandler = null;
                handlerInfo.count = null;

                handlerInfos.splice(index, 1);
            }
        }
    }

    emit(eventId, ...args) {
        const handlerInfos = this.eventHandlerInfos[eventId];
        if (handlerInfos == null) { return }

        handlerInfos.forEach(handlerInfo => {
            const { boundHandler, count } = handlerInfo;

            if (count <= 0) { return }

            handlerInfo.count -= 1;

            boundHandler(...args, this.bindee);
        });

        if (this.eventHandlerInfos == null) { return }

        if (this.eventHandlerInfos[eventId] == null || this.eventHandlerInfos[eventId].length <= 0) {
            delete this.eventHandlerInfos[eventId];
        }
        else {
            this.eventHandlerInfos[eventId] = this.eventHandlerInfos[eventId].filter(({ count }) => count > 0);
        }
    }

    dispose() {
        this.bindee = null;

        Object.keys(this.eventHandlerInfos).forEach(
            eventId => this.remove(eventId)
        );
        this.eventHandlerInfos = null;
    }
}