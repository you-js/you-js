export class Data {

    async load(filePath, defaults) {
        const base = import.meta.resolve('resources');
        const requestUrl = new URL('load/', base).href;
        const response = await fetch(requestUrl, {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'applicatoin/json' },
            body: JSON.stringify({ filePath, defaults }),
        });

        const data = await response.text();

        return data;
    }

    async save(filePath, data) {
        const base = import.meta.resolve('resources');
        const requestUrl = new URL('save/', base).href;

        return fetch(requestUrl, {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'applicatoin/json' },
            body: JSON.stringify({ filePath, data }),
        })
        .then(value => value.text())
        .then(result => {
            if (result === 'false') {
                console.error(`fail to save: ${filePath}`, data);
            }

            return result;
        });
    }

    async clear(filePath) {
        const base = import.meta.resolve('resources');
        const requestUrl = new URL('clear/', base).href;

        return fetch(requestUrl, {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'applicatoin/json' },
            body: JSON.stringify({ filePath }),
        })
        .then(value => value.text())
        .then(result => {
            if (result === 'false') {
                console.error(`fail to clear: ${filePath}`);
            }

            return result;
        });
    }

    async getResourceContainer() {
        const base = import.meta.resolve('resources');
        const requestUrl = new URL('.', base).href;
        const response = await fetch(requestUrl, {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'text/plain' },
        });

        const resourceContainer = await response.json();

        return resourceContainer;
    }
}