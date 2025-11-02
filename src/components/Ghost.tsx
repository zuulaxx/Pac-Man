interface GhostProps {
  color: 'red' | 'pink' | 'cyan' | 'orange';
  isVulnerable?: boolean;
}

export const Ghost = ({ color, isVulnerable = false }: GhostProps) => {
  const colorMap = {
    red: 'bg-game-ghostRed',
    pink: 'bg-game-ghostPink',
    cyan: 'bg-game-ghostCyan',
    orange: 'bg-game-ghostOrange',
  };

  const ghostColor = isVulnerable ? 'bg-blue-900' : colorMap[color];

  return (
    <div className="w-full h-full flex items-end justify-center ghost-float">
      <div className={`w-full h-[85%] ${ghostColor} rounded-t-full relative transition-colors duration-300`}>
        <div className="absolute bottom-0 w-full h-3 flex justify-around">
          <div className={`w-1/4 h-full ${ghostColor} rounded-b-full`} />
          <div className={`w-1/4 h-full ${ghostColor} rounded-b-full`} />
          <div className={`w-1/4 h-full ${ghostColor} rounded-b-full`} />
        </div>
        {/* Eyes */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-2 h-3 bg-white rounded-full">
            <div className={`w-1 h-1.5 ${isVulnerable ? 'bg-white' : 'bg-black'} rounded-full mt-1 ml-0.5`} />
          </div>
          <div className="w-2 h-3 bg-white rounded-full">
            <div className={`w-1 h-1.5 ${isVulnerable ? 'bg-white' : 'bg-black'} rounded-full mt-1 ml-0.5`} />
          </div>
        </div>
      </div>
    </div>
  );
};
