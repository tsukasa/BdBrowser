export default class LocalStorage {

    static {
        if (!this.localStorage && window.bdbrowserLocalStorage) {
            this.localStorage = window.bdbrowserLocalStorage;
            delete window.bdbrowserLocalStorage;
        }
    }

    static getItem(key, fallbackValue) {
        let value = this.localStorage.getItem(key);

        if (value != null) {
            try {
                value = JSON.parse(value);
            }
            catch (e) {
                value = fallbackValue;
            }
        }
        else {
            value = fallbackValue;
        }

        return value;
    }

    static setItem(key, item) {
        this.localStorage.setItem(key, JSON.stringify(item));
    }
}
