import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MOCK_INVENTORY = [
    { id: 1, name: 'Energy Drink XL', price: 3.50, stock: 24, category: 'Drinks' },
    { id: 2, name: 'Soda Can', price: 1.50, stock: 48, category: 'Drinks' },
    { id: 3, name: 'Potato Chips', price: 2.00, stock: 15, category: 'Snacks' },
    { id: 4, name: 'Candy Bar', price: 1.50, stock: 30, category: 'Snacks' },
];

const Inventory = () => {
    const [items] = useState(MOCK_INVENTORY);

    return (
        <div className="p-4" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Inventory Management</h2>
                <Button variant="primary">+ Add New Item</Button>
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Category</th>
                            <th style={{ padding: '12px' }}>Price</th>
                            <th style={{ padding: '12px' }}>Stock Level</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '12px', fontWeight: '500' }}>{item.name}</td>
                                <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.category}</td>
                                <td style={{ padding: '12px' }}>${item.price.toFixed(2)}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        color: item.stock < 20 ? 'var(--accent-amber)' : 'var(--accent-green)',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.stock}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default Inventory;
