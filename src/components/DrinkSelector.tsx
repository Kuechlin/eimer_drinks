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
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [feedbackTimeoutId, setFeedbackTimeoutId] = useState<number | null>(
    null
  );

  const categories = useMemo(() => {
    const cats = new Set(drinks.map((d) => d.category));
    return ["All", ...Array.from(cats).sort()]; // Sort categories alphabetically
  }, [drinks]);

  const filteredDrinks = useMemo(() => {
    return drinks
      .filter(
        (drink) =>
          (selectedCategory === "All" || drink.category === selectedCategory) &&
          (drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            drink.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (drink.details &&
              drink.details.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [drinks, selectedCategory, searchTerm]);

  const handleAddClick = (drink: Drink) => {
    onAddOrder(drink);
    if (feedbackTimeoutId) clearTimeout(feedbackTimeoutId);
    const drinkId = `${drink.name}-${drink.size || "N/A"}`;
    setJustAddedId(drinkId);
    const newTimeoutId = setTimeout(() => {
      setJustAddedId(null);
      setFeedbackTimeoutId(null);
    }, 1000);
    setFeedbackTimeoutId(newTimeoutId);
  };

  return (
    <div className="component-box">
      <h2>Add Drink for {selectedPersonName}</h2>

      {/* Updated Filters Section */}
      <div className="filters">
        {/* Category Filter */}
        <div className="filter-item category-filter">
          <label htmlFor="category-select">Category:</label>
          <select
            id="category-select" // Added ID for label
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
        </div>

        {/* Search Filter with Clear Button */}
        <div className="filter-item search-filter">
          <label htmlFor="search-input">Search:</label>
          <div className="search-input-wrapper">
            {" "}
            {/* Wrapper for input + button */}
            <input
              id="search-input" // Added ID for label
              type="text"
              placeholder="Search drinks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search drinks"
            />
            {/* Conditionally render clear button */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="clear-search-button"
                aria-label="Clear search"
              >
                &times; {/* Multiplication sign for 'X' */}
              </button>
            )}
          </div>
        </div>
      </div>

      <ul className="drink-list">
        {filteredDrinks.length === 0 && <li>No drinks match your filter.</li>}
        {filteredDrinks.map((drink, index) => {
          const drinkId = `${drink.name}-${drink.size || "N/A"}`;
          const isJustAdded = justAddedId === drinkId;
          return (
            <li
              key={drinkId + "-" + index}
              className={`drink-item ${isJustAdded ? "added-feedback" : ""}`}
            >
              <div className="drink-info">
                {/* ... drink info spans ... */}
                <span className="drink-name">{drink.name}</span>
                {drink.size && (
                  <span className="drink-size"> ({drink.size})</span>
                )}
                <span className="drink-price">
                  {" "}
                  - {drink.price.toFixed(2)}€
                </span>
                {drink.details && (
                  <span className="drink-details"> [{drink.details}]</span>
                )}
              </div>
              <button
                onClick={() => handleAddClick(drink)}
                className="add-drink-button"
                aria-label={`Add ${drink.name} to order`}
                disabled={isJustAdded}
              >
                {isJustAdded ? "✓" : "+"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DrinkSelector;
