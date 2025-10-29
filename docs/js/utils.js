const dbName = "Attendance";
const dbVersion = 1; // Versioning is required for schema updates.
var db;

const DateTime = luxon.DateTime;
const CSV_DATE_FORMAT = "LL/dd/yyyy hh:mm:ss a";

function parseDateString(csvDateTime){
    try{
        var dt = DateTime.fromFormat(csvDateTime,CSV_DATE_FORMAT);
        var timeSimple = dt.toLocaleString(DateTime.TIME_SIMPLE);
        var dateSimple = dt.toLocaleString(DateTime.DATE_SHORT);
        var dateDow = dt.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

        var parsedDateTime = {
            "timeSimple": timeSimple,
            "dateSimple": dateSimple,
            "dateDow": dateDow
        }
        return parsedDateTime;

    } catch( err ) {
        console.error( err ) ;
    }
}

function csvTimeDuration( startCsvTime, endCsvTime){
    var start = DateTime.fromFormat(startCsvTime,CSV_DATE_FORMAT);
    var end = DateTime.fromFormat(endCsvTime,CSV_DATE_FORMAT);
    return Math.floor( end.diff(start,'minutes').toObject().minutes);
}

async function initDb() {
    db = await idb.openDB(dbName, dbVersion, {
        upgrade(db) {
            db.createObjectStore('meetings', { keyPath: 'meetingId' });
            db.createObjectStore('meetingInstances', { keyPath: ['meetingId', 'startDate'] });
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
            const store = await tx.objectStore(storeName);
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

async function deleteStore(storeName){
    return new Promise(async (resolve, reject) => {
        try {
            const tx = await db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            await store.clear();
            await tx.done;
            console.log( "cleared store: "+storeName);
            resolve();
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

async function clearDb(){
    return new Promise( async (resolve, reject) => {
        try{
            var stores = [ 'meetings','meetingInstances','students','attendance'];
            await async.eachSeries( stores, deleteStore, function(err){
                if( err ) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            });
        }catch( err ) {
            console.error(err);
        }
    });

}

