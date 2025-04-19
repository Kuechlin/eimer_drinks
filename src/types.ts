export interface Drink {
  category: string;
  name: string;
  details?: string; // Optional details like ingredients or descriptions
  size?: string; // Optional size
  price: number;
}

export interface Person {
  id: string; // Unique identifier for each person
  name: string;
}

export interface Order {
  id: string; // Unique identifier for the order item
  personId: string; // Which person ordered this
  drinkName: string;
  drinkSize?: string;
  price: number;
  timestamp: number; // When it was ordered (for potential sorting)
}
