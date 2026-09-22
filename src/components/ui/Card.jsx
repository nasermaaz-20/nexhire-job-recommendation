import React from 'react';

const Card = ({ children, title }) => {
  return (
    <div>
      {title && <h3>{title}</h3>}
      {children || <p>Card Placeholder</p>}
    </div>
  );
};

export default Card;
