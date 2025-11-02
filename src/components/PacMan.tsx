interface PacManProps {
  direction: 'up' | 'down' | 'left' | 'right';
}

export const PacMan = ({ direction }: PacManProps) => {
  const rotations = {
    right: '0deg',
    down: '90deg',
    left: '180deg',
    up: '270deg',
  };

  return (
    <div
      className="w-full h-full rounded-full bg-game-pacman glow-yellow transition-transform duration-150 ease-linear"
      style={{
        transform: `rotate(${rotations[direction]})`,
        clipPath: 'polygon(100% 50%, 70% 0, 0 0, 0 100%, 70% 100%)',
      }}
    />
  );
};
