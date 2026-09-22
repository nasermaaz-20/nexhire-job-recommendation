import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, name, label }) => {
  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder || 'Input Placeholder'}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
