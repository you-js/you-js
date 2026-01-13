// Storage System (Platform Agnostic)

class WebStorage {
    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error("WebStorage Save Error:", e);
            return false;
        }
    }

    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("WebStorage Load Error:", e);
            return null;
        }
    }

    remove(key) {
        localStorage.removeItem(key);
    }

    clear() {
        localStorage.clear();
    }
}

class DesktopStorage {
    constructor(bridge) {
        this.bridge = bridge;
    }

    save(key, data) {
        // Assuming the ContextBridge exposes a method like 'saveData(key, data)'
        // If not, we might need to fallback or warn.
        if (this.bridge && typeof this.bridge.saveData === 'function') {
            return this.bridge.saveData(key, JSON.stringify(data, null, 2));
        }
        console.warn("DesktopStorage: 'saveData' method not found on bridge.");
        return false;
    }

    load(key) {
        if (this.bridge && typeof this.bridge.loadData === 'function') {
             const data = this.bridge.loadData(key);
             try {
                 return data ? JSON.parse(data) : null;
             } catch (e) {
                 console.error("DesktopStorage Parse Error:", e);
             }
        }
        return null;
    }

    remove(key) {
        if (this.bridge && typeof this.bridge.removeData === 'function') {
            this.bridge.removeData(key);
        }
    }

    clear() {
        // Optional
    }
}

export const Storage = {
    _impl: null,

    _init() {
        // Check for Electron ContextBridge
        // Standard convention: window.electron or window.api
        const bridge = window.electron || window.api || window.electronContextBridge;
        
        if (bridge) {
            console.log("[Gemmer] Using Desktop Storage");
            this._impl = new DesktopStorage(bridge);
        } else {
            console.log("[Gemmer] Using Web Storage (localStorage)");
            this._impl = new WebStorage();
        }
    },

    save(key, data) {
        if (!this._impl) this._init();
        return this._impl.save(key, data);
    },

    load(key) {
        if (!this._impl) this._init();
        return this._impl.load(key);
    },
    
    remove(key) {
        if (!this._impl) this._init();
        this._impl.remove(key);
    },

    clear() {
        if (!this._impl) this._init();
        this._impl.clear();
    }
};
