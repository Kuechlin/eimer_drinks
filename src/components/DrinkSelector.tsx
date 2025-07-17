// src/components/DrinkSelector.tsx
import React, { useState, useMemo } from "react";
import { Drink } from "../types";
import styles from "./DrinkSelector.module.css"; // Import the CSS Module

interface DrinkSelectorProps {
  // Expecting the combined list (standard + custom) from App.tsx
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
  // State for feedback
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [feedbackTimeoutId, setFeedbackTimeoutId] = useState<number | null>(
    null,
  );

  // Group drinks by category - This will now include "Custom Items" automatically
  const categories = useMemo(() => {
    const cats = new Set(drinks.map((d) => d.category));
    // Sort categories, ensure "Custom Items" is handled appropriately (e.g., last)
    return [
      "All",
      ...Array.from(cats).sort((a, b) => {
        if (a === "Custom Items") return 1; // Put Custom Items last
        if (b === "Custom Items") return -1;
        return a.localeCompare(b); // Sort others alphabetically
      }),
    ];
  }, [drinks]); // Re-run when drinks prop changes

  // Filter drinks based on category and search term
  const filteredDrinks = useMemo(() => {
    return drinks
      .filter(
        (drink) =>
          (selectedCategory === "All" || drink.category === selectedCategory) &&
          (drink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (drink.details &&
              drink.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
            // Include category in search as well
            drink.category.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort results alphabetically
  }, [drinks, selectedCategory, searchTerm]);

  // Handler for adding drink with feedback
  const handleAddClick = (drink: Drink) => {
    onAddOrder(drink);

    // Clear any existing timeout to prevent premature clearing if clicked quickly
    if (feedbackTimeoutId) {
      clearTimeout(feedbackTimeoutId);
    }

    // Set feedback state using the unique drink ID
    const drinkId = drink.id;
    setJustAddedId(drinkId);

    // Set timeout to clear feedback
    const newTimeoutId = setTimeout(() => {
      setJustAddedId(null);
      setFeedbackTimeoutId(null);
    }, 1000); // Feedback lasts 1 second
    setFeedbackTimeoutId(newTimeoutId);
  };

  return (
    // Use styles object for class names
    <div className={styles.componentBox}>
      <h2>Add Drink for {selectedPersonName}</h2>

      {/* Filters Section */}
      <div className={styles.filters}>
        {/* Category Filter */}
        <div className={`${styles.filterItem} ${styles.categoryFilter}`}>
          <label htmlFor="category-select">Category:</label>
          <select
            id="category-select"
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

        {/* Search Filter */}
        <div className={`${styles.filterItem} ${styles.searchFilter}`}>
          <label htmlFor="search-input">Search:</label>
          <div className={styles.searchInputWrapper}>
            <input
              id="search-input"
              type="text"
              placeholder="Search name, details, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search drinks"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className={styles.clearSearchButton}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drink List */}
      <ul className={styles.drinkList}>
        {filteredDrinks.length === 0 && <li>No drinks match your filter.</li>}
        {filteredDrinks.map((drink) => {
          const isJustAdded = justAddedId === drink.id; // Compare using unique ID
          return (
            <li
              key={drink.id} // Use unique drink ID as key
              // Combine base class with conditional feedback class
              className={`${styles.drinkItem} ${
                isJustAdded ? styles.addedFeedback : ""
              }`}
            >
              {/* Drink Info Display */}
              <div className={styles.drinkInfo}>
                <span className={styles.drinkName}>{drink.name}</span>
                {drink.size && (
                  <span className={styles.drinkSize}> ({drink.size})</span>
                )}
                <span className={styles.drinkPrice}>
                  {" "}
                  -{" "}
                  {typeof drink.price === "number"
                    ? drink.price.toFixed(2)
                    : "0.00"}
                  €
                </span>
                {/* Display category if it's custom */}
                {drink.isCustom && (
                  <span className={styles.drinkDetails}> [Custom Item]</span>
                )}
                {/* Display regular details if they exist and it's not custom */}
                {drink.details && !drink.isCustom && (
                  <span className={styles.drinkDetails}>
                    {" "}
                    [{drink.details}]
                  </span>
                )}
              </div>
              {/* Add Button */}
              <button
                onClick={() => handleAddClick(drink)}
                className={styles.addDrinkButton}
                aria-label={`Add ${drink.name} to order`}
                disabled={isJustAdded} // Disable briefly after adding
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
