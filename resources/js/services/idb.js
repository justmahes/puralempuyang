// Lightweight IndexedDB helpers (no external deps)
const DB_NAME = 'pl_offline';
const DB_VER = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('snapshotTickets')) {
        db.createObjectStore('snapshotTickets', { keyPath: 'ticket_code' });
      }
      if (!db.objectStoreNames.contains('pendingValidations')) {
        db.createObjectStore('pendingValidations', { keyPath: 'ticket_code' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(store, mode, cb) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const res = cb(s);
    t.oncomplete = () => resolve(res);
    t.onerror = () => reject(t.error);
  });
}

export async function saveSnapshot(tickets, meta = {}) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(['snapshotTickets', 'meta'], 'readwrite');
    const s = t.objectStore('snapshotTickets');
    const m = t.objectStore('meta');
    s.clear();
    tickets.forEach((it) => s.put(it));
    m.put(meta.generated_at || new Date().toISOString(), 'snapshot_generated_at');
    t.oncomplete = () => resolve(true);
    t.onerror = () => reject(t.error);
  });
}

export async function getSnapshot() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(['snapshotTickets', 'meta'], 'readonly');
    const s = t.objectStore('snapshotTickets');
    const m = t.objectStore('meta');
    const items = [];
    s.openCursor().onsuccess = (e) => {
      const cur = e.target.result;
      if (cur) { items.push(cur.value); cur.continue(); } else {
        m.get('snapshot_generated_at').onsuccess = (ev) => {
          resolve({ items, generated_at: ev.target.result });
        };
      }
    };
    t.onerror = () => reject(t.error);
  });
}

export async function getSnapshotTicket(ticket_code) {
  const db = await openDb();
  return new Promise((resolve) => {
    const t = db.transaction('snapshotTickets', 'readonly');
    const s = t.objectStore('snapshotTickets');
    s.get(ticket_code).onsuccess = (e) => resolve(e.target.result || null);
    t.onerror = () => resolve(null);
  });
}

export async function queueValidation(ticket_code, validated_at_client = new Date().toISOString()) {
  return tx('pendingValidations', 'readwrite', (s) => s.put({ ticket_code, validated_at_client }));
}

export async function getQueuedValidations() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction('pendingValidations', 'readonly');
    const s = t.objectStore('pendingValidations');
    const arr = [];
    s.openCursor().onsuccess = (e) => {
      const cur = e.target.result;
      if (cur) { arr.push(cur.value); cur.continue(); } else { resolve(arr); }
    };
    t.onerror = () => reject(t.error);
  });
}

export async function clearQueuedValidations() {
  return tx('pendingValidations', 'readwrite', (s) => s.clear());
}

export async function markLocalUsed(ticket_code) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction('snapshotTickets', 'readwrite');
    const s = t.objectStore('snapshotTickets');
    const req = s.get(ticket_code);
    req.onsuccess = () => {
      const v = req.result || { ticket_code };
      v.status = 'used_local';
      s.put(v);
    };
    t.oncomplete = () => resolve(true);
    t.onerror = () => reject(t.error);
  });
}

export async function isLocallyUsed(ticket_code) {
  const db = await openDb();
  return new Promise((resolve) => {
    const t = db.transaction('snapshotTickets', 'readonly');
    const s = t.objectStore('snapshotTickets');
    s.get(ticket_code).onsuccess = (e) => {
      const v = e.target.result;
      resolve(v?.status === 'used_local' || v?.status === 'used');
    };
  });
}

