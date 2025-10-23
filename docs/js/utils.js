const dbName = "Attendance";
const dbVersion = 1; // Versioning is required for schema updates.
var db;

async function initDb() {
    db = await idb.openDB(dbName, dbVersion, {
        upgrade(db) {
            db.createObjectStore('meetings', { keyPath: 'meetingId' });
            db.createObjectStore('meetingInstances', { keyPath: ['meetingId', 'start'] });
            db.createObjectStore('students', { keyPath: 'email' });
            db.createObjectStore('attendance', { keyPath: ['meetingId', 'start', 'joined'] });
            // instanceStore.createIndex('meetingId', 'meetingId', { unique: true });
        },
    });
}

async function addRecord(storeName, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const tx = await db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            await store.add(data);
            await tx.done;
        } catch (err) {
            console.error(err);
            reject(err);
        }
        resolve();
    });
}

async function updateRecord(storeName, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const tx = await db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            await store.put(data);
            await tx.done;
        } catch (err) {
            console.error(err);
            reject(err);
        }
        resolve();
    });
}

async function getRecord(storeName, key) {
    return new Promise(async (resolve, reject) => {
        try {
            const tx = await db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            var record = await store.get(key);
            await tx.done;
            resolve(record);
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

async function getAll(storeName){
    return new Promise(async (resolve, reject) => {
        try {
            const tx = await db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            var records = await store.getAll();
            await tx.done;
            resolve(records);
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

