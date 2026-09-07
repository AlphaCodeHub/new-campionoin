import { createGameState, loadGame, saveGame } from './SaveManager';
const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
export function applyAction(state, action, payload = {}) {
  const next = structuredClone(state);
  const stats = next.stats;
  const rewards = { coins: 0, xp: 0 };
  if (action === 'feed') { stats.hunger = clamp(stats.hunger + payload.hunger); stats.happiness = clamp(stats.happiness + payload.happiness); next.coins = Math.max(0, next.coins - payload.cost); rewards.xp = 3; }
  if (action === 'sleep') { stats.energy = clamp(stats.energy + 40); stats.happiness = clamp(stats.happiness + 3); rewards.xp = 2; }
  if (action === 'play') { stats.happiness = clamp(stats.happiness + 20); stats.energy = clamp(stats.energy - 10); rewards.coins = 4; rewards.xp = 7; }
  if (action === 'clean') { stats.cleanliness = clamp(stats.cleanliness + 30); rewards.xp = 2; }
  if (action === 'tap') { stats.happiness = clamp(stats.happiness + 1); rewards.xp = 1; }
  if (action === 'reward') { rewards.coins = payload.coins || 0; rewards.xp = payload.xp || 0; stats.happiness = clamp(stats.happiness + (payload.happiness || 0)); }
  next.coins += rewards.coins; next.xp += rewards.xp;
  while (next.xp >= next.level * 40) { next.xp -= next.level * 40; next.level += 1; next.coins += 10; }
  return next;
}
export function hydrateGame() { const saved = loadGame(); const state = { ...createGameState(), ...saved, stats: { ...createGameState().stats, ...saved.stats }, settings: { ...createGameState().settings, ...saved.settings } }; if (!state.character && state.coins === 0) state.coins = 25; const elapsedHours = state.lastSaved ? Math.min(48, Math.max(0, (Date.now() - new Date(state.lastSaved).getTime()) / 3600000)) : 0; if (Number.isFinite(elapsedHours)) { state.stats.hunger = clamp(state.stats.hunger - elapsedHours * 2); state.stats.energy = clamp(state.stats.energy - elapsedHours * 1.2); state.stats.happiness = clamp(state.stats.happiness - elapsedHours * .7); state.stats.cleanliness = clamp(state.stats.cleanliness - elapsedHours * .5); } return state; }
export function persistGame(state) { saveGame(state); }
