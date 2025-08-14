import React, { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  onComplete?: () => void;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 100,
  delay = 0,
  color = '#00ff88',
  fontSize = 'sm',
  fontWeight = 'bold',
  onComplete
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting && currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else if (!isDeleting && currentIndex === text.length && !isCompleted) {
        setIsCompleted(true);
        if (onComplete) onComplete();
        // Start deleting after 3 seconds
        setTimeout(() => {
          setIsDeleting(true);
        }, 3000);
      } else if (isDeleting && currentIndex > 0) {
        setDisplayText(prev => prev.slice(0, -1));
        setCurrentIndex(prev => prev - 1);
      } else if (isDeleting && currentIndex === 0) {
        setIsDeleting(false);
        setIsCompleted(false);
      }
    }, delay + (isDeleting ? speed / 2 : speed));

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, text, speed, delay, isCompleted, onComplete]);

  return (
    <Text
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      fontFamily="'JetBrains Mono', monospace"
      display="inline"
      filter="drop-shadow(0 0 8px currentColor)"
    >
      {displayText}
      <Text
        as="span"
        color={color}
        opacity={currentIndex % 2 === 0 ? 1 : 0}
        transition="opacity 0.5s"
        animation="blink 1s infinite"
      >
        |
      </Text>
    </Text>
  );
};
