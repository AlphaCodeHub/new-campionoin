import { foods } from '../data/foods';
const icons = { apple: '🍎', water: '💧' };
export default function FoodMenu({ coins, onFeed }) { return <div className="food-list">{foods.map(food => <button key={food.id} disabled={coins < food.cost} onClick={() => onFeed(food)}><span>{icons[food.id]}</span><strong>{food.name}</strong><small>+{food.hunger} hunger · +{food.happiness} happy</small><b>{food.cost} ◈</b></button>)}</div>; }
