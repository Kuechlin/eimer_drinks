// src/App.tsx
import { useState, useEffect } from "react";
import drinksData from "./eimer_drinks.json";
import { Drink, Person, Order } from "./types";
import PersonManager from "./components/PersonManager";
import DrinkSelector from "./components/DrinkSelector";
import OrderLog from "./components/OrderLog";
import Summary from "./components/Summary";
import styles from "./App.module.css"; // Import the App CSS Module
// Keep global styles import in main.tsx

// LocalStorage keys remain the same
const PEOPLE_STORAGE_KEY = "eimerTracker_people";
const ORDERS_STORAGE_KEY = "eimerTracker_orders";
const SELECTED_PERSON_STORAGE_KEY = "eimerTracker_selectedPersonId";

type Tab = "add" | "log" | "summary";

function App() {
  // --- State Initializers (remain the same) ---
  const [people, setPeople] = useState<Person[]>(() => {
    const savedPeople = localStorage.getItem(PEOPLE_STORAGE_KEY);
    try {
      return savedPeople ? JSON.parse(savedPeople) : [];
    } catch (error) {
      console.error("Failed to parse people from localStorage", error);
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>(() => {
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

  // --- useEffects for Saving State (remain the same) ---
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

  // --- Management Functions (remain the same) ---
  const addPerson = (name: string) => {
    /* ... */
    if (name.trim() === "") return;
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
    /* ... */
    if (!selectedPersonId) {
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
    /* ... */
    if (
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

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;

  return (
    // Apply styles from App.module.css
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>🍻 Eimer Drink Tracker 🍻</h1>
        {/* Link to actual pub site */}
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

      <nav className={styles.tabNav}>
        <button
          onClick={() => setActiveTab("add")}
          // Combine base button class with active class conditionally
          className={`${styles.tabButton} ${
            activeTab === "add" ? styles.active : ""
          }`}
        >
          Add Drinks
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`${styles.tabButton} ${
            activeTab === "log" ? styles.active : ""
          }`}
        >
          Order Log ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`${styles.tabButton} ${
            activeTab === "summary" ? styles.active : ""
          }`}
        >
          Summary
        </button>
      </nav>

      <main className={styles.tabContent}>
        {activeTab === "add" && (
          // Added specific panel class from module for desktop layout targeting
          <div className={`${styles.tabPanel} ${styles.addPanel}`}>
            <PersonManager
              people={people}
              selectedPersonId={selectedPersonId}
              onAddPerson={addPerson}
              onSelectPerson={selectPerson}
            />
            {selectedPerson && (
              <DrinkSelector
                drinks={drinksData as Drink[]}
                selectedPersonName={selectedPerson.name}
                onAddOrder={addOrder}
              />
            )}
            {!selectedPerson && people.length > 0 && (
              <p>Select a person to add drinks.</p>
            )}
            {!selectedPerson && people.length === 0 && (
              <p>Add some people to start tracking!</p>
            )}
          </div>
        )}

        {activeTab === "log" && (
          <div className={styles.tabPanel}>
            {" "}
            {/* Basic panel class */}
            <OrderLog
              orders={orders}
              people={people}
              onRemoveOrder={removeOrder}
            />
          </div>
        )}

        {activeTab === "summary" && (
          <div className={styles.tabPanel}>
            {" "}
            {/* Basic panel class */}
            <Summary orders={orders} people={people} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
