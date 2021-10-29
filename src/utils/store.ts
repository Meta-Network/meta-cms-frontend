import store from 'store';

export function storeGet(key: string) {
  return store.get(key);
}

export function storeSet(key: string, val: string) {
  store.set(key, val);
}

export function storeRemove(key: string) {
  store.remove(key);
}

export function storeClearAll() {
  store.clearAll();
}

export function storeClear() {
  const whitelist = [''];
  store.each((value, key: string) => !whitelist.includes(key) && store.remove(key));
}
