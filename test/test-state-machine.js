import assert from 'node:assert/strict';
import { State } from '../src/core/state.js';
import { StateMachine } from '../src/core/state-machine.js';
import { StateMachineComponent } from '../src/core/components/state-machine.js';
import { Entity } from '../src/core/entity.js';

class RecordingState extends State {
    constructor(
        name,
        { enterTarget = null, updateTarget = null, exitTarget = null, stopOnExit = false } = {}
    ) {
        super();
        this.name = name;
        this.enterTarget = enterTarget;
        this.updateTarget = updateTarget;
        this.exitTarget = exitTarget;
        this.stopOnExit = stopOnExit;
    }

    enter(context) {
        context.events.push(`${this.name}:enter`);
        if (this.enterTarget) context.machine.changeState(this.enterTarget);
    }

    update(context, deltaTime) {
        context.events.push(`${this.name}:update:${deltaTime}`);
        if (this.updateTarget) context.machine.changeState(this.updateTarget);
    }

    exit(context) {
        context.events.push(`${this.name}:exit`);
        if (this.exitTarget) context.machine.changeState(this.exitTarget);
        if (this.stopOnExit) context.machine.stop();
    }
}

function createFixture(options = {}) {
    const context = { events: [], machine: null };
    context.machine = new StateMachine(context);
    for (const name of ['idle', 'move', 'attack']) {
        context.machine.addState(name, new RecordingState(name, options[name]));
    }
    return context;
}

{
    const { machine, events } = createFixture();
    assert.equal(machine.currentStateName, null);
    machine.update(1);
    machine.stop();
    assert.deepEqual(events, []);
    machine.start('idle');
    assert.deepEqual(events, ['idle:enter']);
    assert.throws(() => machine.start('move'), /already running/);
    assert.throws(() => {
        machine.currentStateName = 'move';
    }, TypeError);
    machine.changeState('move');
    assert.equal(machine.currentStateName, 'idle');
    machine.update(0.25);
    assert.deepEqual(events, ['idle:enter', 'idle:exit', 'move:enter', 'move:update:0.25']);
    machine.changeState('attack');
    machine.changeState('idle');
    machine.update(0.5);
    assert.equal(machine.currentStateName, 'idle');
    assert.deepEqual(events.slice(-3), ['move:exit', 'idle:enter', 'idle:update:0.5']);
    machine.changeState('attack');
    machine.changeState('idle');
    machine.update(1);
    assert.deepEqual(events.slice(-2), ['idle:update:0.5', 'idle:update:1']);
    machine.changeState('move');
    machine.stop();
    machine.stop();
    machine.update(1);
    assert.equal(events.filter(event => event === 'idle:exit').length, 2);
    assert.equal(machine.currentStateName, null);
    machine.start('idle');
    machine.update(1);
    assert.equal(machine.currentStateName, 'idle');
}

// Each lifecycle callback can request a transition, but cannot apply it recursively.
for (const callback of ['enterTarget', 'updateTarget', 'exitTarget']) {
    const options =
        callback === 'exitTarget'
            ? { idle: { exitTarget: 'attack' } }
            : { move: { [callback]: 'attack' } };
    const { machine, events } = createFixture(options);
    machine.start('idle');
    machine.changeState('move');
    machine.update(1);
    assert.equal(machine.currentStateName, 'move');
    assert.deepEqual(events, ['idle:enter', 'idle:exit', 'move:enter', 'move:update:1']);
    machine.update(2);
    assert.equal(machine.currentStateName, 'attack');
    assert.deepEqual(events.slice(-3), ['move:exit', 'attack:enter', 'attack:update:2']);
}

{
    const { machine, events } = createFixture({ idle: { enterTarget: 'move' } });
    machine.start('idle');
    assert.deepEqual(events, ['idle:enter']);
    machine.update(1);
    assert.equal(machine.currentStateName, 'move');
}

{
    const { machine, events } = createFixture({ idle: { stopOnExit: true } });
    machine.start('idle');
    machine.changeState('move');
    machine.update(1);
    assert.deepEqual(events, ['idle:enter', 'idle:exit']);
    assert.equal(machine.currentStateName, null);
}

{
    const { machine } = createFixture();
    assert.throws(() => machine.addState('idle', new State()), /duplicate/);
    assert.throws(() => machine.addState('', new State()), /non-empty/);
    assert.throws(() => machine.addState('invalid', {}), /instance of State/);
    assert.throws(() => machine.start('missing'), /unknown state/);
    assert.throws(() => machine.changeState('missing'), /unknown state/);
    assert.throws(() => machine.changeState('move'), /not running/);
    assert.throws(() => new StateMachineComponent({}, 'idle'), /must be a StateMachine/);
    machine.start('idle');
    machine.changeState('move');
    assert.throws(() => machine.changeState('missing'), /unknown state/);
    machine.update(1);
    assert.equal(machine.currentStateName, 'move');
}

{
    const { machine, events } = createFixture();
    const entity = new Entity();
    const component = new StateMachineComponent(machine, 'idle');
    entity.addComponent(component);
    entity.start();
    entity.start();
    entity.update(1);
    assert.deepEqual(events, ['idle:enter', 'idle:update:1']);
    entity.isEnabled = false;
    machine.changeState('move');
    entity.update(1);
    assert.equal(machine.currentStateName, 'idle');
    assert.equal(events.length, 2);
    entity.isEnabled = true;
    entity.update(1);
    assert.equal(machine.currentStateName, 'move');
    entity.removeComponent(component);
    assert.equal(component.entity, null);
    assert.equal(component._hasStarted, false);
    assert.equal(machine.currentStateName, null);
    entity.addComponent(component);
    entity.update(2);
    assert.deepEqual(events.slice(-2), ['idle:enter', 'idle:update:2']);
    entity.destroy();
    entity.destroy();
    entity.removeComponent(component);
    assert.equal(events.filter(event => event === 'idle:exit').length, 2);
    assert.equal(events.filter(event => event === 'move:exit').length, 1);
}

{
    const first = createFixture();
    const second = createFixture();
    first.machine.start('idle');
    second.machine.start('idle');
    first.machine.changeState('move');
    first.machine.update(1);
    assert.equal(second.machine.currentStateName, 'idle');
    assert.deepEqual(second.events, ['idle:enter']);
    const machine = new StateMachine({});
    machine.addState('empty', new State());
    machine.start('empty');
    machine.update(1);
    machine.stop();
}

console.log('State machine and Entity lifecycle assertions passed.');
