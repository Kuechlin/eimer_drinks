// src/components/PersonManager.tsx
import React, { useState } from 'react'
import { Person } from '../types'
import styles from './PersonManager.module.css' // Import the CSS Module

interface PersonManagerProps {
  people: Person[]
  selectedPersonId: string | null
  onAddPerson: (name: string) => void
  onSelectPerson: (id: string) => void
}

const PersonManager: React.FC<PersonManagerProps> = ({
  people,
  selectedPersonId,
  onAddPerson,
  onSelectPerson,
}) => {
  const [newName, setNewName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddPerson(newName)
    setNewName('')
  }

  return (
    // Use styles object for class names
    <div className={styles.componentBox}>
      <h2>Friends List</h2>
      <form onSubmit={handleSubmit} className={styles.addPersonForm}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add new friend..."
          aria-label="Add new friend"
        />
        <button type="submit">Add</button>
      </form>
      <ul className={styles.personList}>
        {people.length === 0 && <li className={styles.personListItem}>No friends added yet.</li>}
        {people.map((person) => (
          <li
            key={person.id}
            // Combine classes conditionally
            className={`${styles.personListItem} ${
              person.id === selectedPersonId ? styles.selected : ''
            }`}
            onClick={() => onSelectPerson(person.id)}
          >
            {person.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PersonManager
