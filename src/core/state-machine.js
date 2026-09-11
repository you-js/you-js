import { State } from './state.js';

export class StateMachine {
    constructor(context) {
        this.context = context;
        this._states = new Map();
        this._currentStateName = null;
        this._pendingStateName = null;
        this._isRunning = false;
        this._isUpdating = false;
        this._isExiting = false;
    }

    get currentStateName() {
        return this._currentStateName;
    }

    addState(name, state) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('StateMachine.addState: name must be a non-empty string');
        }
        if (this._states.has(name)) {
            throw new Error(`StateMachine.addState: duplicate state '${name}'`);
        }
        if (!(state instanceof State)) {
            throw new Error('StateMachine.addState: state must be an instance of State');
        }
        this._states.set(name, state);
        return this;
    }

    _requireState(name) {
        if (!this._states.has(name)) {
            throw new Error(`StateMachine: unknown state '${name}'`);
        }
        return this._states.get(name);
    }

    start(name) {
        if (this._isRunning || this._isExiting || this._isUpdating) {
            throw new Error(
                'StateMachine.start: machine is already running or finishing a callback'
            );
        }
        const state = this._requireState(name);
        this._isRunning = true;
        this._currentStateName = name;
        this._pendingStateName = null;
        state.enter(this.context);
    }

    changeState(name) {
        this._requireState(name);
        if (!this._isRunning) {
            throw new Error('StateMachine.changeState: machine is not running');
        }
        this._pendingStateName = name === this._currentStateName ? null : name;
    }

    update(deltaTime) {
        if (!this._isRunning) return;
        if (this._isUpdating || this._isExiting) {
            throw new Error('StateMachine.update: recursive updates are not supported');
        }
        this._isUpdating = true;
        try {
            const nextStateName = this._pendingStateName;
            this._pendingStateName = null;
            if (nextStateName !== null && nextStateName !== this._currentStateName) {
                this._exitCurrentState();
                if (!this._isRunning) return;
                this._currentStateName = nextStateName;
                this._states.get(nextStateName).enter(this.context);
            }
            if (this._isRunning) {
                this._states.get(this._currentStateName).update(this.context, deltaTime);
            }
        } finally {
            this._isUpdating = false;
        }
    }

    _exitCurrentState() {
        this._isExiting = true;
        try {
            this._states.get(this._currentStateName).exit(this.context);
        } finally {
            this._isExiting = false;
        }
    }

    stop() {
        if (!this._isRunning) return;
        this._isRunning = false;
        this._pendingStateName = null;
        try {
            if (!this._isExiting) this._exitCurrentState();
        } finally {
            this._currentStateName = null;
        }
    }
}
