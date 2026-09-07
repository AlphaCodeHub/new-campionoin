import { useEffect, useState } from 'react';
export default function CatchGame({ onFinish }) {
  const [seconds, setSeconds] = useState(15), [score, setScore] = useState(0), [item, setItem] = useState({ x: 20, key: 0 });
  useEffect(() => { if (!seconds) { onFinish(score); return; } const timer = setTimeout(() => setSeconds(value => value - 1), 1000); return () => clearTimeout(timer); }, [seconds, score, onFinish]);
  useEffect(() => { const timer = setInterval(() => setItem(value => ({ x: 8 + Math.random() * 78, key: value.key + 1 })), 900); return () => clearInterval(timer); }, []);
  function catchItem() { setScore(value => value + 1); setItem(value => ({ x: 8 + Math.random() * 78, key: value.key + 1 })); }
  return <div><p className="game-help">Catch the falling stars before they reach the floor.</p><div className="catch-game"><button key={item.key} className="falling-star" style={{ left: `${item.x}%` }} onClick={catchItem}>★</button><div className="game-score">{score} catches · {seconds}s</div></div></div>;
}
