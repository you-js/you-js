export class Data {

    load(filePath, defaults) {
        return window.electronContextBridge.loadData(filePath, defaults);
    }

    save(filePath, data) {
        return window.electronContextBridge.saveData(filePath, data);
    }

    clear(filePath) {
        return window.electronContextBridge.clearData(filePath);
    }

    getResourceContainer() {
        const resourceDirectoryPath = 'app/resources';
        const resourceContainer = window.electronContextBridge.parseResourceDirectory(resourceDirectoryPath);

        return resourceContainer;
    }
}