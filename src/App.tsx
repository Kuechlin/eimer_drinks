// src/App.tsx
import { useState, useEffect, useMemo } from 'react'
import initialDrinksData from './eimer_drinks.json' // Renamed import
import { Drink, Person, Order } from './types'
import PersonManager from './components/PersonManager'
import DrinkSelector from './components/DrinkSelector'
import OrderLog from './components/OrderLog'
import Summary from './components/Summary'
import MenuManager from './components/MenuManager' // Import new component
import styles from './App.module.css' // Import the App CSS Module
// Global styles (index.css) should be imported in main.tsx

// LocalStorage keys
const PEOPLE_STORAGE_KEY = 'eimerTracker_people'
const ORDERS_STORAGE_KEY = 'eimerTracker_orders'
const SELECTED_PERSON_STORAGE_KEY = 'eimerTracker_selectedPersonId'
const THEME_STORAGE_KEY = 'eimerTracker_theme'
const CUSTOM_DRINKS_STORAGE_KEY = 'eimerTracker_customDrinks'

type Tab = 'add' | 'log' | 'summary' | 'menu' // Added 'menu' tab
type Theme = 'light' | 'dark'

// Function to ensure drinks from JSON have IDs (run once on initial load)
const processInitialDrinks = (drinks: Omit<Drink, 'id' | 'isCustom'>[]): Drink[] => {
  return drinks.map((drink) => ({
    ...drink,
    id: crypto.randomUUID(), // Assign initial ID
    isCustom: false, // Mark as not custom
  }))
}

function App() {
  // --- State ---
  const [people, setPeople] = useState<Person[]>(() => {
    const savedPeople = localStorage.getItem(PEOPLE_STORAGE_KEY)
    try {
      return savedPeople ? JSON.parse(savedPeople) : []
    } catch (error) {
      console.error('Failed to parse people from localStorage', error)
      return []
    }
  })

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY)
    try {
      return savedOrders ? JSON.parse(savedOrders) : []
    } catch (error) {
      console.error('Failed to parse orders from localStorage', error)
      return []
    }
  })

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(() => {
    const savedSelectedId = localStorage.getItem(SELECTED_PERSON_STORAGE_KEY)
    const peopleList = localStorage.getItem(PEOPLE_STORAGE_KEY)
    try {
      const currentPeople = peopleList ? JSON.parse(peopleList) : []
      if (savedSelectedId && currentPeople.some((p: Person) => p.id === savedSelectedId))
        return savedSelectedId
    } catch (error) {
      console.error('Failed to parse people list while checking selected ID', error)
    }
    localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY)
    return null
  })

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    return savedTheme || 'light' // Default to light theme
  })

  const [activeTab, setActiveTab] = useState<Tab>('add')

  // --- Drinks State ---
  // Load initial standard drinks and assign IDs (runs only once)
  const [standardDrinks] = useState<Drink[]>(() =>
    processInitialDrinks(initialDrinksData as Omit<Drink, 'id' | 'isCustom'>[]),
  )

  // Custom Drinks State with localStorage
  const [customDrinks, setCustomDrinks] = useState<Drink[]>(() => {
    const savedCustomDrinks = localStorage.getItem(CUSTOM_DRINKS_STORAGE_KEY)
    try {
      const parsedDrinks = savedCustomDrinks ? JSON.parse(savedCustomDrinks) : []
      // Ensure loaded drinks have IDs and isCustom flag
      return parsedDrinks.map((d: Drink) => ({
        ...d,
        id: d.id || crypto.randomUUID(),
        isCustom: d.isCustom === undefined ? true : d.isCustom, // Assume older saved drinks are custom
      }))
    } catch (error) {
      console.error('Failed to parse custom drinks from localStorage', error)
      return []
    }
  })

  // Combine standard and custom drinks using useMemo
  const allDrinks = useMemo(() => {
    // Ensure standard drinks also have isCustom flag explicitly set
    const processedStandard = standardDrinks.map((d) => ({
      ...d,
      isCustom: false,
    }))
    return [...processedStandard, ...customDrinks]
  }, [standardDrinks, customDrinks])

  // --- useEffects for Saving State ---
  useEffect(() => {
    localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people))
    // Deselect person if they are removed from the list while selected
    if (selectedPersonId && !people.some((p) => p.id === selectedPersonId)) {
      setSelectedPersonId(null)
    }
  }, [people, selectedPersonId])

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    if (selectedPersonId) localStorage.setItem(SELECTED_PERSON_STORAGE_KEY, selectedPersonId)
    else localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY)
  }, [selectedPersonId])

  // Theme Effect
  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  // Save Custom Drinks Effect
  useEffect(() => {
    localStorage.setItem(CUSTOM_DRINKS_STORAGE_KEY, JSON.stringify(customDrinks))
  }, [customDrinks])

  // --- Management Functions ---
  const addPerson = (name: string) => {
    if (name.trim() === '') return
    if (people.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())) {
      alert(`${name} is already on the list!`)
      return
    }
    const newPerson: Person = { id: crypto.randomUUID(), name: name.trim() }
    const updatedPeople = [...people, newPerson]
    setPeople(updatedPeople)
    // Select new person only if none is currently selected
    if (!selectedPersonId) {
      setSelectedPersonId(newPerson.id)
    }
  }

  const selectPerson = (id: string) => {
    setSelectedPersonId(id)
  }

  const addOrder = (drink: Drink) => {
    if (!selectedPersonId) {
      alert('Please select a person first!')
      return
    }
    const newOrder: Order = {
      id: crypto.randomUUID(),
      personId: selectedPersonId,
      drinkId: drink.id, // Store drink ID
      drinkName: drink.name,
      drinkSize: drink.size,
      price: drink.price,
      timestamp: Date.now(),
    }
    setOrders((prevOrders) => [...prevOrders, newOrder])
  }

  const removeOrder = (orderId: string) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId))
  }

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all friends, orders, AND custom menu items? This cannot be undone.',
      )
    ) {
      setPeople([])
      setOrders([])
      setCustomDrinks([]) // Clear custom drinks state
      setSelectedPersonId(null)
      // Clear localStorage
      localStorage.removeItem(PEOPLE_STORAGE_KEY)
      localStorage.removeItem(ORDERS_STORAGE_KEY)
      localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY)
      localStorage.removeItem(CUSTOM_DRINKS_STORAGE_KEY) // Clear custom drinks storage
      setActiveTab('add') // Reset to add tab
    }
  }

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  // --- Custom Drink Handlers ---
  const addCustomDrink = (drinkData: { name: string; price: string; size?: string }) => {
    const name = drinkData.name.trim()
    const price = parseFloat(drinkData.price)
    const size = drinkData.size?.trim() || undefined

    if (!name || isNaN(price) || price < 0) {
      alert('Please provide a valid name and a non-negative price.')
      return
    }
    // Prevent adding duplicates (check both standard and custom)
    if (allDrinks.some((d) => d.name.toLowerCase() === name.toLowerCase() && d.size === size)) {
      alert(`"${name}"${size ? ` (${size})` : ''} already exists in the menu.`)
      return
    }

    const newCustomDrink: Drink = {
      id: crypto.randomUUID(),
      category: 'Custom Items',
      name: name,
      price: price,
      size: size,
      isCustom: true,
    }
    setCustomDrinks((prev) => [...prev, newCustomDrink])
  }

  const removeCustomDrink = (drinkId: string) => {
    // Add confirmation before deleting
    const drinkToRemove = customDrinks.find((d) => d.id === drinkId)
    if (!drinkToRemove) return

    if (
      window.confirm(`Are you sure you want to delete the custom item "${drinkToRemove.name}"?`)
    ) {
      setCustomDrinks((prev) => prev.filter((drink) => drink.id !== drinkId))
      // Optional: Also remove associated orders? Maybe not, keep history.
    }
  }

  // Find the currently selected person object
  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null

  return (
    // Apply styles from App.module.css
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <button
          onClick={toggleTheme}
          className={styles.themeToggleButton}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <h1 className={styles.title}>🍻 Eimer Drink Tracker 🍻</h1>
        <p className={styles.subtitle}>
          Your friendly pub tab tracker for{' '}
          <a
            href="https://eimer-freiburg.de/drinks/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.headerLink}
          >
            Eimer Freiburg
          </a>
          !
        </p>
        <button
          onClick={handleResetData}
          className={styles.resetButton}
          aria-label="Reset All Data"
          title="Reset All Data"
        >
          {'×'}
        </button>
      </header>

      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        <button
          onClick={() => setActiveTab('add')}
          className={`${styles.tabButton} ${activeTab === 'add' ? styles.active : ''}`}
        >
          {' '}
          Add Drinks{' '}
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`${styles.tabButton} ${activeTab === 'log' ? styles.active : ''}`}
        >
          {' '}
          Order Log ({orders.length}){' '}
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`${styles.tabButton} ${activeTab === 'summary' ? styles.active : ''}`}
        >
          {' '}
          Summary{' '}
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`${styles.tabButton} ${activeTab === 'menu' ? styles.active : ''}`}
        >
          {' '}
          Menu{' '}
        </button>
      </nav>

      {/* Tab Content */}
      <main className={styles.tabContent}>
        {activeTab === 'add' && (
          <div className={`${styles.tabPanel} ${styles.addPanel}`}>
            <PersonManager
              people={people}
              selectedPersonId={selectedPersonId}
              onAddPerson={addPerson}
              onSelectPerson={selectPerson}
            />
            {selectedPerson && (
              <DrinkSelector
                drinks={allDrinks} // Pass combined list
                selectedPersonName={selectedPerson.name}
                onAddOrder={addOrder}
              />
            )}
            {!selectedPerson && people.length > 0 && <p>Select a person to add drinks.</p>}
            {!selectedPerson && people.length === 0 && <p>Add some people to start tracking!</p>}
          </div>
        )}

        {activeTab === 'log' && (
          <div className={styles.tabPanel}>
            <OrderLog orders={orders} people={people} onRemoveOrder={removeOrder} />
          </div>
        )}

        {activeTab === 'summary' && (
          <div className={styles.tabPanel}>
            <Summary orders={orders} people={people} />
          </div>
        )}

        {activeTab === 'menu' && (
          <div className={styles.tabPanel}>
            <MenuManager
              allDrinks={allDrinks}
              onAddCustomDrink={addCustomDrink}
              onRemoveCustomDrink={removeCustomDrink}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
