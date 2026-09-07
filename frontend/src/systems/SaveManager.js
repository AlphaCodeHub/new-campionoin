const KEY = 'lumapet-save';
export const createGameState = () => ({ saveVersion: 1, character: null, stats: { hunger: 70, energy: 70, happiness: 70, cleanliness: 70 }, personality: 'friendly', inventory: [], customization: {}, coins: 25, xp: 0, level: 1, settings: { music: true, sfx: true, voice: true }, lastSaved: null });
export const saveGame = state => localStorage.setItem(KEY, JSON.stringify({ ...state, lastSaved: new Date().toISOString() }));
export const loadGame = () => { try { return JSON.parse(localStorage.getItem(KEY)) || createGameState(); } catch { return createGameState(); } };
