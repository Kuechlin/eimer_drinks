// src/components/DrinkSelector.tsx
import React, { useState, useMemo } from "react";
import { Drink } from "../types";

interface DrinkSelectorProps {
  drinks: Drink[];
  selectedPersonName: string;
  onAddOrder: (drink: Drink) => void;
}

const DrinkSelector: React.FC<DrinkSelectorProps> = ({
  drinks,
  selectedPersonName,
  onAddOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Group drinks by category
  const categories = useMemo(() => {
    const cats = new Set(drinks.map((d) => d.category));
    return ["All", ...Array.from(cats)];
  }, [drinks]);

  // Filter drinks based on category and search term
  const filteredDrinks = useMemo(() => {
    return drinks.filter(
      (drink) =>
        (selectedCategory === "All" || drink.category === selectedCategory) &&
        (drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          drink.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (drink.details &&
            drink.details.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [drinks, selectedCategory, searchTerm]);

  return (
    <div className="component-box">
      <h2>Add Drink for {selectedPersonName}</h2>

      <div className="filters">
        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Search Filter */}
        <input
          type="text"
          placeholder="Search drinks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search drinks"
        />
      </div>

      <ul className="drink-list">
        {filteredDrinks.length === 0 && <li>No drinks match your filter.</li>}
        {filteredDrinks.map((drink, index) => (
          <li
            key={`<span class="math-inline">\{drink\.name\}\-</span>{drink.size || index}`}
            className="drink-item"
          >
            <div className="drink-info">
              <span className="drink-name">{drink.name}</span>
              {drink.size && (
                <span className="drink-size"> ({drink.size})</span>
              )}
              <span className="drink-price"> - {drink.price.toFixed(2)}€</span>
              {drink.details && (
                <span className="drink-details"> [{drink.details}]</span>
              )}
            </div>
            <button
              onClick={() => onAddOrder(drink)}
              aria-label={`Add ${drink.name} to order`}
            >
              +
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DrinkSelector;
