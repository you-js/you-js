import { DataWriter } from './data-writer.js';
import dataModule from "../../data/data.js";

export class FileDataWriter extends DataWriter {

    write(data, path) {
        dataModule.save(path, data);
    }
}