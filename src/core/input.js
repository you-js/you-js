// Keyboard input manager
// Provides simple frame-aware key state queries using full-word identifiers

export class InputManager {
    constructor() {
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.keysReleased = new Set();

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);

        this.startListening();
    }

    startListening() {
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    stopListening() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }

    _onKeyDown(event) {
        const key = event.key;
        if (!this.keysDown.has(key)) {
            this.keysPressed.add(key);
        }
        this.keysDown.add(key);
    }

    _onKeyUp(event) {
        const key = event.key;
        this.keysDown.delete(key);
        this.keysReleased.add(key);
    }

    // Is the key currently held down?
    isKeyDown(key) {
        return this.keysDown.has(key);
    }

    // Was the key pressed during this frame?
    wasKeyPressed(key) {
        return this.keysPressed.has(key);
    }

    // Was the key released during this frame?
    wasKeyReleased(key) {
        return this.keysReleased.has(key);
    }

    // Clear per-frame pressed/released state; call once per frame
    clearFrame() {
        this.keysPressed.clear();
        this.keysReleased.clear();
    }
}

export const input = new InputManager();
