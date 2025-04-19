// src/App.tsx
import { useState, useEffect } from "react";
import drinksData from "./eimer_drinks.json";
import { Drink, Person, Order } from "./types";
import PersonManager from "./components/PersonManager";
import DrinkSelector from "./components/DrinkSelector";
import OrderLog from "./components/OrderLog";
import Summary from "./components/Summary";
import "./App.css";

// LocalStorage keys remain the same
const PEOPLE_STORAGE_KEY = "eimerTracker_people";
const ORDERS_STORAGE_KEY = "eimerTracker_orders";
const SELECTED_PERSON_STORAGE_KEY = "eimerTracker_selectedPersonId";

// Define possible tabs
type Tab = "add" | "log" | "summary";

function App() {
  // --- State Initialization with localStorage ---
  // (Keep the useState initializers for people, orders, selectedPersonId as before)
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
      // Use try-catch for parsing peopleList just in case
      try {
        const currentPeople = peopleList ? JSON.parse(peopleList) : [];
        if (
          savedSelectedId &&
          currentPeople.some((p: Person) => p.id === savedSelectedId)
        ) {
          return savedSelectedId;
        }
      } catch (error) {
        console.error(
          "Failed to parse people list while checking selected ID",
          error
        );
      }
      localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY); // Clear invalid selection
      return null;
    }
  );

  // --- New Tab State ---
  const [activeTab, setActiveTab] = useState<Tab>("add"); // Default to 'add' tab

  // --- useEffects for Saving State to localStorage ---
  // (Keep the useEffect hooks for people, orders, selectedPersonId as before)
  useEffect(() => {
    localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(people));
    if (selectedPersonId && !people.some((p) => p.id === selectedPersonId)) {
      setSelectedPersonId(null);
    }
  }, [people, selectedPersonId]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (selectedPersonId) {
      localStorage.setItem(SELECTED_PERSON_STORAGE_KEY, selectedPersonId);
    } else {
      localStorage.removeItem(SELECTED_PERSON_STORAGE_KEY);
    }
  }, [selectedPersonId]);

  // --- Management Functions ---
  // (Keep addPerson, selectPerson, addOrder, removeOrder, handleResetData as before)
  const addPerson = (name: string) => {
    if (name.trim() === "") return;
    if (
      people.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())
    ) {
      alert(`${name} is already on the list!`);
      return;
    }
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: name.trim(),
    };
    const updatedPeople = [...people, newPerson];
    setPeople(updatedPeople);
    if (!selectedPersonId) {
      setSelectedPersonId(newPerson.id);
    }
  };

  const selectPerson = (id: string) => {
    setSelectedPersonId(id);
  };

  const addOrder = (drink: Drink) => {
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

  const removeOrder = (orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order.id !== orderId)
    );
  };

  const handleResetData = () => {
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
      setActiveTab("add"); // Reset to add tab
    }
  };

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;

  return (
    <div className="app-container">
      <header>
        <h1>🍻 Eimer Drink Tracker 🍻</h1>
        {/* Reset button can stay here or move */}
        <button onClick={handleResetData} className="reset-button">
          Reset All Data
        </button>
      </header>

      {/* --- Tab Navigation --- */}
      <nav className="tab-nav">
        <button
          onClick={() => setActiveTab("add")}
          className={activeTab === "add" ? "active" : ""}
        >
          Add Drinks
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={activeTab === "log" ? "active" : ""}
        >
          Order Log ({orders.length}) {/* Show order count */}
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={activeTab === "summary" ? "active" : ""}
        >
          Summary
        </button>
      </nav>

      {/* --- Tab Content --- */}
      <main className="tab-content">
        {/* --- ADD Tab --- */}
        {activeTab === "add" && (
          <div className="tab-panel add-panel">
            {" "}
            {/* Use specific class */}
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

        {/* --- LOG Tab --- */}
        {activeTab === "log" && (
          <div className="tab-panel log-panel">
            {" "}
            {/* Use specific class */}
            <OrderLog
              orders={orders}
              people={people}
              onRemoveOrder={removeOrder}
            />
          </div>
        )}

        {/* --- SUMMARY Tab --- */}
        {activeTab === "summary" && (
          <div className="tab-panel summary-panel">
            {" "}
            {/* Use specific class */}
            <Summary orders={orders} people={people} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
