import { Image } from "./graphic/image.js";

const REFERENCE_STRING_FORMAT = /^[^@]*@(\/*([^*./<>?:"|\\/]+\/)*[^*./<>?:"|\\/]+[.][^*./<>?:"|\\/]+)(:[^.]+([.][^.]+)*)?$/;
const USER_DEFINED_CLASS_PREFIX_FORMAT = /^((?:(?:[^*./<>?:"|\\/]+|[.][.]?)\/)*[^*./<>?:"|\\/]+[.][^*./<>?:"|\\/]+):([a-zA-Z_]\w*)$/;
const LOCATOR_STRING_FORMAT = /^([^*./<>?:"|\\/]+\/)*[^*./<>?:"|\\/]+([.][^*./<>?:"|\\/]+)*$/;

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

class NotFoundNodeError extends Error {}

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

    _refer(node) {
        this[REFER_TO].push(node);
        node[REFER_FROM].push(this);
    }

    async load() {
        if (this[LOADED]) { return this }

        const base = import.meta.resolve('resources');
        const path = new URL(this[PATH], base).href;

        if (path.endsWith('.json')) {
            const response = await fetch(path);
            const data = await response.json();
            this[DATA] = await this._parse(data);
        }
        else if (path.endsWith('.png')) {
            this[DATA] = new Image(path);
        }
        else { throw `not supported file: ${path}` }

        this[LOADED] = true;
        this[PARENT]?._refresh();

        return this;
    }

    async _parse(data) {
        if (typeof data === 'string') {
            return await this._parseString(data);
        }
        else if (data instanceof Object) {
            return await this._parseObject(data);
        }
        else if (data instanceof Array) {
            return await this._parseArray(data);
        }
        else {
            return data;
        }
    }

    async _parseString(string) {
        const isReferenceString = REFERENCE_STRING_FORMAT.test(string);
        if (isReferenceString) {
            return await this._parseReferenceString(string);
        }
        else {
            return string;
        }
    }

    async _parseReferenceString(string) {
        const [prefix, refPath, postfix] = string.split(/@|:/);
        const accessors = postfix?.split('.') ?? [];

        if (prefix === 'create') {
            const base = import.meta.resolve('app');
            const path = new URL(refPath, base).href;

            if (path.endsWith('.json')) {
                const response = await fetch(path);
                const data = await response.json();
                return await this._parse(data);
            }
            else if (path.endsWith('.png')) {
                return new Image(path);
            }
            else { throw `not supported file: ${path}` }
        }
        else {
            let node = null;

            try {
                if (refPath.startsWith('resources')) {
                    node = this.root._get(refPath.slice(10));
                    await node.load();
                    this._refer(node);
                }
                else {
                    throw new NotFoundNodeError();
                }
            }
            catch(e) {
                if (e instanceof NotFoundNodeError) { return e }
                else { throw e }
            }

            const data = accessors.reduce((acc, cur) => acc[cur], node[DATA]);
            return data;
        }
    }

    async _parseObject(object) {
        for (const key in object) {
            object[key] = await this._parse(object[key]);
        }

        const isInstantiatableObject = '@class' in object;
        if (isInstantiatableObject) {
            return this._parseInstantiatableObject(object);
        }
        else {
            return object;
        }
    }

    async _parseInstantiatableObject(object) {
        const type = await this._parseUserDefinedClassString(object['@class']);

        const hasInstantiator = '@instantiator' in object;
        if (hasInstantiator) {
            const instantiator = object['@instantiator'];
            return type[instantiator](object);
        }
        else {
            return new type(object);
        }
    }

    async _parseUserDefinedClassString(string) {
        const matched = string.match(USER_DEFINED_CLASS_PREFIX_FORMAT);
        const isNotUserDefinedClassString = matched === null;
        if (isNotUserDefinedClassString) { throw `invalid syntax: ${string}` }

        const base = import.meta.resolve('app');
        const path = new URL(matched[1], base).href;
        const name = matched[2];

        const module = await import(path);
        const type = module[name];

        return type;
    }

    async _parseArray(array) {
        return Promise.all(array.map(item => this._parse(item)));
    }

    release() {
        while (this[REFER_FROM].length >= 1) {
            this[REFER_FROM].pop().release();
        }

        while (this[REFER_TO].length >= 1) {
            const referee = this[REFER_TO].pop();
            const index = referee[REFER_FROM].indexOf(this);
            if (index >= 0) {
                referee[REFER_FROM].splice(index, 1);
                if (referee[REFER_FROM].length <= 0) {
                    referee.release();
                }
            }
        }

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

    _get(locator) {
        const isLocatorString = LOCATOR_STRING_FORMAT.test(locator);
        if (!isLocatorString) { throw `invalid locator: ${locator}` }

        let assetObject = this;
        const steps = locator.split('/');
        for (const step of steps) {
            assetObject = this._getChildObject(assetObject, step);
        }

        return assetObject;
    }

    _getChildObject(object, childObjectId) {
        const isEmptyObject = object === null;
        if (isEmptyObject) { throw new NotFoundNodeError() }

        return object[CHILDREN][childObjectId] ?? object[childObjectId] ?? null;
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