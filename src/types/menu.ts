
export type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
};

export type MenuItemVariation = {
  id: number;
  name: string;
  price: number;
};

export type MenuItem = {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image: string;
  available?: boolean;
  allergens: string[];
  ingredients: Ingredient[];
  stockLevel?: number;
  variations?: MenuItemVariation[];
};
