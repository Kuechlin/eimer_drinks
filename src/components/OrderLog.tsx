// src/components/OrderLog.tsx
import React from "react";
import { Order, Person } from "../types";
import styles from "./OrderLog.module.css"; // Import the CSS module

interface OrderLogProps {
  orders: Order[];
  people: Person[];
  onRemoveOrder: (orderId: string) => void;
}

const OrderLog: React.FC<OrderLogProps> = ({
  orders,
  people,
  onRemoveOrder,
}) => {
  const getPersonName = (personId: string): string => {
    const person = people.find((p) => p.id === personId);
    return person ? person.name : "Unknown";
  };

  // Show recent orders first
  const sortedOrders = [...orders].sort((a, b) => b.timestamp - a.timestamp);

  return (
    // Use styles object for class names
    <div className={styles.componentBox}>
      <h2>Order Log</h2>
      {orders.length === 0 && (
        // Apply specific style to the empty message
        <p className={styles.emptyMessage}>No drinks ordered yet.</p>
      )}
      {orders.length > 0 && ( // Only render the list if there are orders
        <ul className={styles.orderList}>
          {sortedOrders.map((order) => (
            <li key={order.id} className={styles.orderItem}>
              <span>
                <strong>{getPersonName(order.personId)}</strong> ordered{" "}
                {order.drinkName}
                {order.drinkSize && ` (${order.drinkSize})`}
                <span> - {order.price.toFixed(2)}€</span>
              </span>
              <button
                onClick={() => onRemoveOrder(order.id)}
                className={styles.removeButton} // Use style from module
                aria-label={`Remove ${order.drinkName} order`}
              >
                &times; {/* Keep using multiplication sign for 'X' */}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderLog;
