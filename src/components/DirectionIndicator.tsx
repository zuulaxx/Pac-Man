import { useEffect, useState } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface DirectionIndicatorProps {
  direction: Direction | null;
}

export const DirectionIndicator = ({ direction }: DirectionIndicatorProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (direction) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [direction]);

  if (!visible || !direction) return null;

  const rotations = {
    up: '0deg',
    right: '90deg',
    down: '180deg',
    left: '270deg',
  };

  const arrows = {
    up: '▲',
    down: '▼',
    left: '◄',
    right: '►',
  };

  const positions = {
    up: '-top-5 left-1/2 -translate-x-1/2',
    down: '-bottom-5 left-1/2 -translate-x-1/2',
    left: 'top-1/2 -translate-y-1/2 -left-5',
    right: 'top-1/2 -translate-y-1/2 -right-5',
  };

  return (
    <div className={`absolute ${positions[direction]} z-50 pointer-events-none animate-fade-in`}>
      <div
        className="text-xl text-primary glow-yellow font-bold"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 0.8))',
        }}
      >
        {arrows[direction]}
      </div>
    </div>
  );
};
