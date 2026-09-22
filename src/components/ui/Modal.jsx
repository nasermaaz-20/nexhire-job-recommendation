import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div>
      <div>
        <h2>{title || 'Modal Placeholder'}</h2>
        <button onClick={onClose}>Close</button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
