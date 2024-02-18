
// https://gist.github.com/JamesMessinger/a0d6389a5d0e3a24814b
export class AccountDatabase {

    constructor(private factory: IDBFactory) {

    }

    addAccount(account: Account): Promise<void> {
        const p = new Promise<void>(resolve => {

            const open = this.factory.open('emailwidget', 1);

            open.onupgradeneeded = () => {
                this.createDatabase(open.result);
            };
            open.onsuccess = () => {
                // Start a new transaction
                const db = open.result;
                const tx = db.transaction('Accounts', 'readwrite');
                const store = tx.objectStore('Accounts');

                store.put(account)
                    .onsuccess = () => resolve();

                tx.oncomplete = () => {
                    db.close();
                };

            };
        });
        return p;
    }

    updateAccount(account: Account): Promise<void> {
        const p = new Promise<void>(resolve => {
            const open = this.factory.open('emailwidget', 1);

            open.onupgradeneeded = () => {
                this.createDatabase(open.result);
            };

            open.onsuccess = () => {
                // Start a new transaction
                const db = open.result;
                const tx = db.transaction('Accounts', 'readwrite');
                const store = tx.objectStore('Accounts');

                store.put(account)
                    .onsuccess = () => resolve();

                tx.oncomplete = () => {
                    db.close();
                };

            };
        });
        return p;
    }

    removeAccount(account: Account): Promise<void> {
        const p = new Promise<void>(resolve => {
            const open = this.factory.open('emailwidget', 1);

            open.onupgradeneeded = () => {
                this.createDatabase(open.result);
            };

            open.onsuccess =  () => {
                // Start a new transaction
                const db = open.result;
                const tx = db.transaction('Accounts', 'readwrite');
                const store = tx.objectStore('Accounts');

                store.delete(account.id as IDBValidKey)
                    .onsuccess = () => resolve();

                tx.oncomplete =  () => {
                    db.close();
                };
            };
        });
        return p;
    }

    getAccounts(): Promise<Account[]> {
        const p = new Promise<Account[]>(resolve => {

            const open = this.factory.open('emailwidget', 1);

            open.onupgradeneeded = () => {
                this.createDatabase(open.result);
            };

            open.onsuccess =  () => {
                // Start a new transaction
                const db = open.result;
                const tx = db.transaction('Accounts', 'readwrite');
                const store = tx.objectStore('Accounts');

                const query = store.getAll();

                query.onsuccess = (result) => resolve(query.result);

                tx.oncomplete = () => {
                    db.close();
                };
            };
        });
        return p;
    }

    private createDatabase(db: IDBDatabase): void {
        const store = db.createObjectStore('Accounts', { keyPath: 'id', autoIncrement: true });
        store.createIndex('Name', 'name', { unique: true });
    }
}

export interface Account {
    id?: number;
    name: string;
    access_token: string;
    id_token: string | null;
    refresh_token: string | null;
    scope: string | null
}