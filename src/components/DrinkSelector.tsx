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
  // --- State for feedback ---
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [feedbackTimeoutId, setFeedbackTimeoutId] =
    useState<NodeJS.Timeout | null>(null);

  // Group drinks by category
  const categories = useMemo(() => {
    const cats = new Set(drinks.map((d) => d.category));
    return ["All", ...Array.from(cats)];
  }, [drinks]);

  // Filter drinks based on category and search term
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
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }, [drinks, selectedCategory, searchTerm]);

  // --- Handler for adding drink with feedback ---
  const handleAddClick = (drink: Drink) => {
    onAddOrder(drink);

    // Clear any existing timeout
    if (feedbackTimeoutId) {
      clearTimeout(feedbackTimeoutId);
    }

    // Set feedback state
    const drinkId = `${drink.name}-${drink.size || "N/A"}`; // Unique identifier for this drink type
    setJustAddedId(drinkId);

    // Set timeout to clear feedback
    const newTimeoutId = setTimeout(() => {
      setJustAddedId(null);
      setFeedbackTimeoutId(null);
    }, 1000); // Feedback lasts 1 second
    setFeedbackTimeoutId(newTimeoutId);
  };

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
        {filteredDrinks.map((drink, index) => {
          const drinkId = `${drink.name}-${drink.size || "N/A"}`;
          const isJustAdded = justAddedId === drinkId;
          return (
            <li
              key={drinkId + "-" + index} // Add index for absolute uniqueness if needed
              className={`drink-item ${isJustAdded ? "added-feedback" : ""}`}
            >
              <div className="drink-info">
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
                {/* Simple feedback text shown inline (optional) */}
                {/* {isJustAdded && <span className="feedback-inline-text"> Added!</span>} */}
              </div>
              {/* Updated button */}
              <button
                onClick={() => handleAddClick(drink)}
                className="add-drink-button" // New class for styling
                aria-label={`Add ${drink.name} to order`}
                disabled={isJustAdded} // Optionally disable briefly after adding
              >
                {isJustAdded ? "✓" : "+"} {/* Show checkmark during feedback */}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DrinkSelector;
