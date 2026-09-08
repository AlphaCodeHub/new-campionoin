import { useCallback, useEffect, useState } from 'react';
import './gamePlus.css';
import './miniGames.css';
import './handsFree.css';
import ActionDock from '../components/ActionDock';
import CatchGame from '../components/CatchGame';
import FoodMenu from '../components/FoodMenu';
import GameModal from '../components/GameModal';
import StatusBar from '../components/StatusBar';
import TapGame from '../components/TapGame';
import '../components/customAvatar.css';
import { applyAction, hydrateGame, persistGame } from '../systems/GameEngine';
import { audioManager } from '../systems/AudioManager';
import { useVoice } from '../voice/useVoice';

export default function HomePage({ onCreate }) {
  const [game, setGame] = useState(hydrateGame);
  const [reaction, setReaction] = useState('Tap your companion to say hello!');
  const [panel, setPanel] = useState(null);
  const [gameMode, setGameMode] = useState(null);

  const companion = game.character || { name: 'Nova', avatar: null };
  const theme = game.customization.theme || 'peach';

  useEffect(() => {
    persistGame(game);
    audioManager.setEnabled(game.settings.sfx);
  }, [game]);

  const update = useCallback((action, payload) => {
    setGame(current => applyAction(current, action, payload));
  }, []);

  const handleVoiceSpeech = useCallback(({ userText, reply, emotion, sound }) => {
    setReaction(`${companion.name}: “${reply}”`);
    update('tap');
    if (sound && audioManager.enabled) {
      audioManager.playSFX(sound);
    }
  }, [companion.name, update]);

  const voice = useVoice({
    onSpeech: handleVoiceSpeech,
    companionName: companion.name,
    stats: game.stats,
    voiceEnabled: game.settings.voice
  });

  const react = () => {
    update('tap');
    audioManager.playSFX('happy');
    setReaction(`${companion.name} giggles and waves back!`);
  };

  const feed = food => {
    update('feed', food);
    audioManager.playSFX('eat');
    setReaction(`${companion.name} enjoyed the ${food.name.toLowerCase()}!`);
    setPanel(null);
  };

  const sleep = () => {
    update('sleep');
    audioManager.playSFX('sleep');
    setReaction(`${companion.name} feels rested.`);
  };

  const clean = () => {
    update('clean');
    audioManager.playSFX('tap');
    setReaction(`${companion.name} feels fresh and sparkly.`);
  };

  const finishGame = score => {
    const coins = Math.max(2, Math.floor(score / 2));
    update('reward', { coins, xp: score, happiness: 4 });
    audioManager.playSFX('coin');
    setReaction(`Great work! ${coins} coins and ${score} XP earned.`);
    setPanel(null);
  };

  function choose(action) {
    if (action === 'food') return setPanel('food');
    if (action === 'play') { setGameMode(null); return setPanel('play'); }
    if (action === 'customize') return setPanel('style');
    if (action === 'sleep') return sleep();
    if (action === 'talk') {
      if (!game.settings.voice) {
        setReaction('Voice is off in Settings.');
        return;
      }
      if (voice.enabled) {
        voice.stopHandsFree();
        setReaction('Hands-free chat paused.');
        return;
      }
      voice.enableHandsFree();
      setReaction(voice.supported ? 'Starting hands-free chat…' : 'Voice input is unavailable in this browser.');
    }
  }

  function toggle(setting) {
    setGame(current => ({
      ...current,
      settings: { ...current.settings, [setting]: !current.settings[setting] }
    }));
  }

  function setTheme(next) {
    setGame(current => ({
      ...current,
      customization: { ...current.customization, theme: next }
    }));
    setPanel(null);
  }

  return (
    <main className={`game-shell theme-${theme}`}>
      <StatusBar
        name={companion.name}
        coins={game.coins}
        level={game.level}
        onCreate={onCreate}
        onSettings={() => setPanel('settings')}
      />

      <div className="pet-status" aria-label="Pet status">
        {Object.entries(game.stats).map(([label, value]) => (
          <span key={label}>
            <i style={{ width: `${value}%` }} />
            {label} <b>{value}</b>
          </span>
        ))}
      </div>

      <section className="game-stage" aria-label={`${companion.name}'s room`}>
        <button className="room-item bed" onClick={sleep} aria-label="Bed: sleep">☾</button>
        <button className="room-item mirror" onClick={clean} aria-label="Mirror: clean">✦</button>
        <button className="room-item table" onClick={() => setPanel('food')} aria-label="Food table">⌂</button>

        <div className="window">
          <span className="cloud cloud-one" />
          <span className="cloud cloud-two" />
        </div>
        <div className="wall-art">✦</div>
        <div className="plant">🌿</div>
        <div className="rug" />

        <button className="pet-avatar" aria-label={`Tap ${companion.name}`} onClick={react}>
          {companion.avatar ? (
            <img className="custom-avatar" src={companion.avatar} alt={companion.name} />
          ) : (
            <>
              <span className="pet-ear left" />
              <span className="pet-ear right" />
              <span className="pet-face">
                <i /><i /><b>⌣</b>
              </span>
              <span className="pet-body" />
            </>
          )}
        </button>

        <div className="speech-bubble" role="status">
          {voice.speaking ? (reaction.startsWith(`${companion.name}:`) ? reaction : `${companion.name} is speaking…`) : reaction}
        </div>
      </section>

      {voice.enabled ? (
        <button className={`voice-indicator ${voice.listening ? 'active' : ''}`} onClick={voice.stopHandsFree}>
          ● {voice.speaking ? `${companion.name} is speaking…` : voice.listening ? 'Hands-free chat is listening' : 'Hands-free chat reconnecting'} · tap to pause
        </button>
      ) : (
        <button className="handsfree-setup" onClick={voice.enableHandsFree}>
          Enable hands-free chat <small>Microphone permission required once</small>
        </button>
      )}

      {voice.error && <div className="inline-error">{voice.error}</div>}

      <ActionDock onAction={choose} />

      {panel === 'food' && (
        <GameModal title="Snack bar" onClose={() => setPanel(null)}>
          <FoodMenu coins={game.coins} onFeed={feed} />
        </GameModal>
      )}

      {panel === 'play' && (
        <GameModal
          title={gameMode === 'catch' ? 'Star catch' : gameMode === 'tap' ? 'Spark tap' : 'Play time'}
          onClose={() => setPanel(null)}
        >
          {!gameMode ? (
            <div className="mini-game-picker">
              <button onClick={() => setGameMode('tap')}>
                ✦<strong>Spark tap</strong><small>Tap sparks quickly</small>
              </button>
              <button onClick={() => setGameMode('catch')}>
                ★<strong>Star catch</strong><small>Catch falling stars</small>
              </button>
            </div>
          ) : gameMode === 'tap' ? (
            <TapGame onFinish={finishGame} />
          ) : (
            <CatchGame onFinish={finishGame} />
          )}
        </GameModal>
      )}

      {panel === 'style' && (
        <GameModal title="Room style" onClose={() => setPanel(null)}>
          <p className="modal-copy">Choose a free room palette.</p>
          <div className="theme-options">
            {['peach', 'mint', 'violet'].map(color => (
              <button
                className={theme === color ? 'selected' : ''}
                key={color}
                onClick={() => setTheme(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </GameModal>
      )}

      {panel === 'settings' && (
        <GameModal title="Settings & privacy" onClose={() => setPanel(null)}>
          <p className="modal-copy">
            Photos and save data stay in this browser. Hands-free chat requests access only when you enable it, and it can be paused at any time.
          </p>
          {['music', 'sfx', 'voice'].map(setting => (
            <label className="setting-row" key={setting}>
              {setting}
              <input
                type="checkbox"
                checked={game.settings[setting]}
                onChange={() => toggle(setting)}
              />
            </label>
          ))}
          <button
            className="danger-button"
            onClick={() => {
              if (window.confirm('Delete this local character and all local game data?')) {
                localStorage.removeItem('lumapet-save');
                setGame(hydrateGame());
                setReaction('Your local save was deleted.');
                setPanel(null);
              }
            }}
          >
            Delete local character
          </button>
        </GameModal>
      )}
    </main>
  );
}
