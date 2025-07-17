// src/components/MenuManager.tsx
import React, { useState, useMemo } from 'react'
import { Drink } from '../types'
import styles from './MenuManager.module.css' // We'll create this CSS Module

interface MenuManagerProps {
  allDrinks: Drink[]
  onAddCustomDrink: (drinkData: { name: string; price: string; size?: string }) => void
  onRemoveCustomDrink: (drinkId: string) => void
}

const MenuManager: React.FC<MenuManagerProps> = ({
  allDrinks,
  onAddCustomDrink,
  onRemoveCustomDrink,
}) => {
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemSize, setNewItemSize] = useState('')

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddCustomDrink({
      name: newItemName,
      price: newItemPrice,
      size: newItemSize,
    })
    // Reset form
    setNewItemName('')
    setNewItemPrice('')
    setNewItemSize('')
  }

  // Group drinks by category for display
  const drinksByCategory = useMemo(() => {
    const grouped: { [category: string]: Drink[] } = {}
    allDrinks.forEach((drink) => {
      if (!grouped[drink.category]) {
        grouped[drink.category] = []
      }
      grouped[drink.category].push(drink)
      // Sort within category
      grouped[drink.category].sort((a, b) => a.name.localeCompare(b.name))
    })
    // Sort categories, maybe put "Custom Items" last
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      if (a === 'Custom Items') return -1
      if (b === 'Custom Items') return 1
      return a.localeCompare(b)
    })
    return { grouped, sortedCategories }
  }, [allDrinks])

  return (
    <div className={styles.menuManagerContainer}>
      {/* --- Add Custom Item Form --- */}
      <div className={styles.customFormBox}>
        <h2>Add Custom Item</h2>
        <form onSubmit={handleAddSubmit} className={styles.customItemForm}>
          <div className={styles.formGroup}>
            <label htmlFor="custom-name">Name:</label>
            <input
              id="custom-name"
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g., Special Shot X"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="custom-price">Price (€):</label>
            <input
              id="custom-price"
              type="number"
              value={newItemPrice}
              onChange={(e) => setNewItemPrice(e.target.value)}
              placeholder="e.g., 2.50"
              required
              step="0.01" // Allow cents
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="custom-size">Size (Optional):</label>
            <input
              id="custom-size"
              type="text"
              value={newItemSize}
              onChange={(e) => setNewItemSize(e.target.value)}
              placeholder="e.g., 2cl or 0,3l"
            />
          </div>
          <button type="submit" className={styles.addButton}>
            Add Item
          </button>
        </form>
      </div>

      {/* --- Full Menu Display --- */}
      <div className={styles.fullMenuBox}>
        <h2>Full Menu</h2>
        {drinksByCategory.sortedCategories.map((category) => (
          <div key={category} className={styles.categorySection}>
            <h3>{category}</h3>
            <ul className={styles.menuList}>
              {drinksByCategory.grouped[category].map((drink) => (
                <li key={drink.id} className={styles.menuItem}>
                  <span>
                    {drink.name}
                    {drink.size && ` (${drink.size})`}
                    <span className={styles.price}>
                      {' '}
                      -{' '}
                      {typeof drink.price === 'number' && !isNaN(drink.price)
                        ? drink.price.toFixed(2)
                        : '0.00'}
                      €
                    </span>
                  </span>
                  {/* Only show delete button for custom items */}
                  {drink.isCustom && (
                    <button
                      onClick={() => onRemoveCustomDrink(drink.id)}
                      className={styles.deleteButton}
                      aria-label={`Delete custom item ${drink.name}`}
                      title={`Delete custom item ${drink.name}`}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {drinksByCategory.sortedCategories.length === 0 && <p>Menu is empty.</p>}
      </div>
    </div>
  )
}

export default MenuManager
