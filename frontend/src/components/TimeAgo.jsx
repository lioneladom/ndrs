import React, { useState, useEffect } from 'react';
import { formatTimeAgo } from '../utils/timeAgo.js';

export { formatTimeAgo };

/**
 * React hook that returns an auto-updating relative time string.
 * Automatically updates on interval without manual page refresh.
 *
 * @param {string|number|Date} timestamp
 * @param {number} [refreshInterval=30000] - interval in ms (default 30 seconds)
 * @returns {string}
 */
export function useTimeAgo(timestamp, refreshInterval = 30000) {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(timestamp));

  useEffect(() => {
    setTimeAgo(formatTimeAgo(timestamp));
    if (!timestamp) return;

    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(timestamp));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [timestamp, refreshInterval]);

  return timeAgo;
}

/**
 * React component that renders an auto-updating relative time string.
 *
 * @param {Object} props
 * @param {string|number|Date} props.date
 * @param {string} [props.className]
 * @param {React.CSSProperties} [props.style]
 * @param {number} [props.refreshInterval=30000]
 */
export function TimeAgo({ date, className, style, refreshInterval = 30000 }) {
  const timeAgo = useTimeAgo(date, refreshInterval);
  const dateObj = date ? new Date(date) : null;
  const title = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleString() : '';

  return (
    <span className={className} style={style} title={title}>
      {timeAgo}
    </span>
  );
}

export default TimeAgo;
