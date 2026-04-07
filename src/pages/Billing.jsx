import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './Billing.css';

const MOCK_INVENTORY = [
    { id: 1, name: 'Energy Drink XL', price: 3.50, stock: 24, category: 'drinks' },
    { id: 2, name: 'Soda Can', price: 1.50, stock: 48, category: 'drinks' },
    { id: 3, name: 'Potato Chips', price: 2.00, stock: 15, category: 'snacks' },
    { id: 4, name: 'Candy Bar', price: 1.50, stock: 30, category: 'snacks' },
    { id: 5, name: '1 Hour Pass', price: 5.00, stock: 999, category: 'time' },
    { id: 6, name: '3 Hour Pass', price: 12.00, stock: 999, category: 'time' },
];

const Billing = () => {
    const [cart, setCart] = useState([]);

    const addToCart = (item) => {
        const existing = cart.find(c => c.id === item.id);
        if (existing) {
            setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { ...item, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(c => c.id !== id));
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    return (
        <div className="billing-container">
            <div className="pos-layout">

                {/* Products Area */}
                <div className="products-area">
                    <div className="layer-header">
                        <h3>Quick Items</h3>
                        <div className="divider"></div>
                    </div>
                    <div className="inventory-grid">
                        {MOCK_INVENTORY.map(item => (
                            <Card key={item.id} className="inventory-item" onClick={() => addToCart(item)}>
                                <div className="item-price text-neon-cyan">${item.price.toFixed(2)}</div>
                                <div className="item-name">{item.name}</div>
                                <div className="item-stock text-muted">{item.category === 'time' ? 'Unlimited' : `${item.stock} in stock`}</div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Cart/Checkout Area */}
                <div className="cart-area glass-panel">
                    <h3 className="cart-title">Current Order</h3>

                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <div className="empty-cart text-muted">Cart is empty</div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-info">
                                        <span className="cart-item-name">{item.name}</span>
                                        <span className="cart-item-qty">x{item.qty}</span>
                                    </div>
                                    <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
                                    <button className="remove-item text-muted" onClick={() => removeFromCart(item.id)}>✕</button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (8%)</span>
                            <span>${(total * 0.08).toFixed(2)}</span>
                        </div>
                        <div className="summary-row total text-neon-cyan">
                            <span>Total</span>
                            <span>${(total * 1.08).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="cart-actions">
                        <Button variant="secondary" className="w-full">Add to User Tab</Button>
                        <Button variant="primary" className="w-full mt-12" disabled={cart.length === 0}>Checkout Pay</Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Billing;
