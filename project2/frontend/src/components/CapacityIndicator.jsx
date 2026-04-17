import React from 'react';

const CapacityIndicator = ({ available, total }) => {
  if (!total) return null;
  const pct = Math.round((available / total) * 100);
  let cls = 'capacity-high', label = 'Available', color = '#10B981';

  if (available === 0) { cls = 'capacity-full'; label = 'Sold Out'; color = '#6B7280'; }
  else if (pct <= 20) { cls = 'capacity-low'; label = 'Almost Full!'; color = '#EF4444'; }
  else if (pct <= 50) { cls = 'capacity-medium'; label = 'Filling Fast'; color = '#F59E0B'; }

  return (
    <div className={`capacity-bar-wrap ${cls}`}>
      <div className="flex-between" style={{ marginBottom: 4 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color }}>{label}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{available}/{total} seats</span>
      </div>
      <div className="capacity-bar-track">
        <div className="capacity-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default CapacityIndicator;
