import { Component } from '../component.js';
import { StateMachine } from '../state-machine.js';

export class StateMachineComponent extends Component {
    constructor(stateMachine, initialStateName) {
        super();
        if (!(stateMachine instanceof StateMachine)) {
            throw new Error('StateMachineComponent: stateMachine must be a StateMachine');
        }
        this.stateMachine = stateMachine;
        this.initialStateName = initialStateName;
    }

    start() {
        this.stateMachine.start(this.initialStateName);
    }

    update(deltaTime) {
        this.stateMachine.update(deltaTime);
    }

    onDetach() {
        try {
            this.stateMachine.stop();
        } finally {
            this._hasStarted = false;
            super.onDetach();
        }
    }

    onDestroy() {
        this.stateMachine.stop();
    }
}
