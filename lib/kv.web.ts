// Version web (aperçus et captures d'écran) : localStorage.
const kv = {
  getItemSync: (k: string) => globalThis.localStorage?.getItem(k) ?? null,
  setItemSync: (k: string, v: string) => globalThis.localStorage?.setItem(k, v),
  removeItemSync: (k: string) => globalThis.localStorage?.removeItem(k),
  clearSync: () => globalThis.localStorage?.clear(),
};
export default kv;
