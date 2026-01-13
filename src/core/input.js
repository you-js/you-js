import { Vector2 } from '../math/vector.js';

// Input manager for Keyboard and Mouse
export class InputManager {
    constructor() {
        // Keyboard State
        this.keysDown = new Set();
        this.keysPressed = new Set();
        this.keysReleased = new Set();

        // Mouse State
        this.mousePosition = new Vector2(0, 0);
        this.mouseButtonsDown = new Set();
        this.mouseButtonsPressed = new Set();
        this.mouseButtonsReleased = new Set();
        this.mouseWheelDelta = new Vector2(0, 0);

        // Binding
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._onContextMenu = this._onContextMenu.bind(this);

        this.startListening();
    }

    startListening() {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        
        // Use document for mouse events to catch drags outside canvas potentially
        // Or specific target if we want to restrict. Defaulting to window for broader capture.
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mouseup', this._onMouseUp);
        window.addEventListener('wheel', this._onWheel, { passive: false });
        window.addEventListener('contextmenu', this._onContextMenu);
    }

    stopListening() {
        if (typeof window === 'undefined') return;

        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('mousemove', this._onMouseMove);
        window.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('wheel', this._onWheel);
        window.removeEventListener('contextmenu', this._onContextMenu);
    }

    // --- Keyboard Handlers ---

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

    // --- Mouse Handlers ---

    _onMouseMove(event) {
        // We assume global window coordinates, might need adjustment relative to canvas
        // if canvas is offset. However, clientX/Y are viewport relative.
        // For game logic, we usually want canvas-relative or world-relative.
        // Let's store client coordinates here, and user can transform.
        // Ideally, we get the canvas rect if available.
        // For now, simple clientX/Y.
        
        // If we can access the game canvas, we should adjust.
        // But InputManager is often a singleton detached from Game instance specifics.
        // Let's rely on event.clientX/Y for now, and maybe offer a helper later.
        
        // Trying to be smart: if game singleton exists and has canvas, use it?
        // Let's stick to raw coordinates and maybe update if game is available.
        this.mousePosition.set(event.clientX, event.clientY);
    }

    _onMouseDown(event) {
        const button = event.button; // 0: Left, 1: Middle, 2: Right
        if (!this.mouseButtonsDown.has(button)) {
            this.mouseButtonsPressed.add(button);
        }
        this.mouseButtonsDown.add(button);
    }

    _onMouseUp(event) {
        const button = event.button;
        this.mouseButtonsDown.delete(button);
        this.mouseButtonsReleased.add(button);
    }

    _onWheel(event) {
        // Prevent default scrolling behavior if needed
        // event.preventDefault(); 
        this.mouseWheelDelta.set(event.deltaX, event.deltaY);
    }

    _onContextMenu(event) {
        event.preventDefault(); // Prevent context menu
    }

    // --- Public API ---

    // Keyboard
    isKeyDown(key) { return this.keysDown.has(key); }
    wasKeyPressed(key) { return this.keysPressed.has(key); }
    wasKeyReleased(key) { return this.keysReleased.has(key); }

    // Mouse
    get mouse() { return this.mousePosition; }
    
    isMouseButtonDown(button) { return this.mouseButtonsDown.has(button); }
    wasMouseButtonPressed(button) { return this.mouseButtonsPressed.has(button); }
    wasMouseButtonReleased(button) { return this.mouseButtonsReleased.has(button); }
    
    get scrollDelta() { return this.mouseWheelDelta; }

    // --- Lifecycle ---

    clearFrame() {
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouseButtonsPressed.clear();
        this.mouseButtonsReleased.clear();
        this.mouseWheelDelta.set(0, 0);
    }
}

export const input = new InputManager();
