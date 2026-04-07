import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const FoodOrderModal = ({ sessionId, onClose }) => {
    const { foodItems, updateSessionFood } = useAppContext();
    const [cart, setCart] = useState({});

    const handleAdd = (id) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));

    const total = foodItems.reduce((acc, item) => acc + (cart[item.id] || 0) * item.price, 0);

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="modal-header">
                    <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.2rem' }}>Quick Food Order</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="food-grid">
                        {foodItems.map(item => (
                            <div key={item.id} className="food-card" onClick={() => handleAdd(item.id)}>
                                <div style={{ fontSize: '2rem' }}>{item.emoji}</div>
                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                <div style={{ color: 'var(--neon3)', fontWeight: 700 }}>₹{item.price}</div>

                                {cart[item.id] > 0 && (
                                    <div className="food-qty-badge">{cart[item.id]}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="cart-total">Total: <span>₹{total}</span></div>
                    <button className="btn-primary" disabled={total === 0} onClick={() => {
                        if (sessionId) {
                            const itemsOrdered = Object.entries(cart)
                                .filter(([, qty]) => qty > 0)
                                .map(([id, qty]) => {
                                    const item = foodItems.find(i => i.id === parseInt(id));
                                    return {
                                        ...item,
                                        quantity: qty,
                                        totalPrice: qty * item.price
                                    };
                                });
                            updateSessionFood(sessionId, total, itemsOrdered);
                        }
                        alert('Order Placed Successfully!');
                        onClose();
                    }}>Confirm Order</button>
                </div>
            </div>
        </div>
    );
};

export default FoodOrderModal;
