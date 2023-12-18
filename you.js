import {} from "./utility/array.js";
import {} from "./utility/vector.js";
import {} from "./utility/geometry.js";
import {} from "./utility/math.js";
import {} from "./utility/uuid.js";
import { Screen } from "./framework/screen.js";
import { ResourceParser } from "./asset/resource-parser.js";
import { Core } from "./framework/core.js";

function start(configurations) {
    const screen = new Screen(configurations.screen);
    const application = new configurations.application();
    const assets = ResourceParser.parse(configurations.resources);

    const core = new Core({ screen });

    globalThis.core = core;
    globalThis.application = application;
    globalThis.screen = screen;
    globalThis.assets = assets;
    globalThis.mouse = core.mouse;
    globalThis.keyboard = core.keyboard;
    globalThis.canvas = document.createElement('canvas');

    core.start(assets, application);
}

export default { start };