import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Typewriter = ({ text, speed = 30, onDone }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onDone]);

  return <ReactMarkdown>{displayed}</ReactMarkdown>;
};

export default Typewriter; 