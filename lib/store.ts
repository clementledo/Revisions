import Storage from '@/lib/kv';
import { useCallback, useSyncExternalStore } from 'react';

// Petit magasin clé → JSON, synchrone (SQLite), avec abonnements pour rafraîchir les écrans.
const cache = new Map<string, unknown>();
const listeners = new Set<() => void>();

export function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = Storage.getItemSync(key);
    if (raw != null) value = JSON.parse(raw) as T;
  } catch {}
  cache.set(key, value);
  return value;
}

export function write<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    Storage.setItemSync(key, JSON.stringify(value));
  } catch {}
  listeners.forEach((l) => l());
}

export function update<T>(key: string, fallback: T, fn: (v: T) => T) {
  write(key, fn(read(key, fallback)));
}

/** Valeur stockée qui redessine le composant quand elle change. */
export function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const subscribe = useCallback((l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  const value = useSyncExternalStore(subscribe, () => read(key, fallback));
  const set = useCallback((v: T) => write(key, v), [key]);
  return [value, set];
}

/** Se redessine à chaque écriture (pour les écrans qui agrègent beaucoup de clés). */
export function useStoreVersion() {
  const subscribe = useCallback((l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return useSyncExternalStore(subscribe, () => cache.size + ':' + version);
}
let version = 0;
listeners.add(() => version++);

export function clearAll() {
  try {
    Storage.clearSync();
  } catch {}
  cache.clear();
  listeners.forEach((l) => l());
}
