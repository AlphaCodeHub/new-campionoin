import { useState } from 'react';
import HomePage from './pages/HomePage';
import CharacterCreationPage from './pages/CharacterCreationPage';

export default function App() {
  const [page, setPage] = useState('game');
  return page === 'create'
    ? <CharacterCreationPage onBack={() => setPage('game')} onComplete={() => setPage('game')} />
    : <HomePage onCreate={() => setPage('create')} />;
}
