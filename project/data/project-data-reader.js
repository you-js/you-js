import { DataReader } from './data-reader.js';
import { LocalStorageDataReader } from './local-storage-data-reader.js';
import { FileDataReader } from './file-data-reader.js';

export class ProjectDataReader extends DataReader {

    constructor({
        method='local-storage',
    }) {
        super();

        this.method = method;
    }

    async read(data, ...args) {
        if (this.method === 'local-storage') {
            const key = args[0];

            return this.#readToLocalStorage(data, key);
        }
        else if (this.method === 'file') {
            const filePath = args[0];

            return await this.#readToFile(data, filePath);
        }
        else {
            throw `Unknown method: ${this.method}`;
        }
    }

    #readToLocalStorage(text, key) {
        const dataReader = new LocalStorageDataReader();

        return dataReader.read(text, key);
    }

    async #readToFile(text, filePath) {
        const dataReader = new FileDataReader();

        return await dataReader.read(text, filePath);
    }
}