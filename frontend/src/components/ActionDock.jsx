const actions = [['talk', '◌', 'Talk'], ['food', '◒', 'Feed'], ['play', '✦', 'Play'], ['sleep', '☾', 'Sleep'], ['customize', '✧', 'Style']];
export default function ActionDock({ onAction }) { return <nav className="action-dock" aria-label="Character actions">{actions.map(([id, icon, label]) => <button key={id} onClick={() => onAction(id)}><span>{icon}</span>{label}</button>)}</nav>; }
