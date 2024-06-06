import { ResourceParser } from "./asset/resource-parser.js";
import data from "./data/data.js";
import { Core } from "./framework/core.js";
import { Screen } from "./framework/screen.js";
import platform from "./platform.js";
import { } from "./utility/array.js";
import { } from "./utility/geometry.js";
import { } from "./utility/math.js";
import { } from "./utility/uuid.js";
import { } from "./utility/vector.js";

let core = null;

async function start(configurations) {
    const screen = new Screen(configurations.screen);
    const application = new configurations.application();
    const assets = ResourceParser.parse(configurations.resources ?? await data.getResourceContainer());

    core = new Core({ screen });

    globalThis.core = core;
    globalThis.application = application;
    globalThis.screen = screen;
    globalThis.assets = assets;
    globalThis.mouse = core.mouse;
    globalThis.keyboard = core.keyboard;
    globalThis.canvas = document.createElement('canvas');

    core.start(assets, application);
}

function stop() {
    core.stop();
    core = null;

    const platformId = platform.getId();

    if (platformId === 'desktop') {
        window.electronContextBridge.exit();
    }
    else if (platformId === 'web') {
        window.location.reload();
    }
}

export default {
    start,
    stop,
};