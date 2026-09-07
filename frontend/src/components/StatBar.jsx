export default function StatBar({ label, value }) { return <div className="stat"><span>{label}</span><div className="track"><i style={{ width: `${value}%` }} /></div><b>{value}</b></div>; }
