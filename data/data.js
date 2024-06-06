import platform from '../platform.js';
import { Data as DesktopData } from './desktop.js';
import { Data as WebData } from './web.js';

function createDataObjectByPlatformId(platformId) {
    if (platformId === 'desktop') {
        return new DesktopData();
    }
    else if (platformId === 'web') {
        return new WebData();
    }
    else {
        throw 'not supported platform';
    }
}

const platformId = platform.getId();

const dataObject = createDataObjectByPlatformId(platformId);

export default {
    load: dataObject.load.bind(dataObject),
    save: dataObject.save.bind(dataObject),
    clear: dataObject.clear.bind(dataObject),
    getResourceContainer: dataObject.getResourceContainer.bind(dataObject),
};