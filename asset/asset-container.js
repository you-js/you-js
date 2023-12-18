import { AssetObject } from "./asset-object.js";

const CHILDREN = Symbol('children');

export class AssetContainer extends AssetObject {

    static CHILDREN = CHILDREN;

    constructor({
        parent=null, path=null,
    }={}) {
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

    get nodes() {
        return Object.fromEntries(
            Object.entries(this[CHILDREN]).map(
                ([id, child]) => [id, child[AssetObject.DATA]]
            )
        );
    }

    get containers() {
        return {...this};
    }

    has(id) {
        return id in this[CHILDREN];
    }

    addNode(id, node) {
        this[CHILDREN][id] = node;

        Object.defineProperty(this, id, {
            get() {
                return node;
            },
        });
    }

    addContainer(id, container) {
        Object.defineProperty(this, id, {
            value: container,
            enumerable: true,
        });
    }

    async load() {
        const assetObjects = [
            ...Object.values(this[CHILDREN]),
            ...Object.values(this),
        ];
        for (const assetObject of assetObjects) {
            await assetObject.load();
        }

        return this;
    }

    [AssetObject.REFRESH]() {
        const assetObjects = [
            ...Object.values(this),
            ...Object.values(this[CHILDREN]),
        ];

        this[AssetObject.LOADED] = assetObjects.some(assetObject => assetObject[AssetObject.LOADED]);
        this[AssetObject.PARENT]?.[AssetObject.REFRESH]();
    }

    release() {
        const assetObjects = [
            ...Object.values(this[CHILDREN]),
            ...Object.values(this),
        ];
        for (const assetObject of assetObjects) {
            assetObject.release();
        }
    }
}