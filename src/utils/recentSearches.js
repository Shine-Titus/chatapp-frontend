import js from "@eslint/js";

const MAX = 4;

export const loadRecent = (key) => {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const save = (key, list) => {
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch { };
}

export const addRecent = (key, term) => {

    const t = term.trim();
    const current = loadRecent(key);
    if (t.length < 2) return current;

    const list = [t, ...current.filter((x) => x.toLowerCase() !== t.toLowerCase()),].slice(0, MAX);
    save(key, list);
    return list;
}

export const removeRecent = (key, term) => {

    const list = loadRecent(key).filter((x) => x !== term);
    save(key, list);
    return list;
}

export const clearRecent = (key) => {
    localStorage.setItem(key, []);
    return [];
}