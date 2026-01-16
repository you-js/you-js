// Test script for Audio System
import { AudioManager, AudioSource } from '../src/core/audio-system.js';

console.log('=== Gemmer Audio System Test ===');

// 1. AudioSource Basic Logic (Mocking Audio element behavior)
console.log('\n--- AudioSource Tests ---');

// Since we are in Node.js, globalThis.Audio is not available by default.
// We need to mock it for this test script to pass.
globalThis.Audio = class MockAudio {
    constructor(src) {
        this.src = src;
        this.volume = 1;
        this.loop = false;
        this.paused = true;
        this.currentTime = 0;
        this.ended = false;
        this.listeners = {};
    }
    addEventListener(event, cb) {
        this.listeners[event] = cb;
        // Auto-trigger canplaythrough for testing
        if (event === 'canplaythrough') setTimeout(cb, 10);
    }
    play() {
        this.paused = false;
        console.log(`[MockAudio] Playing: ${this.src}`);
        return Promise.resolve();
    }
    pause() {
        this.paused = true;
        console.log(`[MockAudio] Paused: ${this.src}`);
    }
};

const audioSource = new AudioSource({ source: 'assets/test_sound.mp3', volume: 0.5, loop: true });
console.log(
    `AudioSource created. Volume: ${audioSource.volume}, Loop: ${audioSource.loop} (Expected: 0.5, true)`
);

audioSource.play();
console.log(`Is Playing: ${audioSource.isPlaying} (Expected: true)`);

audioSource.stop();
console.log(`Is Playing after Stop: ${audioSource.isPlaying} (Expected: false)`);

// 2. AudioManager Tests
console.log('\n--- AudioManager Tests ---');
const audioMgr = new AudioManager();
audioMgr.add('bgm', 'assets/bgm.mp3');

console.log("Playing 'bgm'...");
audioMgr.play('bgm');

console.log("Playing 'bgm' OneShot (Clone)...");
audioMgr.playOneShot('bgm');

console.log('\n=== Test Complete ===');
