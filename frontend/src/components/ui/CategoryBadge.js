import { Plane, ShoppingBag, UtensilsCrossed } from 'lucide-react';

const getCategoryIcon = (category) => {
  const normalized = String(category || '').toLowerCase();
  if (normalized.includes('food')) {
    return UtensilsCrossed;
  }
  if (normalized.includes('travel')) {
    return Plane;
  }
  if (normalized.includes('shopping')) {
    return ShoppingBag;
  }
  return ShoppingBag;
};

function CategoryBadge({ category }) {
  const Icon = getCategoryIcon(category);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
      <Icon size={13} />
      {category}
    </span>
  );
}

export default CategoryBadge;
