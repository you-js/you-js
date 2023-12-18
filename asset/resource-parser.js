import { AssetContainer } from "./asset-container.js";
import { AssetNode } from "./asset-node.js";

export class ResourceParser {

    static parse(resourceContainer) {
        if (resourceContainer instanceof Object === false) {
            resourceContainer = {};
        }

        return this.#parse(resourceContainer);
    }

    static #parse(currentResourceObject, parentAssetContainer, currentPath) {
        const currentAssetContainer = this.#createAssetContainer(parentAssetContainer, currentPath);

        for (const id in currentResourceObject) {
            const childResourceObject = currentResourceObject[id];

            const isNode = childResourceObject == null;

            if (isNode) {
                const [fileName, extension] = id.split('.');

                const containerPath = this.#joinPath(currentPath, fileName);

                let container = (
                    currentAssetContainer.has(fileName)
                    ? currentAssetContainer[fileName]
                    : this.#createAssetContainer(currentAssetContainer, containerPath)
                );

                if (currentAssetContainer.has(fileName)) {
                    container = currentAssetContainer[fileName];
                }
                else {
                    container = this.#createAssetContainer(currentAssetContainer, containerPath);
                }

                const nodePath = `${containerPath}.${extension}`;
                const node = this.#createAssetNode(container, extension, nodePath);

                container.addNode(extension, node);

                currentAssetContainer.addContainer(fileName, container);
            }
            else {
                const childPath = this.#joinPath(currentPath, id);

                const assetChildObject = this.#parse(childResourceObject, currentAssetContainer, childPath);

                currentAssetContainer.addContainer(id, assetChildObject);
            }
        }

        return currentAssetContainer;
    }

    static #joinPath(currentPath, id) {
        return currentPath == null ? id : `${currentPath}/${id}`;
    }

    static #createAssetNode(parentAssetContainer, id, path) {
        return new AssetNode({ parent: parentAssetContainer, id, path });
    }

    static #createAssetContainer(parentAssetContainer, path) {
        return new AssetContainer({ parent: parentAssetContainer, path });
    }
}