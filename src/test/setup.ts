const entries = new Map<string, string>();

const storage: Storage = {
	clear: () => entries.clear(),
	getItem: (key) => entries.get(key) ?? null,
	key: (index) => [...entries.keys()][index] ?? null,
	removeItem: (key) => entries.delete(key),
	setItem: (key, value) => entries.set(key, String(value)),
	get length() {
		return entries.size;
	},
};

Object.defineProperty(window, "localStorage", {
	configurable: true,
	value: storage,
});

Object.defineProperty(globalThis, "localStorage", {
	configurable: true,
	value: storage,
});
