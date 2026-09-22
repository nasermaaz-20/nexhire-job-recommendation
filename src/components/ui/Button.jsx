import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false }) => {
  return (
    <button type={type} onClick={onClick} disabled={disabled}>
      {children || 'Button Placeholder'}
    </button>
  );
};

export default Button;
