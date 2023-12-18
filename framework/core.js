import { Looper } from "./looper.js";
import { Mouse } from "./mouse.js";
import { Keyboard } from "./keyboard.js";
import { Screen } from "./screen.js";
import { Application } from "../application.js";

export class Core {

    #screen = null;
    application = null;

    constructor({
        screen=null,
    }={}) {
        this.#screen = screen;

        this.looper = new Looper();
        this.mouse = new Mouse();
        this.keyboard = new Keyboard();

        if (screen != null) {
            this.mouse.startListening(screen);
        }
    }

    get screen() { return this.#screen }
    set screen(value) {
        if (value == null) {
            throw `screen is null`;
        }

        if (!(value instanceof Screen)) {
            throw `screen is not an instance of Screen: ${value}`;
        }

        this.mouse.stopListening();
        this.#screen = value;
        this.mouse.startListening(value);
    }

    start(assets, application) {
        if (this.#screen == null) {
            throw `screen is null`;
        }

        if (application == null) {
            throw `application is null`;
        }

        if (!(application instanceof Application)) {
            throw `application is not an instance of Application: ${application}`;
        }

        this.application = application;
        this.application.connect({ type: 'screen',   object: this.#screen  });
        this.application.connect({ type: 'mouse',    object: this.mouse    });
        this.application.connect({ type: 'keyboard', object: this.keyboard });

        (async () => {
            await this.application.load(assets);
            this.application.create();

            this.looper.start(deltaTime => {
                this.application.update(deltaTime);

                if (document.visibilityState === 'visible') {
                    this.application.render();
                }
            });
        })();
    }

    stop() {
        this.looper.stop();

        (async () => {
            this.application.destroy();
            this.application.disconnect();
            this.application = null;
        })();
    }
}