import React from 'react';

export const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-fade-in-down transition-opacity">
    {message}
  </div>
);