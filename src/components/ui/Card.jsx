import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`glass-panel p-4 ${className}`} {...props} style={{ padding: '20px' }}>
            {children}
        </div>
    );
};

export default Card;
