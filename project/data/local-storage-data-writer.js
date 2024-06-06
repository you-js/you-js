import { DataWriter } from './data-writer.js';

export class LocalStorageDataWriter extends DataWriter {

    write(data, key) {
        localStorage.setItem(key, data);
    }
}