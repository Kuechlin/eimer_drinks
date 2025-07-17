// src/components/Summary.tsx
import React, { useMemo } from 'react'
import { Order, Person } from '../types'
import styles from './Summary.module.css' // Import the CSS module

interface SummaryProps {
  orders: Order[]
  people: Person[]
}

// Interfaces defined within the component or imported if used elsewhere
interface DrinkSummary {
  name: string
  size?: string
  price: number
  count: number
}

interface PersonSummary {
  id: string // Added ID for key prop
  name: string
  totalCost: number
  totalCount: number
  drinks: DrinkSummary[]
}

const Summary: React.FC<SummaryProps> = ({ orders, people }) => {
  const summaryData = useMemo(() => {
    const personSummaries: { [key: string]: PersonSummary } = {}
    people.forEach((person) => {
      personSummaries[person.id] = {
        id: person.id, // Store ID
        name: person.name,
        totalCost: 0,
        totalCount: 0,
        drinks: [],
      }
    })

    orders.forEach((order) => {
      if (personSummaries[order.personId]) {
        const personSummary = personSummaries[order.personId]
        personSummary.totalCost += order.price
        personSummary.totalCount += 1

        const drinkIdentifier = `${order.drinkName}-${order.drinkSize || 'N/A'}-${order.price}`
        const existingDrink = personSummary.drinks.find(
          (d) => `${d.name}-${d.size || 'N/A'}-${d.price}` === drinkIdentifier,
        )

        if (existingDrink) {
          existingDrink.count += 1
        } else {
          personSummary.drinks.push({
            name: order.drinkName,
            size: order.drinkSize,
            price: order.price,
            count: 1,
          })
        }
      }
    })

    // Berechnung des Grand Totals mit Filtern ungültiger Werte
    const grandTotal = orders
      .map((order) => (typeof order.price === 'number' && !isNaN(order.price) ? order.price : 0))
      .reduce((sum, price) => sum + price, 0)

    Object.values(personSummaries).forEach((summary) => {
      summary.drinks.sort((a, b) => a.name.localeCompare(b.name))
    })

    return { personSummaries: Object.values(personSummaries), grandTotal }
  }, [orders, people])

  return (
    // Apply styles using the styles object
    <div className={styles.summaryBox}>
      <h2>Summary</h2>
      {people.length === 0 && (
        <p className={styles.noDrinksMessage}>Add people to see the summary.</p>
      )}

      {summaryData.personSummaries.map((summary) => (
        <div key={summary.id} className={styles.personSummary}>
          <h3 className={styles.personHeader}>
            {summary.name}: {summary.totalCount} drink(s) -{' '}
            {typeof summary.totalCost === 'number' && !isNaN(summary.totalCost)
              ? summary.totalCost.toFixed(2)
              : '0.00'}{' '}
            €
          </h3>
          {summary.drinks.length > 0 ? (
            <ul className={styles.summaryDrinkList}>
              {summary.drinks.map((drink, index) => (
                <li key={index}>
                  {drink.count > 1 && <span>{drink.count}x </span>}
                  {drink.name}
                  {drink.size && ` (${drink.size})`}
                  <span>
                    {' '}
                    -{' '}
                    {typeof drink.price === 'number' && !isNaN(drink.price)
                      ? drink.price.toFixed(2)
                      : '0.00'}{' '}
                    € each
                  </span>
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
          <hr className={styles.divider} />
          <p className={styles.grandTotal}>
            <strong>
              Grand Total:{' '}
              {typeof summaryData.grandTotal === 'number' && !isNaN(summaryData.grandTotal)
                ? summaryData.grandTotal.toFixed(2)
                : '0.00'}{' '}
              €
            </strong>
          </p>
        </>
      )}
    </div>
  )
}

export default Summary
