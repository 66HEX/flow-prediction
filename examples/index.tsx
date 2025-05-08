import React from 'react';
import { createRoot } from 'react-dom/client';
import MouseTrackerExample from './MouseTrackerExample';

const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<MouseTrackerExample />);
} 