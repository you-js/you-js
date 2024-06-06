import { DataReader } from './data-reader.js';

export class LocalStorageDataReader extends DataReader {

    read(key) {
        return localStorage.getItem(key);
    }
}