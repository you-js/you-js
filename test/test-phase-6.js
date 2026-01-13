// Test script for Storage System
import { Storage } from '../src/core/storage.js';

console.log("=== Gemmer Storage System Test ===");

// 1. Mock Browser Environment (localStorage)
console.log("\n--- Mocking Web Environment ---");
const mockStore = {};
globalThis.localStorage = {
    getItem: (key) => {
        console.log(`[MockLS] Get: ${key} => ${mockStore[key]}`);
        return mockStore[key] || null;
    },
    setItem: (key, val) => {
        console.log(`[MockLS] Set: ${key} = ${val}`);
        mockStore[key] = val;
    },
    removeItem: (key) => {
        delete mockStore[key];
    },
    clear: () => {
        for (const k in mockStore) delete mockStore[k];
    }
};
// Ensure no existing window.electron mock
globalThis.window = { electron: undefined };


// Test Web Storage
Storage.save('playerScore', { score: 100, level: 2 });
const loaded = Storage.load('playerScore');
console.log(`Loaded Data:`, loaded);
console.log(`Verification: ${loaded.score === 100 ? 'PASS' : 'FAIL'}`);


// 2. Mock Desktop Environment (Electron Bridge)
console.log("\n--- Mocking Desktop Environment ---");
// Reset implementation to force re-init
Storage._impl = null;
globalThis.window.electron = {
    saveData: (key, data) => {
        console.log(`[MockElectron] Save: ${key} = ${data}`);
        return true;
    },
    loadData: (key) => {
        console.log(`[MockElectron] Load: ${key}`);
        return '{"score": 999}';
    }
};

Storage.save('desktopConfig', { resolution: '1080p' });
const desktopLoaded = Storage.load('desktopConfig');
console.log(`Desktop Loaded:`, desktopLoaded);
console.log(`Verification: ${desktopLoaded.score === 999 ? 'PASS' : 'FAIL'}`);

console.log("\n=== Test Complete ===");
