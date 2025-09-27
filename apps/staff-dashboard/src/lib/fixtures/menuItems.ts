import type { MenuItem } from '@/lib/types/supabase';

const menuItems: MenuItem[] = [
  {
    id: 'menu-001',
    name: 'Avocado Toast',
    description:
      'Sourdough toast topped with smashed avocado, poached eggs, and microgreens. Served with a side of roasted cherry tomatoes.',
    price: 18.5,
    category: 'Breakfast',
    available: true,
    preparationTime: 15,
    allergens: ['gluten', 'eggs'],
    dietaryInfo: 'vegetarian',
    image: 'https://images.unsplash.com/photo-1603046891744-76e6300f82ef',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'menu-002',
    name: 'Lobster Risotto',
    description:
      'Creamy Arborio rice with butter-poached lobster, finished with mascarpone cheese and fresh herbs.',
    price: 42,
    category: 'Dinner',
    available: true,
    preparationTime: 30,
    allergens: ['shellfish', 'dairy'],
    dietaryInfo: 'none',
    image: 'https://images.unsplash.com/photo-1633436375153-d7045cb61590',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 'menu-003',
    name: 'Signature Martini',
    description:
      'Premium vodka or gin with dry vermouth, served with your choice of olives or a lemon twist.',
    price: 24,
    category: 'Drinks',
    available: true,
    preparationTime: 5,
    allergens: [],
    dietaryInfo: 'vegan',
    image: 'https://images.unsplash.com/photo-1575023782549-62ca0d244b39',
    updated_at: '2024-03-05T17:45:00Z',
  },
];

export const getMenuItemsFixture = () => structuredClone(menuItems);
