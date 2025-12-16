// Minimal IndexedDB helper for key/value storage
export function openDB(dbName = 'news-app', storeName = 'kv') {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName)
    }
    req.onsuccess = () => resolve({ db: req.result, storeName })
    req.onerror = () => reject(req.error)
  })
}

export async function idbGet(key) {
  const { db, storeName } = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const store = tx.objectStore(storeName)
    const r = store.get(key)
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}

export async function idbSet(key, value) {
  const { db, storeName } = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    const r = store.put(value, key)
    r.onsuccess = () => resolve(true)
    r.onerror = () => reject(r.error)
  })
}
