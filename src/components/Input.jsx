import React from 'react';

export const Input = ({ className, ...props }) => {
    return (
        <input
            className={`flex-1 p-2 border border-gray-300 rounded ${className}`}
            {...props}
        />
    );
};
