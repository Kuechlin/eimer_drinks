// src/components/PersonManager.tsx
import React, { useState } from "react";
import { Person } from "../types";

interface PersonManagerProps {
  people: Person[];
  selectedPersonId: string | null;
  onAddPerson: (name: string) => void;
  onSelectPerson: (id: string) => void;
}

const PersonManager: React.FC<PersonManagerProps> = ({
  people,
  selectedPersonId,
  onAddPerson,
  onSelectPerson,
}) => {
  const [newName, setNewName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPerson(newName);
    setNewName(""); // Clear input after adding
  };

  return (
    <div className="component-box">
      <h2>Friends List</h2>
      <form onSubmit={handleSubmit} className="add-person-form">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add new friend..."
          aria-label="Add new friend"
        />
        <button type="submit">Add</button>
      </form>
      <ul className="person-list">
        {people.length === 0 && <li>No friends added yet.</li>}
        {people.map((person) => (
          <li
            key={person.id}
            className={person.id === selectedPersonId ? "selected" : ""}
            onClick={() => onSelectPerson(person.id)}
          >
            {person.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PersonManager;
