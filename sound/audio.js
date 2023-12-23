export class Audio {

    constructor({
        source,
    }={}) {
        this.source = source;
        this.raw = new globalThis.Audio(source);
        this.raw._loaded = false;

        this.loading = new Promise((resolve, reject) => {
            this.raw.addEventListener('canplay', () => {
                this.raw._loaded = true;
                resolve();
            });
        });
    }

    play() {
        this.raw.currentTime = 0;
        this.raw.play();
    }
}