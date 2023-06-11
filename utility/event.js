export class EventEmitter {

    constructor(bindingObject=null) {
        Object.defineProperty(this, 'bindingObject', { value: bindingObject });
        this.eventGroups = {};
    }

    on(event, listener, count=-1) {
        if (count === 0) { return }

        if (!(event in this.eventGroups)) {
            this.eventGroups[event] = [];
        }

        this.eventGroups[event].push([listener.bind(this.bindingObject), count]);
    }

    remove(event, listener=null) {
        if (listener === null) {
            delete this.eventGroups[event];
        }
        else if (event in this.eventGroups) {
            const index = this.eventGroups[event].map(l => l[0]).indexOf(listener);

            if (index >= 0) {
                this.eventGroups[event].splice(index, 1);
            }
        }
    }

    emit(event, ...args) {
        this.eventGroups[event]?.forEach(([listener, count], index) => {
            if (count > 0) {
                this.eventGroups[event][index][1] -= 1;
            }
            else if (count === 0) {
                this.eventGroups[event].splice(index, 1);
                return;
            }

            listener?.(...args);
        });
    }
}