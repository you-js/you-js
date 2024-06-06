function getId() {
    if (window.electronContextBridge != null) {
        return 'desktop';
    }
    else {
        return 'web';
    }
}

export default {
    getId,
};