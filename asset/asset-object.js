const PARENT = Symbol('parent');
const PATH = Symbol('path');
const LOADED = Symbol('loaded');
const REFRESH = Symbol('refresh');

export class AssetObject {

    static PARENT = PARENT;
    static PATH = PATH;
    static LOADED = LOADED;
    static REFRESH = REFRESH;

    constructor({
        parent=null, path=null,
    }={}) {
        Object.defineProperties(this, {
            [PARENT]: { value: parent },
            [PATH]: { value: path },
            [LOADED]: { value: false, writable: true },
        });
    }

    get root() {
        return this[PARENT] == null ? this : this[PARENT].root;
    }

    [REFRESH]() {}
}