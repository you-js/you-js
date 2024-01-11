let currentLanguageId;

const languageMap = new Map();

function setLanguageData(languageId, data) {
    languageMap.set(languageId, data);
}

function getLanguageData(languageId) {
    return languageMap.get(languageId);
}

function selectLanguage(languageId) {
    if (!languageMap.has(languageId)) {
        throw 'Language not found';
    }

    currentLanguageId = languageId;
}

export function lang(strings, ...keys) {
    const totalString = strings.slice(1).reduce((acc, cur, idx) => acc + keys[idx] + cur, strings[0]);
    const accessors = totalString.split('.');

    let string = languageMap.get(currentLanguageId);

    for (let i = 0; i < accessors.length; i++) {
        if (!(accessors[i] in string)) {
            throw `cannot find string data in ${currentLanguageId}: ${totalString}`;
        }

        string = string[accessors[i]];
    }

    return string;
}

export default {
    setLanguageData,
    getLanguageData,
    selectLanguage,
};