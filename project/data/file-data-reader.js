import { DataReader } from './data-reader.js';
import dataModule from "../../data/data.js";

export class FileDataReader extends DataReader {

    async read(path) {
        return await dataModule.load(path, null);
    }
}