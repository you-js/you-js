import { DataWriter } from './data-writer.js';
import { LocalStorageDataWriter } from './local-storage-data-writer.js';
import { FileDataWriter } from './file-data-writer.js';

export class ProjectDataWriter extends DataWriter {

    constructor({
        method='local-storage',
    }) {
        super();

        this.method = method;
    }

    write(data, ...args) {
        if (this.method === 'local-storage') {
            const key = args[0];

            this.#writeToLocalStorage(data, key);
        }
        else if (this.method === 'file') {
            const filePath = args[0];

            this.#writeToFile(data, filePath);
        }
        else {
            throw `Unknown method: ${this.method}`;
        }
    }

    #writeToLocalStorage(text, key) {
        const dataWriter = new LocalStorageDataWriter();

        dataWriter.write(text, key);
    }

    #writeToFile(text, filePath) {
        const dataWriter = new FileDataWriter();

        dataWriter.write(text, filePath);
    }
}