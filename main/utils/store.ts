let _store: any;

export async function getStore() {
  if (!_store) {
    const StoreModule = await import("electron-store");
    const Store = StoreModule.default || StoreModule;
    _store = new Store();
  }
  return _store;
}
