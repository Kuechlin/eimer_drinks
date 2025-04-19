// src/components/OrderLog.tsx
import React from "react";
import { Order, Person } from "../types";

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
    <div className="component-box">
      <h2>Order Log</h2>
      {orders.length === 0 && <p>No drinks ordered yet.</p>}
      <ul className="order-list">
        {sortedOrders.map((order) => (
          <li key={order.id} className="order-item">
            <span>
              {getPersonName(order.personId)} ordered {order.drinkName}
              {order.drinkSize && ` (${order.drinkSize})`} -{" "}
              {order.price.toFixed(2)}€
            </span>
            <button
              onClick={() => onRemoveOrder(order.id)}
              className="remove-button"
              aria-label={`Remove ${order.drinkName} order`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderLog;
