import React from 'react';

const Loader = ({ size = 'medium', text }) => {
  return (
    <div>
      <div>Loading...</div>
      {text && <p>{text}</p>}
    </div>
  );
};

export default Loader;
