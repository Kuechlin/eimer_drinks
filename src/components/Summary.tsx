// src/components/Summary.tsx
import React, { useMemo } from "react";
import { Order, Person } from "../types";
import styles from "./Summary.module.css"; // Import the CSS module

interface SummaryProps {
  orders: Order[];
  people: Person[];
}

// Interfaces defined within the component or imported if used elsewhere
interface DrinkSummary {
  name: string;
  size?: string;
  price: number;
  count: number;
}

interface PersonSummary {
  id: string; // Added ID for key prop
  name: string;
  totalCost: number;
  totalCount: number;
  drinks: DrinkSummary[];
}

const Summary: React.FC<SummaryProps> = ({ orders, people }) => {
  const summaryData = useMemo(() => {
    const personSummaries: { [key: string]: PersonSummary } = {};
    people.forEach((person) => {
      personSummaries[person.id] = {
        id: person.id, // Store ID
        name: person.name,
        totalCost: 0,
        totalCount: 0,
        drinks: [],
      };
    });

    orders.forEach((order) => {
      if (personSummaries[order.personId]) {
        const personSummary = personSummaries[order.personId];
        personSummary.totalCost += order.price;
        personSummary.totalCount += 1;

        const drinkIdentifier = `${order.drinkName}-${
          order.drinkSize || "N/A"
        }-${order.price}`;
        const existingDrink = personSummary.drinks.find(
          (d) => `${d.name}-${d.size || "N/A"}-${d.price}` === drinkIdentifier
        );

        if (existingDrink) {
          existingDrink.count += 1;
        } else {
          personSummary.drinks.push({
            name: order.drinkName,
            size: order.drinkSize,
            price: order.price,
            count: 1,
          });
        }
      }
    });

    const grandTotal = orders.reduce((sum, order) => sum + order.price, 0);

    Object.values(personSummaries).forEach((summary) => {
      summary.drinks.sort((a, b) => a.name.localeCompare(b.name));
    });

    return { personSummaries: Object.values(personSummaries), grandTotal };
  }, [orders, people]);

  return (
    // Apply styles using the styles object
    <div className={styles.summaryBox}>
      <h2>Summary</h2>
      {people.length === 0 && (
        <p className={styles.noDrinksMessage}>Add people to see the summary.</p>
      )}

      {summaryData.personSummaries.map((summary) => (
        // Use person's unique ID for the key
        <div key={summary.id} className={styles.personSummary}>
          <h3 className={styles.personHeader}>
            {" "}
            {/* Added style class */}
            {summary.name}: {summary.totalCount} drink(s) -{" "}
            {summary.totalCost.toFixed(2)}€
          </h3>
          {summary.drinks.length > 0 ? (
            <ul className={styles.summaryDrinkList}>
              {summary.drinks.map((drink, index) => (
                <li key={index}>
                  {/* Wrap count in span for styling */}
                  {drink.count > 1 && <span>{drink.count}x </span>}
                  {drink.name}
                  {drink.size && ` (${drink.size})`}
                  {/* Wrap price in span for styling */}
                  <span> - {drink.price.toFixed(2)}€ each</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noDrinksMessage}>No drinks ordered yet.</p>
          )}
        </div>
      ))}

      {people.length > 0 && (
        <>
          {/* Apply style class to hr */}
          <hr className={styles.divider} />
          {/* Apply style class to paragraph */}
          <p className={styles.grandTotal}>
            <strong>Grand Total: {summaryData.grandTotal.toFixed(2)}€</strong>
          </p>
        </>
      )}
    </div>
  );
};

export default Summary;
