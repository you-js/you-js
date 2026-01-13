// Audio Wrapper Class
export class AudioSource {
    constructor({ source, volume = 1, loop = false } = {}) {
        this.source = source; // URL string or path
        this.element = new globalThis.Audio(source);
        
        this.element.volume = Math.max(0, Math.min(1, volume));
        this.element.loop = loop;
        
        this.isLoaded = false;
        this.loadPromise = new Promise((resolve, reject) => {
            this.element.addEventListener('canplaythrough', () => {
                this.isLoaded = true;
                resolve(this);
            }, { once: true });
            
            this.element.addEventListener('error', (e) => {
                console.error(`AudioSource: Failed to load ${source}`, e);
                reject(e);
            }, { once: true });
        });
    }

    get volume() { return this.element.volume; }
    set volume(v) { this.element.volume = Math.max(0, Math.min(1, v)); }

    get loop() { return this.element.loop; }
    set loop(v) { this.element.loop = v; }

    get isPlaying() { return !this.element.paused; }

    play() {
        // Reset if it ended, or just play
        if (this.element.ended) {
            this.element.currentTime = 0;
        }
        
        const promise = this.element.play();
        if (promise !== undefined) {
            promise.catch(error => {
                console.warn(`AudioSource: Play prevented for ${this.source}. User interaction needed first?`, error);
            });
        }
    }

    pause() {
        this.element.pause();
    }

    stop() {
        this.element.pause();
        this.element.currentTime = 0;
    }
    
    // Create a clone for overlapping sound effects
    clone() {
        return new AudioSource({
            source: this.source,
            volume: this.volume,
            loop: this.loop
        });
    }
}

// Global Audio Manager (Singleton)
export class AudioManager {
    constructor() {
        this.sounds = new Map(); // Cache of AudioSources
        this.globalVolume = 1.0;
        this.muted = false;
    }

    add(name, source) {
        const audio = new AudioSource({ source });
        this.sounds.set(name, audio);
        return audio;
    }

    get(name) {
        return this.sounds.get(name);
    }

    play(name) {
        const sound = this.get(name);
        if (sound) {
            if (this.muted) {
                sound.volume = 0;
            } else {
                 // Adjust for global volume? 
                 // Note: HTMLAudioElement doesn't have a master gain without WebAudioAPI context.
                 // We rely on manually setting volume or sound.volume * globalVolume logic if we expand.
                 // For now, simple wrapper.
            }
            sound.play();
        } else {
            console.warn(`AudioManager: Sound '${name}' not found.`);
        }
    }
    
    // Play a one-shot sound (good for SFX that might overlap)
    playOneShot(name) {
        const sound = this.get(name);
        if (sound) {
            const clone = sound.clone();
            clone.volume = sound.volume; // Apply volume settings
            clone.play();
            // Cleanup? HTML Audio elements get GC'd if not referenced, but let's be safe?
            // Usually fine for simple usage.
        }
    }

    stop(name) {
        const sound = this.get(name);
        if (sound) sound.stop();
    }
}

export const audio = new AudioManager();
