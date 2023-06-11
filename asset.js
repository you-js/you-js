import { Image } from "./graphic/image.js";

const PARENT = Symbol('parent');
const PATH = Symbol('path');
const LOADED = Symbol('loaded');
const DATA = Symbol('data');
const REFER_TO = Symbol('refer-to');
const REFER_FROM = Symbol('refer-from');
const CHILDREN = Symbol('children');

const ASSET_PROPERTIES = {
    PARENT, PATH, LOADED, DATA, REFER_TO, REFER_FROM, CHILDREN
};

export function parseResourceContainer(container) {
	container = container instanceof Object ? container : {};

	return parse(container, null, null);
}

function parse(resourceObject, parent, path) {
    if (resourceObject === null) {
        return createAssetNode(parent, path);
    }
    else {
        const container = createAssetContainer(parent, path);

        for (const id in resourceObject) {
            const childResourceObject = resourceObject[id];
            const childResourcePath = path === null ? id : `${path}/${id}`;
            const assetObject = parse(childResourceObject, container, childResourcePath);

            const isResourceNode = resourceObject[id] === null;
            const type = isResourceNode ? 'node' : 'container';
            addChildAssetObject[type](container, id, assetObject);
        }

        return container;
    }
}

function createAssetNode(parent, path) {
    return new AssetNode({ parent, path });
}

function createAssetContainer(parent, path) {
    return new AssetContainer({ parent, path });
}

const addChildAssetObject = {
    node: addChildAssetNode,
    container: addChildAssetContainer,
};

function addChildAssetNode(container, id, childNode) {
    container.addNode(id, childNode);
}

function addChildAssetContainer(container, id, childContainer) {
    container.addContainer(id, childContainer);
}

class AssetObject {

    static PARENT = PARENT;
    static PATH = PATH;
    static LOADED = LOADED;

    constructor({ parent=null, path=null }={}) {
        Object.defineProperties(this, {
            [PARENT]: { value: parent },
            [PATH]: { value: path },
            [LOADED]: { value: false, writable: true },
        });
    }

    get root() {
        return this[PARENT] ? this[PARENT].root : this;
    }
}

export class AssetNode extends AssetObject {

    static DATA = DATA;
    static REFER_TO = REFER_TO;
    static REFER_FROM = REFER_FROM;

    constructor({ parent=null, path=null }={}) {
        super({ parent, path });

        Object.defineProperties(this, {
            [DATA]: { value: null, writable: true },
            [REFER_TO]: { value: [] },
            [REFER_FROM]: { value: [] },
        });
    }

    async load() {
        const base = import.meta.resolve('resources');
        const path = new URL(this[PATH], base).href;

        if (path.endsWith('.json')) {
            const response = await fetch(path);
            this[DATA] = await response.json();
        }
        else if (path.endsWith('.png')) {
            this[DATA] = new Image(path);
        }
        else { throw `not supported file: ${path}` }

        this[LOADED] = true;
        this[PARENT]?._refresh();

        return this;
    }

    release() {
        this[DATA] = null;
        this[LOADED] = false;
        this[PARENT]?._refresh();
    }
}

export class AssetContainer extends AssetObject {

    static CHILDREN = CHILDREN;

    constructor({ parent=null, path=null }={}) {
        super({ parent, path });

        Object.defineProperties(this, {
            [CHILDREN]: { value: {} },
        });
    }

    *[Symbol.iterator]() {
        for (const id in this) {
            yield [id, this[id]];
        }
    }

    get ['@nodeKeys']() {
        return Object.keys(this[CHILDREN]);
    }

    get ['@nodeValues']() {
        return Object.values(this[CHILDREN]).map(child => child[DATA]);
    }

    get ['@nodeEntries']() {
        return Object.entries(this[CHILDREN]).map(([id, child]) => [id, child[DATA]]);
    }

    get ['@nodes']() {
        return Object.fromEntries(Object.entries(this[CHILDREN]).map(([id, child]) => [id, child[DATA]]));
    }

    get ['@containers']() {
        return {...this};
    }

    get ['@objects']() {
        return {...this['@nodes'], ...this['@containers']};
    }

    addNode(id, node) {
        this[CHILDREN][id] = node;
        Object.defineProperty(this, id, {
            get() { return node[DATA] },
        });
    }

    addContainer(id, container) {
        Object.defineProperty(this, id, {
            value: container,
            enumerable: true,
        });
    }

    async load(childId=null) {
        if (childId === null) {
            const assetObjects = [
                ...Object.values(this[CHILDREN]),
                ...Object.values(this),
            ];
            for (const assetObject of assetObjects) {
                await assetObject.load();
            }
        }
        else {
            await this[CHILDREN][childId].load();
        }

        return this;
    }

    _refresh() {
        const assetObjects = [
            ...Object.values(this),
            ...Object.values(this[CHILDREN]),
        ];

        this[LOADED] = assetObjects.some(assetObject => assetObject[LOADED]);
        this[PARENT]?._refresh();
    }

    release(childId=null) {
        if (childId === null) {
            const assetObjects = [
                ...Object.values(this[CHILDREN]),
                ...Object.values(this),
            ];
            for (const assetObject of assetObjects) {
                assetObject.release();
            }
        }
        else {
            this[CHILDREN][childId].release();
        }
    }
}

export default {
    PROPERTIES: ASSET_PROPERTIES,
    Node: AssetNode,
    Container: AssetContainer,
    parseResourceContainer,
};