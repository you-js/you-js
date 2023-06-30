if (!globalThis.isSecureContext) {
    if (!globalThis.crypto) {
        globalThis.crypto = await import('crypto');
    }
    else {
        globalThis.crypto.randomUUID = function () {
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ globalThis.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    }
}