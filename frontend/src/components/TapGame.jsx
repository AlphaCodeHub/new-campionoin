import { useEffect, useState } from 'react';
export default function TapGame({ onFinish }) {
  const [seconds, setSeconds] = useState(15); const [score, setScore] = useState(0); const [spot, setSpot] = useState({ x: 50, y: 50 });
  useEffect(() => { if (!seconds) { onFinish(score); return; } const timer = setTimeout(() => setSeconds(value => value - 1), 1000); return () => clearTimeout(timer); }, [seconds, score, onFinish]);
  function tap() { setScore(value => value + 1); setSpot({ x: 12 + Math.random() * 76, y: 14 + Math.random() * 68 }); }
  return <div><p className="game-help">Tap the spark as many times as you can.</p><div className="tap-game"><button className="spark" style={{ left: `${spot.x}%`, top: `${spot.y}%` }} onClick={tap}>✦</button><div className="game-score">{score} points · {seconds}s</div></div></div>;
}
