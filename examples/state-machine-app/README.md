# State machine example

Run `npm run dev` from the repository root and open `/examples/state-machine-app/`.
Arrow keys move the square. Cyan means `idle`; orange means `move`.

Create a separate `StateMachine(context)` and separate `State` instances for each
entity. Register states with `addState(name, state)`, then attach
`new StateMachineComponent(stateMachine, 'idle')` to the entity. The component
starts the machine automatically, so do not also call `start()` yourself.

`State` provides `enter(context)`, `update(context, deltaTime)`, and `exit(context)`.
Keep game-specific dependencies in the context. The machine does not render or
read input itself. `currentStateName` is read-only and is `null` while stopped.

`changeState(name)` requires a running machine and queues a transition for the
next update. The last request wins; requesting the current state cancels a pending
transition. Requests inside lifecycle callbacks also wait until the next update.
`stop()` exits once and clears pending transitions. Detaching or destroying the
component stops the machine; reattaching starts it from its initial state.
Disabling the entity pauses updates without exiting its state.

Lifecycle callbacks are synchronous; exceptions propagate to the caller.
States and machines must not be shared between entities. A single machine has
one active state and does not automatically control animations.
