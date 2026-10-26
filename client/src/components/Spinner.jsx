// src/components/Spinner.jsx
// Reusable loading spinner component

import React from 'react';

const Spinner = ({ message = 'Loading...' }) => (
  <div className="full-page-loader">
    <div
      className="spinner-border"
      role="status"
      style={{ color: 'var(--primary)', width: '3rem', height: '3rem' }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="text-muted mt-2">{message}</p>
  </div>
);

export default Spinner;
