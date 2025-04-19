export interface Drink {
  id: string; // <-- Add unique ID
  category: string;
  name: string;
  details?: string;
  size?: string;
  price: number;
  isCustom?: boolean; // <-- Flag for custom items
}

export interface Person {
  id: string;
  name: string;
}

export interface Order {
  id: string;
  personId: string;
  // Store drink details directly in the order
  drinkId: string; // Reference the drink ID
  drinkName: string;
  drinkSize?: string;
  price: number;
  timestamp: number;
}
