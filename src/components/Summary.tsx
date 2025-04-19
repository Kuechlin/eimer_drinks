// src/components/Summary.tsx
import React, { useMemo } from "react";
import { Order, Person } from "../types";

interface SummaryProps {
  orders: Order[];
  people: Person[];
}

interface DrinkSummary {
  name: string;
  size?: string;
  price: number;
  count: number;
}

interface PersonSummary {
  name: string;
  totalCost: number;
  totalCount: number;
  drinks: DrinkSummary[];
}

const Summary: React.FC<SummaryProps> = ({ orders, people }) => {
  const summaryData = useMemo(() => {
    // Initialize summary structure for each person
    const personSummaries: { [key: string]: PersonSummary } = {};
    people.forEach((person) => {
      personSummaries[person.id] = {
        name: person.name,
        totalCost: 0,
        totalCount: 0,
        drinks: [], // Will store aggregated drinks
      };
    });

    // Process each order
    orders.forEach((order) => {
      if (personSummaries[order.personId]) {
        const personSummary = personSummaries[order.personId];
        personSummary.totalCost += order.price;
        personSummary.totalCount += 1;

        // Aggregate drinks for this person
        const drinkIdentifier = `${order.drinkName}-${
          order.drinkSize || "N/A"
        }-${order.price}`; // Unique key for drink type
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

    // Sort drinks within each person's summary alphabetically by name
    Object.values(personSummaries).forEach((summary) => {
      summary.drinks.sort((a, b) => a.name.localeCompare(b.name));
    });

    return { personSummaries: Object.values(personSummaries), grandTotal };
  }, [orders, people]);

  return (
    <div className="component-box summary-box">
      {" "}
      {/* Added specific class */}
      <h2>Summary</h2>
      {people.length === 0 && <p>Add people to see the summary.</p>}
      {/* Iterate through each person's summary */}
      {summaryData.personSummaries.map((summary) => (
        <div key={summary.name} className="person-summary">
          <h3>
            {summary.name}: {summary.totalCount} drink(s) -{" "}
            {summary.totalCost.toFixed(2)}€
          </h3>
          {summary.drinks.length > 0 ? (
            <ul className="summary-drink-list">
              {summary.drinks.map((drink, index) => (
                <li key={index}>
                  {drink.count > 1 && <span>{drink.count}x </span>}
                  {drink.name}
                  {drink.size && ` (${drink.size})`}
                  <span> - {drink.price.toFixed(2)}€ each</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-drinks-message">No drinks ordered yet.</p>
          )}
        </div>
      ))}
      {people.length > 0 && (
        <>
          <hr />
          <p>
            <strong>Grand Total: {summaryData.grandTotal.toFixed(2)}€</strong>
          </p>
        </>
      )}
    </div>
  );
};

export default Summary;
