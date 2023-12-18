import { Image } from "../graphic/image.js";
import { AssetObject } from "./asset-object.js";

const REFERENCE_STRING_FORMAT = /^[^@]*@(\/*([^*./<>?:"|\\/]+\/)*[^*./<>?:"|\\/]+[.][^*./<>?:"|\\/]+)(:[^.]+([.][^.]+)*)?$/;
const USER_DEFINED_CLASS_PREFIX_FORMAT = /^((?:(?:[^*./<>?:"|\\/]+|[.][.]?)\/)*[^*./<>?:"|\\/]+[.][^*./<>?:"|\\/]+):([a-zA-Z_]\w*)$/;
const LOCATOR_STRING_FORMAT = /^([^*./<>?:"|\\/]+\/)*[^*./<>?:"|\\/]+([.][^*./<>?:"|\\/]+)*$/;

const DATA = Symbol('data');
const REFER_TO = Symbol('refer-to');
const REFER_FROM = Symbol('refer-from');

export class AssetNode extends AssetObject {

    static DATA = DATA;
    static REFER_TO = REFER_TO;
    static REFER_FROM = REFER_FROM;

    constructor({
        parent=null, path=null,
        id,
    }={}) {
        super({ parent, path });

        Object.defineProperties(this, {
            id: { value: id },
            [DATA]: { value: null, writable: true },
            [REFER_TO]: { value: [] },
            [REFER_FROM]: { value: [] },
        });
    }

    get loaded() {
        return this[AssetObject.LOADED];
    }

    get data() {
        return this[DATA];
    }

    async load(reference=false) {
        if (reference === false) {
            this.#refer(this);
        }

        if (this[AssetObject.LOADED]) { return this }

        const path = this.#getPath('resources', this[AssetObject.PATH]);
        const data = await this.#loadDataFromPath(path);

        this[DATA] = data;
        this[AssetObject.LOADED] = true;
        this[AssetObject.PARENT]?.[AssetObject.REFRESH]();

        return this;
    }

    async _parse(data) {
        if (typeof data === 'string') {
            return await this.#parseString(data);
        }
        else if (data instanceof Object) {
            return await this.#parseObject(data);
        }
        else if (data instanceof Array) {
            return await this.#parseArray(data);
        }
        else {
            return data;
        }
    }

    async #parseString(string) {
        const isReferenceString = REFERENCE_STRING_FORMAT.test(string);

        if (isReferenceString) {
            return await this.#parseReferenceString(string);
        }
        else {
            return string;
        }
    }

    async #parseReferenceString(string) {
        const [prefix, referencePath, postfix] = string.split(/@|:/);

        const accessors = postfix?.split('.') ?? [];

        if (prefix === 'create') {
            const path = this.#getPath('app', referencePath);
            const data = await this.#loadDataFromPath(path);

            return data;
        }
        else {
            if (!referencePath.startsWith('resources')) {
                throw `invalid reference path: ${referencePath}`;
            }

            const node = this.#getByLocator(referencePath.slice(10));
            await node.load(true);

            this.#refer(node);

            const data = accessors.reduce((object, accessor) => object[accessor], node[DATA]);

            return data;
        }
    }

    async #parseObject(object) {
        for (const key in object) {
            object[key] = await this._parse(object[key]);
        }

        const isInstantiatableObject = '@class' in object;

        if (isInstantiatableObject) {
            const isGenerative = object['@generative'] === true;

            return this.#parseInstantiatableObject(object, isGenerative);
        }
        else {
            return object;
        }
    }

    async #parseInstantiatableObject(object, isGenerative=false) {
        const type = await this.#parseUserDefinedClassString(object['@class']);

        const hasInstantiator = '@instantiator' in object;

        if (hasInstantiator) {
            const instantiator = object['@instantiator'];

            return isGenerative
                ? { generate: argumentGetter => type[instantiator]({...object, ...(argumentGetter?.(object) ?? {})}) }
                : type[instantiator](object);
        }
        else {
            return isGenerative
                ? { generate: argumentGetter => new type({...object, ...(argumentGetter?.(object) ?? {})}) }
                : new type(object);
        }
    }

    async #parseUserDefinedClassString(string) {
        const matched = string.match(USER_DEFINED_CLASS_PREFIX_FORMAT);

        const isNotUserDefinedClassString = matched == null;
        if (isNotUserDefinedClassString) { throw `invalid syntax: ${string}` }

        const [_, pathInApplication, name] = matched;

        const path = this.#getPath('app', pathInApplication);

        const module = await import(path);
        const type = module[name];

        return type;
    }

    async #parseArray(array) {
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
        this[AssetObject.LOADED] = false;
        this[AssetObject.PARENT]?.[AssetObject.REFRESH]();
    }

    #getPath(specifier, path) {
        const base = import.meta.resolve(specifier);
        return new URL(path, base).href;
    }

    async #loadDataFromPath(path) {
        const extension = path.split('.').pop();

        switch (extension) {
            case 'png':
                return await this.#loadImageFromPath(path);
            case 'json':
                return await this.#loadJsonFromPath(path);
            default:
                throw `not supported file type: ${path}`;
        }
    }

    async #loadImageFromPath(path) {
        const image = new Image({ source: path });
        await image.loading;
        return image;
    }

    async #loadJsonFromPath(path) {
        const response = await fetch(path);
        const data = await response.json();
        return await this._parse(data);
    }

    #getByLocator(locator) {
        const isLocatorString = LOCATOR_STRING_FORMAT.test(locator);

        if (!isLocatorString) { throw `invalid locator: ${locator}` }

        let assetObject = this.root;

        const steps = locator.split(/[\/.]/);

        for (const step of steps) {
            assetObject = assetObject[step];

            if (assetObject == null) {
                throw `not found node: ${locator}`;
            }
        }

        return assetObject;
    }

    #refer(node) {
        this[REFER_TO].push(node);
        node[REFER_FROM].push(this);
    }
}