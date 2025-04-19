// src/App.tsx
import { useState, useEffect } from "react";
import drinksData from "./eimer_drinks.json";
import { Drink, Person, Order } from "./types";
import PersonManager from "./components/PersonManager";
import DrinkSelector from "./components/DrinkSelector";
import OrderLog from "./components/OrderLog";
import Summary from "./components/Summary";
import styles from "./App.module.css"; // App styles

// LocalStorage keys
const PEOPLE_STORAGE_KEY = "eimerTracker_people";
const ORDERS_STORAGE_KEY = "eimerTracker_orders";
const SELECTED_PERSON_STORAGE_KEY = "eimerTracker_selectedPersonId";
const THEME_STORAGE_KEY = "eimerTracker_theme"; // <-- New Key

type Tab = "add" | "log" | "summary";
type Theme = "light" | "dark"; // <-- New Type

function App() {
  // --- State (People, Orders, Selection - keep existing initializers) ---
  const [people, setPeople] = useState<Person[]>(() => {
    /* ... load people ... */
    const savedPeople = localStorage.getItem(PEOPLE_STORAGE_KEY);
    try {
      return savedPeople ? JSON.parse(savedPeople) : [];
    } catch (error) {
      console.error("Failed to parse people from localStorage", error);
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    /* ... load orders ... */
    const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    try {
      return savedOrders ? JSON.parse(savedOrders) : [];
    } catch (error) {
      console.error("Failed to parse orders from localStorage", error);
      return [];
    }
  });
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(
    () => {
      /* ... load selected person ... */
      const savedSelectedId = localStorage.getItem(SELECTED_PERSON_STORAGE_KEY);
      const peopleList = localStorage.getItem(PEOPLE_STORAGE_KEY);
      try {
        const currentPeople = peopleList ? JSON.parse(peopleList) : [];
        if (
          savedSelectedId &&
          currentPeople.some((p: Person) => p.id === savedSelectedId)
        )
          return savedSelectedId;
      } catch (error) {
        console.error(
          "Failed to parse people list while checking selected ID",
          error
        );
      }
      localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY);
      return null;
    }
  );
  const [activeTab, setActiveTab] = useState<Tab>("add");

  // --- Theme State ---
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    // Add check for system preference maybe later, for now default to light
    return savedTheme || "light";
  });

  // --- useEffects for Saving State ---
  // (Keep useEffects for people, orders, selectedPersonId)
  useEffect(() => {
    localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people));
    if (selectedPersonId && !people.some((p) => p.id === selectedPersonId))
      setSelectedPersonId(null);
  }, [people, selectedPersonId]);
  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    if (selectedPersonId)
      localStorage.setItem(SELECTED_PERSON_STORAGE_KEY, selectedPersonId);
    else localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY);
  }, [selectedPersonId]);

  // --- useEffect for Theme ---
  useEffect(() => {
    // Apply theme attribute to body
    document.body.setAttribute("data-theme", theme);
    // Save theme to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]); // Run whenever theme changes

  // --- Management Functions (remain the same) ---
  const addPerson = (name: string) => {
    /* ... */ if (name.trim() === "") return;
    if (
      people.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())
    ) {
      alert(`${name} is already on the list!`);
      return;
    }
    const newPerson: Person = { id: crypto.randomUUID(), name: name.trim() };
    const updatedPeople = [...people, newPerson];
    setPeople(updatedPeople);
    if (!selectedPersonId) setSelectedPersonId(newPerson.id);
  };
  const selectPerson = (id: string) => setSelectedPersonId(id);
  const addOrder = (drink: Drink) => {
    /* ... */ if (!selectedPersonId) {
      alert("Please select a person first!");
      return;
    }
    const newOrder: Order = {
      id: crypto.randomUUID(),
      personId: selectedPersonId,
      drinkName: drink.name,
      drinkSize: drink.size,
      price: drink.price,
      timestamp: Date.now(),
    };
    setOrders((prevOrders) => [...prevOrders, newOrder]);
  };
  const removeOrder = (orderId: string) =>
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  const handleResetData = () => {
    /* ... */ if (
      window.confirm(
        "Are you sure you want to clear all friends and orders? This cannot be undone."
      )
    ) {
      setPeople([]);
      setOrders([]);
      setSelectedPersonId(null);
      localStorage.removeItem(PEOPLE_STORAGE_KEY);
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY);
      setActiveTab("add");
    }
  };

  // --- Theme Toggle Function ---
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={styles.themeToggleButton}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"} {/* Simple emoji toggle */}
        </button>

        <h1 className={styles.title}>🍻 Eimer Drink Tracker 🍻</h1>
        <p className={styles.subtitle}>
          Your friendly pub tab tracker for{" "}
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
        <button onClick={handleResetData} className={styles.resetButton}>
          Reset All Data
        </button>
      </header>

      {/* Tab Navigation (remains the same structure, styling handled by CSS variables) */}
      <nav className={styles.tabNav}>
        <button
          onClick={() => setActiveTab("add")}
          className={`${styles.tabButton} ${
            activeTab === "add" ? styles.active : ""
          }`}
        >
          {" "}
          Add Drinks{" "}
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`${styles.tabButton} ${
            activeTab === "log" ? styles.active : ""
          }`}
        >
          {" "}
          Order Log ({orders.length}){" "}
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`${styles.tabButton} ${
            activeTab === "summary" ? styles.active : ""
          }`}
        >
          {" "}
          Summary{" "}
        </button>
      </nav>

      {/* Tab Content (remains the same structure, styling handled by CSS variables) */}
      <main className={styles.tabContent}>
        {activeTab === "add" && (
          <div className={`${styles.tabPanel} ${styles.addPanel}`}>
            {" "}
            <PersonManager
              people={people}
              selectedPersonId={selectedPersonId}
              onAddPerson={addPerson}
              onSelectPerson={selectPerson}
            />{" "}
            {selectedPerson && (
              <DrinkSelector
                drinks={drinksData as Drink[]}
                selectedPersonName={selectedPerson.name}
                onAddOrder={addOrder}
              />
            )}{" "}
            {!selectedPerson && people.length > 0 && (
              <p>Select a person to add drinks.</p>
            )}{" "}
            {!selectedPerson && people.length === 0 && (
              <p>Add some people to start tracking!</p>
            )}{" "}
          </div>
        )}
        {activeTab === "log" && (
          <div className={styles.tabPanel}>
            {" "}
            <OrderLog
              orders={orders}
              people={people}
              onRemoveOrder={removeOrder}
            />{" "}
          </div>
        )}
        {activeTab === "summary" && (
          <div className={styles.tabPanel}>
            {" "}
            <Summary orders={orders} people={people} />{" "}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
