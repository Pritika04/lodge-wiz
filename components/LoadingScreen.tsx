'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
	'Summoning the wizard…',
	'Consulting the crystal ball…',
	'Matching your vibe…',
	'Almost there…',
];

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-root">
      <div className="wizard-bounce">🧙</div>
      <p className="loading-msg">{MESSAGES[msgIndex]}</p>
      <div className="dots">
        {[0, 1, 2].map((i) => (
          <span key={i} className="dot" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
    </div>
  );
}
