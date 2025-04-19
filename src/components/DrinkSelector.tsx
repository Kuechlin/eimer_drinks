// src/components/DrinkSelector.tsx
import React, { useState, useMemo } from "react";
import { Drink } from "../types";
import styles from "./DrinkSelector.module.css"; // Import the CSS Module

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
    return ["All", ...Array.from(cats).sort()];
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
    // Use styles object for class names
    <div className={styles.componentBox}>
      <h2>Add Drink for {selectedPersonName}</h2>

      <div className={styles.filters}>
        <div className={`${styles.filterItem} ${styles.categoryFilter}`}>
          {" "}
          {/* Combine classes */}
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

        <div className={`${styles.filterItem} ${styles.searchFilter}`}>
          <label htmlFor="search-input">Search:</label>
          <div className={styles.searchInputWrapper}>
            <input
              id="search-input"
              type="text"
              placeholder="Search drinks..."
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

      <ul className={styles.drinkList}>
        {filteredDrinks.length === 0 && <li>No drinks match your filter.</li>}
        {filteredDrinks.map((drink, index) => {
          const drinkId = `${drink.name}-${drink.size || "N/A"}`;
          const isJustAdded = justAddedId === drinkId;
          return (
            <li
              key={drinkId + "-" + index}
              // Combine base class with conditional feedback class
              className={`${styles.drinkItem} ${
                isJustAdded ? styles.addedFeedback : ""
              }`}
            >
              <div className={styles.drinkInfo}>
                <span className={styles.drinkName}>{drink.name}</span>
                {drink.size && (
                  <span className={styles.drinkSize}> ({drink.size})</span>
                )}
                <span className={styles.drinkPrice}>
                  {" "}
                  - {drink.price.toFixed(2)}€
                </span>
                {drink.details && (
                  <span className={styles.drinkDetails}>
                    {" "}
                    [{drink.details}]
                  </span>
                )}
              </div>
              <button
                onClick={() => handleAddClick(drink)}
                className={styles.addDrinkButton}
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
