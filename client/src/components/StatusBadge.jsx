// src/components/StatusBadge.jsx
// Renders a color-coded badge for complaint status

import React from 'react';

/**
 * Maps each status string to its corresponding CSS class.
 * These classes are defined in index.css.
 */
const statusConfig = {
  'Pending':     { cls: 'badge-pending',     emoji: '⏳' },
  'In Progress': { cls: 'badge-in-progress', emoji: '🔧' },
  'Resolved':    { cls: 'badge-resolved',    emoji: '✅' },
  'Rejected':    { cls: 'badge-rejected',    emoji: '❌' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { cls: 'bg-secondary', emoji: '❓' };

  return (
    <span className={`status-badge badge ${config.cls}`}>
      {config.emoji} {status}
    </span>
  );
};

export default StatusBadge;
