import { useEffect, useState, useCallback } from 'react';
import { PacMan } from './PacMan';
import { Ghost } from './Ghost';
import { DirectionIndicator } from './DirectionIndicator';
import { Button } from './ui/button';
import { toast } from 'sonner';

type CellType = 'wall' | 'path' | 'pellet' | 'powerPellet';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Position {
  x: number;
  y: number;
}

interface GhostEntity {
  id: string;
  position: Position;
  color: 'red' | 'pink' | 'cyan' | 'orange';
  isRespawning?: boolean;
}

const GHOST_SPAWN = { x: 9, y: 9 };

const CELL_SIZE = 24;
const GAME_SPEED = 120; // Balanced speed for smooth gameplay
const POWER_MODE_DURATION = 10000; // 10 seconds
const RESPAWN_DURATION = 3000; // 3 seconds

// Simplified maze for MVP
const createMaze = (): CellType[][] => {
  const maze: CellType[][] = [
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
    ['wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall'],
    ['wall', 'powerPellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'powerPellet', 'wall'],
    ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
    ['wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall'],
    ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'path', 'wall', 'path', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'path', 'path', 'wall', 'pellet', 'wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'wall', 'pellet', 'wall', 'path', 'path', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'path', 'wall', 'wall', 'path', 'wall', 'wall', 'path', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall'],
    ['path', 'path', 'path', 'path', 'pellet', 'path', 'path', 'wall', 'path', 'path', 'path', 'wall', 'path', 'path', 'pellet', 'path', 'path', 'path', 'path'],
    ['wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'path', 'path', 'wall', 'pellet', 'wall', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'wall', 'pellet', 'wall', 'path', 'path', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'path', 'wall', 'wall', 'wall', 'wall', 'wall', 'path', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall'],
    ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
    ['wall', 'pellet', 'wall', 'wall', 'pellet', 'wall', 'wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall', 'wall', 'pellet', 'wall', 'wall', 'pellet', 'wall'],
    ['wall', 'powerPellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'path', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'powerPellet', 'wall'],
    ['wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall'],
    ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'wall', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
    ['wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall', 'pellet', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'pellet', 'wall'],
    ['wall', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'pellet', 'wall'],
    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
  ];
  return maze;
};

export const GameBoard = () => {
  const [maze, setMaze] = useState<CellType[][]>(createMaze());
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 9, y: 16 });
  const [direction, setDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [ghosts, setGhosts] = useState<GhostEntity[]>([
    { id: 'red', position: { x: 9, y: 8 }, color: 'red' },
    { id: 'pink', position: { x: 8, y: 9 }, color: 'pink' },
    { id: 'cyan', position: { x: 10, y: 9 }, color: 'cyan' },
    { id: 'orange', position: { x: 9, y: 10 }, color: 'orange' },
  ]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [powerMode, setPowerMode] = useState(false);
  const [powerModeTimer, setPowerModeTimer] = useState<NodeJS.Timeout | null>(null);
  const [directionIndicator, setDirectionIndicator] = useState<Direction | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const isValidMove = useCallback((x: number, y: number) => {
    if (y < 0 || y >= maze.length) return false;
    // Allow horizontal wrapping - don't check x bounds
    const wrappedX = x < 0 ? maze[0].length - 1 : x >= maze[0].length ? 0 : x;
    return maze[y][wrappedX] !== 'wall';
  }, [maze]);

  const wrapPosition = useCallback((x: number, y: number): Position => {
    let wrappedX = x;
    if (x < 0) wrappedX = maze[0].length - 1;
    if (x >= maze[0].length) wrappedX = 0;
    return { x: wrappedX, y };
  }, [maze]);

  const movePacman = useCallback(() => {
    if (gameState !== 'playing') return;

    let newX = pacmanPos.x;
    let newY = pacmanPos.y;
    let moveDir = direction;

    // Try to use next direction if possible
    const nextDirDeltas = {
      up: { dx: 0, dy: -1 },
      down: { dx: 0, dy: 1 },
      left: { dx: -1, dy: 0 },
      right: { dx: 1, dy: 0 },
    };

    const nextDelta = nextDirDeltas[nextDirection];
    if (isValidMove(pacmanPos.x + nextDelta.dx, pacmanPos.y + nextDelta.dy)) {
      moveDir = nextDirection;
      setDirection(nextDirection);
    }

    const delta = nextDirDeltas[moveDir];
    newX = pacmanPos.x + delta.dx;
    newY = pacmanPos.y + delta.dy;

    if (!isValidMove(newX, newY)) return;

    const wrappedPos = wrapPosition(newX, newY);
    setPacmanPos(wrappedPos);

    // Check for pellet at wrapped position
    const cell = maze[wrappedPos.y][wrappedPos.x];
    if (cell === 'pellet') {
      setScore(prev => prev + 10);
      const newMaze = [...maze];
      newMaze[wrappedPos.y][wrappedPos.x] = 'path';
      setMaze(newMaze);
    } else if (cell === 'powerPellet') {
      setScore(prev => prev + 50);
      const newMaze = [...maze];
      newMaze[wrappedPos.y][wrappedPos.x] = 'path';
      setMaze(newMaze);
      
      // Activate power mode
      if (powerModeTimer) clearTimeout(powerModeTimer);
      setPowerMode(true);
      toast.success('Power Mode!', { duration: 1000 });
      
      const timer = setTimeout(() => {
        setPowerMode(false);
        toast.info('Power Mode ended', { duration: 1000 });
      }, POWER_MODE_DURATION);
      setPowerModeTimer(timer);
    }
    
    // Check if Pac-Man eats a vulnerable ghost
    if (powerMode) {
      const eatenGhost = ghosts.find(
        g => g.position.x === wrappedPos.x && g.position.y === wrappedPos.y && !g.isRespawning
      );
      
      if (eatenGhost) {
        setScore(prev => prev + 200);
        toast.success('+200 Points!', { duration: 800 });
        
        // Send ghost back to spawn
        setGhosts(prevGhosts =>
          prevGhosts.map(g =>
            g.id === eatenGhost.id
              ? { ...g, position: GHOST_SPAWN, isRespawning: true }
              : g
          )
        );
        
        // Remove respawning flag after delay
        setTimeout(() => {
          setGhosts(prevGhosts =>
            prevGhosts.map(g =>
              g.id === eatenGhost.id ? { ...g, isRespawning: false } : g
            )
          );
        }, RESPAWN_DURATION);
      }
    }
  }, [pacmanPos, direction, nextDirection, maze, gameState, isValidMove, wrapPosition, powerMode, ghosts, powerModeTimer]);

  const moveGhosts = useCallback(() => {
    if (gameState !== 'playing') return;

    setGhosts(prevGhosts =>
      prevGhosts.map(ghost => {
        // Don't move respawning ghosts
        if (ghost.isRespawning) return ghost;
        
        const deltas = {
          up: { dx: 0, dy: -1 },
          down: { dx: 0, dy: 1 },
          left: { dx: -1, dy: 0 },
          right: { dx: 1, dy: 0 },
        };

        const directions: Direction[] = ['up', 'down', 'left', 'right'];
        const validMoves = directions.filter(dir => {
          const delta = deltas[dir];
          return isValidMove(ghost.position.x + delta.dx, ghost.position.y + delta.dy);
        });

        if (validMoves.length === 0) return ghost;

        let chosenDir: Direction;

        // Different AI behaviors for each ghost
        if (powerMode) {
          // Run away from Pac-Man when vulnerable
          const awayMoves = validMoves.map(dir => {
            const delta = deltas[dir];
            const newX = ghost.position.x + delta.dx;
            const newY = ghost.position.y + delta.dy;
            const distance = Math.abs(newX - pacmanPos.x) + Math.abs(newY - pacmanPos.y);
            return { dir, distance };
          });
          // Choose direction that maximizes distance
          awayMoves.sort((a, b) => b.distance - a.distance);
          chosenDir = awayMoves[0].dir;
        } else {
          switch (ghost.color) {
            case 'red':
              // Red: Direct chase - always moves toward Pac-Man
              const redMoves = validMoves.map(dir => {
                const delta = deltas[dir];
                const newX = ghost.position.x + delta.dx;
                const newY = ghost.position.y + delta.dy;
                const distance = Math.abs(newX - pacmanPos.x) + Math.abs(newY - pacmanPos.y);
                return { dir, distance };
              });
              redMoves.sort((a, b) => a.distance - b.distance);
              chosenDir = redMoves[0].dir;
              break;

            case 'pink':
              // Pink: Ambush - tries to get in front of Pac-Man
              const targetX = pacmanPos.x + (direction === 'left' ? -4 : direction === 'right' ? 4 : 0);
              const targetY = pacmanPos.y + (direction === 'up' ? -4 : direction === 'down' ? 4 : 0);
              const pinkMoves = validMoves.map(dir => {
                const delta = deltas[dir];
                const newX = ghost.position.x + delta.dx;
                const newY = ghost.position.y + delta.dy;
                const distance = Math.abs(newX - targetX) + Math.abs(newY - targetY);
                return { dir, distance };
              });
              pinkMoves.sort((a, b) => a.distance - b.distance);
              chosenDir = pinkMoves[0].dir;
              break;

            case 'cyan':
              // Cyan: Patrol - moves in a pattern with some randomness
              if (Math.random() < 0.7) {
                const cyanMoves = validMoves.map(dir => {
                  const delta = deltas[dir];
                  const newX = ghost.position.x + delta.dx;
                  const newY = ghost.position.y + delta.dy;
                  const distance = Math.abs(newX - pacmanPos.x) + Math.abs(newY - pacmanPos.y);
                  return { dir, distance };
                });
                cyanMoves.sort((a, b) => a.distance - b.distance);
                chosenDir = cyanMoves[0].dir;
              } else {
                chosenDir = validMoves[Math.floor(Math.random() * validMoves.length)];
              }
              break;

            case 'orange':
              // Orange: Shy - chases when far, retreats when close
              const distanceToPacman = Math.abs(ghost.position.x - pacmanPos.x) + Math.abs(ghost.position.y - pacmanPos.y);
              const orangeMoves = validMoves.map(dir => {
                const delta = deltas[dir];
                const newX = ghost.position.x + delta.dx;
                const newY = ghost.position.y + delta.dy;
                const distance = Math.abs(newX - pacmanPos.x) + Math.abs(newY - pacmanPos.y);
                return { dir, distance };
              });
              
              if (distanceToPacman > 8) {
                // Chase when far
                orangeMoves.sort((a, b) => a.distance - b.distance);
              } else {
                // Retreat when close
                orangeMoves.sort((a, b) => b.distance - a.distance);
              }
              chosenDir = orangeMoves[0].dir;
              break;

            default:
              chosenDir = validMoves[Math.floor(Math.random() * validMoves.length)];
          }
        }

        const delta = deltas[chosenDir];
        const newX = ghost.position.x + delta.dx;
        const newY = ghost.position.y + delta.dy;
        const wrappedPos = wrapPosition(newX, newY);

        return {
          ...ghost,
          position: wrappedPos,
        };
      })
    );
  }, [gameState, isValidMove, wrapPosition, powerMode, pacmanPos, direction]);

  // Check collision with ghosts (only if not in power mode)
  useEffect(() => {
    if (gameState !== 'playing' || powerMode) return;

    const collision = ghosts.some(
      ghost => ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y && !ghost.isRespawning
    );

    if (collision) {
      setGameState('lost');
      toast.error('Game Over!');
    }
  }, [pacmanPos, ghosts, gameState, powerMode]);

  // Check win condition
  useEffect(() => {
    if (gameState !== 'playing') return;

    const hasRemainingPellets = maze.some(row =>
      row.some(cell => cell === 'pellet' || cell === 'powerPellet')
    );

    if (!hasRemainingPellets) {
      setGameState('won');
      toast.success('You Win!');
    }
  }, [maze, gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      movePacman();
      moveGhosts();
    }, GAME_SPEED);

    return () => clearInterval(gameLoop);
  }, [gameState, movePacman, moveGhosts]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      let newDir: Direction | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
          newDir = 'up';
          setNextDirection('up');
          e.preventDefault();
          break;
        case 'ArrowDown':
          newDir = 'down';
          setNextDirection('down');
          e.preventDefault();
          break;
        case 'ArrowLeft':
          newDir = 'left';
          setNextDirection('left');
          e.preventDefault();
          break;
        case 'ArrowRight':
          newDir = 'right';
          setNextDirection('right');
          e.preventDefault();
          break;
      }
      
      if (newDir) {
        setDirectionIndicator(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Touch/Swipe controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (gameState !== 'playing') return;
      const touch = e.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (gameState !== 'playing' || !touchStart) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      
      const minSwipeDistance = 30;
      
      // Determine swipe direction based on the larger delta
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            // Swipe right
            setNextDirection('right');
            setDirectionIndicator('right');
          } else {
            // Swipe left
            setNextDirection('left');
            setDirectionIndicator('left');
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            // Swipe down
            setNextDirection('down');
            setDirectionIndicator('down');
          } else {
            // Swipe up
            setNextDirection('up');
            setDirectionIndicator('up');
          }
        }
      }
      
      setTouchStart(null);
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, touchStart]);

  const startGame = () => {
    if (powerModeTimer) clearTimeout(powerModeTimer);
    setMaze(createMaze());
    setPacmanPos({ x: 9, y: 16 });
    setDirection('right');
    setNextDirection('right');
    setGhosts([
      { id: 'red', position: { x: 9, y: 8 }, color: 'red' },
      { id: 'pink', position: { x: 8, y: 9 }, color: 'pink' },
      { id: 'cyan', position: { x: 10, y: 9 }, color: 'cyan' },
      { id: 'orange', position: { x: 9, y: 10 }, color: 'orange' },
    ]);
    setScore(0);
    setPowerMode(false);
    setPowerModeTimer(null);
    setGameState('playing');
  };

  const handleTouchControl = (dir: Direction) => {
    if (gameState === 'playing') {
      setNextDirection(dir);
      setDirectionIndicator(dir);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 p-2 md:p-4 w-full max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-1 md:space-y-2 w-full">
        <h1 className="text-2xl sm:text-4xl md:text-6xl text-primary glow-yellow font-bold">PAC-MAN</h1>
        <div className="text-base sm:text-xl md:text-2xl text-foreground">
          SCORE: <span className="text-primary">{score}</span>
        </div>
        {powerMode && (
          <div className="text-sm md:text-lg text-accent animate-pulse">
            ⚡ POWER MODE ⚡
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="relative arcade-border rounded-lg p-1 md:p-2 bg-black touch-none select-none">
        <div
          className="grid gap-0 bg-black mx-auto"
          style={{
            gridTemplateColumns: `repeat(${maze[0].length}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${maze.length}, ${CELL_SIZE}px)`,
            maxWidth: '100%',
          }}
        >
          {maze.map((row, y) =>
            row.map((cell, x) => {
              const isPacman = pacmanPos.x === x && pacmanPos.y === y;
              const ghost = ghosts.find(g => g.position.x === x && g.position.y === y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`relative ${
                    cell === 'wall'
                      ? 'bg-game-wall border border-secondary/30'
                      : 'bg-black'
                  }`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                >
                  {isPacman && (
                    <div className="absolute inset-0 z-20">
                      <PacMan direction={direction} />
                      <DirectionIndicator direction={directionIndicator} />
                    </div>
                  )}
                  {ghost && (
                    <div className="absolute inset-0">
                      <Ghost color={ghost.color} isVulnerable={powerMode && !ghost.isRespawning} />
                    </div>
                  )}
                  {cell === 'pellet' && !isPacman && !ghost && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-game-pellet" />
                    </div>
                  )}
                  {cell === 'powerPellet' && !isPacman && !ghost && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-game-powerPellet pulse-pellet" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Game State Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="text-center space-y-3 md:space-y-4 p-4">
              {gameState === 'ready' && (
                <>
                  <div className="text-lg md:text-2xl text-foreground">PRÊT À JOUER ?</div>
                  <Button
                    onClick={startGame}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg px-6 md:px-8 py-4 md:py-6"
                  >
                    COMMENCER
                  </Button>
                  <div className="text-xs md:text-sm text-muted-foreground mt-4 space-y-1">
                    <p className="hidden md:block">Flèches du clavier pour bouger</p>
                    <p className="md:hidden">Glisse sur l'écran pour bouger</p>
                  </div>
                </>
              )}
              {gameState === 'won' && (
                <>
                  <div className="text-2xl md:text-3xl text-primary glow-yellow">VICTOIRE !</div>
                  <div className="text-lg md:text-xl text-foreground">Score final : {score}</div>
                  <Button
                    onClick={startGame}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg px-6 md:px-8 py-4 md:py-6"
                  >
                    REJOUER
                  </Button>
                </>
              )}
              {gameState === 'lost' && (
                <>
                  <div className="text-2xl md:text-3xl text-destructive">GAME OVER</div>
                  <div className="text-lg md:text-xl text-foreground">Score final : {score}</div>
                  <Button
                    onClick={startGame}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg px-6 md:px-8 py-4 md:py-6"
                  >
                    RÉESSAYER
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Touch Controls - Only shown on mobile */}
      <div className="grid grid-cols-3 gap-2 w-44 sm:w-52 md:hidden">
        <div />
        <Button
          onClick={() => handleTouchControl('up')}
          variant="secondary"
          size="lg"
          className="h-12 sm:h-16 text-xl sm:text-2xl active:scale-95 transition-transform"
          disabled={gameState !== 'playing'}
        >
          ▲
        </Button>
        <div />
        <Button
          onClick={() => handleTouchControl('left')}
          variant="secondary"
          size="lg"
          className="h-12 sm:h-16 text-xl sm:text-2xl active:scale-95 transition-transform"
          disabled={gameState !== 'playing'}
        >
          ◄
        </Button>
        <Button
          onClick={() => handleTouchControl('down')}
          variant="secondary"
          size="lg"
          className="h-12 sm:h-16 text-xl sm:text-2xl active:scale-95 transition-transform"
          disabled={gameState !== 'playing'}
        >
          ▼
        </Button>
        <Button
          onClick={() => handleTouchControl('right')}
          variant="secondary"
          size="lg"
          className="h-12 sm:h-16 text-xl sm:text-2xl active:scale-95 transition-transform"
          disabled={gameState !== 'playing'}
        >
          ►
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs sm:text-sm text-muted-foreground max-w-md space-y-1 px-4">
        <p className="hidden md:block">Utilisez les flèches du clavier pour déplacer Pac-Man</p>
        <p className="md:hidden">Glissez sur le plateau ou utilisez les boutons</p>
        <p>Mangez toutes les pastilles pour gagner • Évitez les fantômes !</p>
        <p className="text-xs opacity-70 mt-2">🔴 Rouge : chasseur • 🩷 Rose : embusqueur • 🩵 Cyan : patrouilleur • 🟠 Orange : timide</p>
      </div>
    </div>
  );
};
