import React, { useState, useCallback, useEffect } from 'react';

const BOARD_SIZE = 4;
const PIECE_SIZES = [1, 2, 3, 4];
const STACKS_PER_PLAYER = 3;

const createInitialStacks = () => {
  return {
    player: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES]),
    cpu: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES])
  };
};

const createEmptyBoard = () => {
  return Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null).map(() => [])
  );
};

const checkWinner = (board) => {
  const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;

  for (let row = 0; row < BOARD_SIZE; row++) {
    const pieces = board[row].map(getTopPiece);
    if (pieces[0] && pieces.every(p => p && p.owner === pieces[0].owner)) {
      return pieces[0].owner;
    }
  }

  for (let col = 0; col < BOARD_SIZE; col++) {
    const pieces = board.map(row => getTopPiece(row[col]));
    if (pieces[0] && pieces.every(p => p && p.owner === pieces[0].owner)) {
      return pieces[0].owner;
    }
  }

  const diag1 = [0, 1, 2, 3].map(i => getTopPiece(board[i][i]));
  if (diag1[0] && diag1.every(p => p && p.owner === diag1[0].owner)) {
    return diag1[0].owner;
  }

  const diag2 = [0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i]));
  if (diag2[0] && diag2.every(p => p && p.owner === diag2[0].owner)) {
    return diag2[0].owner;
  }

  return null;
};

const Piece = ({ size, owner, isTop, onClick, isSelected, cellSize }) => {
  const baseSize = cellSize ? (cellSize * 0.3 + size * cellSize * 0.15) : (20 + size * 14);
  const colors = owner === 'player'
    ? { main: '#c0392b', light: '#e74c3c', dark: '#922b21', ring: '#f5b7b1' }
    : { main: '#2471a3', light: '#5dade2', dark: '#1a5276', ring: '#aed6f1' };

  return (
    <div
      onClick={onClick}
      style={{
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${colors.light}, ${colors.main} 50%, ${colors.dark})`,
        boxShadow: isSelected
          ? `0 0 0 3px #f1c40f, 0 4px 8px rgba(0,0,0,0.4)`
          : `inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)`,
        cursor: isTop ? 'pointer' : 'default',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        border: `2px solid ${colors.ring}`,
        zIndex: size,
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <div style={{
        width: `${baseSize * 0.5}px`,
        height: `${baseSize * 0.5}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 40%, ${colors.light}88, transparent)`,
      }} />
    </div>
  );
};

const BoardCell = ({ cell, rowIndex, colIndex, onCellClick, canPlace, cellSize }) => {
  return (
    <div
      onClick={() => onCellClick(rowIndex, colIndex)}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        background: canPlace
          ? 'linear-gradient(145deg, #d4a574, #c49a6c)'
          : 'linear-gradient(145deg, #c49a6c, #b8896a)',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: canPlace ? 'pointer' : 'default',
        boxShadow: canPlace
          ? 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2), 0 0 0 2px #f1c40f'
          : 'inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.2)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {cell.map((piece, index) => (
        <div key={index} style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Piece
            size={piece.size}
            owner={piece.owner}
            isTop={index === cell.length - 1}
            cellSize={cellSize}
          />
        </div>
      ))}
    </div>
  );
};

const StackArea = ({ stacks, owner, onStackClick, selectedPiece, isPlayerTurn, label, cellSize }) => {
  const stackBoxSize = cellSize * 0.85;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 8px',
      background: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)',
      borderRadius: '10px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      border: '2px solid #6d5d47',
    }}>
      <div style={{
        fontFamily: '"Cinzel", serif',
        fontSize: '11px',
        color: '#d4c4a8',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {stacks.map((stack, stackIndex) => (
          <div
            key={stackIndex}
            onClick={() => owner === 'player' && isPlayerTurn && stack.length > 0 && onStackClick(stackIndex)}
            style={{
              width: `${stackBoxSize}px`,
              height: `${stackBoxSize}px`,
              background: 'linear-gradient(145deg, #8b7355, #6d5d47)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: owner === 'player' && isPlayerTurn && stack.length > 0 ? 'pointer' : 'default',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4)',
              position: 'relative',
              border: selectedPiece?.type === 'stack' && selectedPiece?.stackIndex === stackIndex && owner === 'player'
                ? '2px solid #f1c40f'
                : '2px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {stack.length > 0 && (
              <Piece
                size={stack[stack.length - 1]}
                owner={owner}
                isTop={true}
                isSelected={selectedPiece?.type === 'stack' && selectedPiece?.stackIndex === stackIndex && owner === 'player'}
                cellSize={cellSize * 0.85}
              />
            )}
            {stack.length === 0 && (
              <div style={{
                color: '#4a3f2f',
                fontSize: '16px',
                fontWeight: 'bold',
              }}>×</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Gobblet() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [stacks, setStacks] = useState(createInitialStacks());
  const [currentTurn, setCurrentTurn] = useState('player');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [winner, setWinner] = useState(null);
  const [difficulty, setDifficulty] = useState('normal');
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [cellSize, setCellSize] = useState(70);
  const [gameLog, setGameLog] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // 固定要素の高さ合計
      // Header: 24px, StackArea×2: 140px, MessageBar: 30px
      // Buttons: 36px, gaps: 36px, padding: 16px = 282px
      const fixedElementsHeight = 282;

      const availableHeight = vh - fixedElementsHeight;
      const maxCellFromHeight = Math.floor((availableHeight - 37) / 4);

      const availableWidth = vw - 16;
      const maxCellFromWidth = Math.floor((availableWidth - 37) / 4);

      const newCellSize = Math.min(Math.max(Math.min(maxCellFromHeight, maxCellFromWidth), 38), 70);
      setCellSize(newCellSize);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setStacks(createInitialStacks());
    setCurrentTurn('player');
    setSelectedPiece(null);
    setWinner(null);
    setMessage('Your turn');
    setGameLog([]);
    setCopySuccess(false);
  };

  const startGame = (diff) => {
    setDifficulty(diff);
    setGameStarted(true);
    resetGame();
  };

  const formatMove = (move, owner) => {
    const colLabels = ['A', 'B', 'C', 'D'];
    const rowLabels = ['1', '2', '3', '4'];
    const to = `${colLabels[move.toCol]}${rowLabels[move.toRow]}`;
    if (move.type === 'stack') {
      return `${owner === 'player' ? 'P' : 'C'}: Stack → ${to}`;
    } else {
      const from = `${colLabels[move.fromCol]}${rowLabels[move.fromRow]}`;
      return `${owner === 'player' ? 'P' : 'C'}: ${from} → ${to}`;
    }
  };

  const copyGameLog = async () => {
    const logText = [
      `GOBBLET Game Log`,
      `Difficulty: ${difficulty}`,
      `Result: ${winner === 'player' ? 'Player Wins' : winner === 'cpu' ? 'CPU Wins' : 'Unknown'}`,
      `---`,
      ...gameLog
    ].join('\n');

    try {
      await navigator.clipboard.writeText(logText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const getValidMoves = useCallback((board, stacks, owner) => {
    const moves = [];

    stacks[owner].forEach((stack, stackIndex) => {
      if (stack.length > 0) {
        const pieceSize = stack[stack.length - 1];
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = board[row][col];
            if (cell.length === 0 || cell[cell.length - 1].size < pieceSize) {
              moves.push({
                type: 'stack',
                stackIndex,
                pieceSize,
                toRow: row,
                toCol: col
              });
            }
          }
        }
      }
    });

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cell = board[row][col];
        if (cell.length > 0 && cell[cell.length - 1].owner === owner) {
          const piece = cell[cell.length - 1];
          for (let toRow = 0; toRow < BOARD_SIZE; toRow++) {
            for (let toCol = 0; toCol < BOARD_SIZE; toCol++) {
              if (toRow === row && toCol === col) continue;
              const targetCell = board[toRow][toCol];
              if (targetCell.length === 0 || targetCell[targetCell.length - 1].size < piece.size) {
                moves.push({
                  type: 'board',
                  fromRow: row,
                  fromCol: col,
                  pieceSize: piece.size,
                  toRow,
                  toCol
                });
              }
            }
          }
        }
      }
    }

    return moves;
  }, []);

  const applyMove = useCallback((board, stacks, move, owner) => {
    const newBoard = board.map(row => row.map(cell => [...cell]));
    const newStacks = {
      player: stacks.player.map(s => [...s]),
      cpu: stacks.cpu.map(s => [...s])
    };

    let piece;
    if (move.type === 'stack') {
      piece = { size: newStacks[owner][move.stackIndex].pop(), owner };
    } else {
      piece = newBoard[move.fromRow][move.fromCol].pop();
    }

    newBoard[move.toRow][move.toCol].push(piece);

    return { newBoard, newStacks };
  }, []);

  const evaluateBoard = useCallback((board, owner) => {
    const opponent = owner === 'player' ? 'cpu' : 'player';
    const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;

    let score = 0;
    const lines = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      lines.push(board[i].map(getTopPiece));
      lines.push(board.map(row => getTopPiece(row[i])));
    }
    lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][i])));
    lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i])));

    let ownerThreeCount = 0;
    let opponentThreeCount = 0;

    for (const line of lines) {
      const ownerCount = line.filter(p => p && p.owner === owner).length;
      const opponentCount = line.filter(p => p && p.owner === opponent).length;

      if (opponentCount === 0) {
        score += ownerCount * ownerCount * 10;
        if (ownerCount === 4) score += 10000;
        if (ownerCount === 3) {
          score += 100;
          ownerThreeCount++;
        }
      }
      if (ownerCount === 0) {
        score -= opponentCount * opponentCount * 10;
        if (opponentCount === 4) score -= 10000;
        if (opponentCount === 3) {
          score -= 150;
          opponentThreeCount++;
        }
      }
    }

    // Fork detection: multiple winning threats
    if (ownerThreeCount >= 2) score += 300;
    if (opponentThreeCount >= 2) score -= 400;

    // Center control bonus
    const centerCells = [[1,1], [1,2], [2,1], [2,2]];
    for (const [row, col] of centerCells) {
      const piece = getTopPiece(board[row][col]);
      if (piece) {
        if (piece.owner === owner) score += 20;
        else score -= 18;
      }
    }

    // Corner control bonus
    const cornerCells = [[0,0], [0,3], [3,0], [3,3]];
    for (const [row, col] of cornerCells) {
      const piece = getTopPiece(board[row][col]);
      if (piece) {
        if (piece.owner === owner) score += 15;
        else score -= 13;
      }
    }

    // Piece size strategy: reward for having larger pieces on board
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = getTopPiece(board[row][col]);
        if (piece && piece.owner === owner && piece.size >= 3) {
          score += 5;
        }
      }
    }

    score += Math.random() * 5;

    return score;
  }, []);

  const countPlayerThreats = useCallback((board) => {
    const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;
    const lines = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
      lines.push(board[i].map(getTopPiece));
      lines.push(board.map(row => getTopPiece(row[i])));
    }
    lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][i])));
    lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i])));

    let threatCount = 0;
    for (const line of lines) {
      const playerCount = line.filter(p => p && p.owner === 'player').length;
      const cpuCount = line.filter(p => p && p.owner === 'cpu').length;
      if (playerCount === 3 && cpuCount === 0) {
        threatCount++;
      }
    }
    return threatCount;
  }, []);

  const minimax = useCallback((board, stacks, depth, isMaximizing, owner, alpha, beta) => {
    const currentWinner = checkWinner(board);
    if (currentWinner === 'cpu') return 10000 - depth;
    if (currentWinner === 'player') return -10000 + depth;
    if (depth === 0) return evaluateBoard(board, 'cpu');

    const currentOwner = isMaximizing ? 'cpu' : 'player';
    const moves = getValidMoves(board, stacks, currentOwner);

    if (moves.length === 0) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves.slice(0, 20)) {
        const { newBoard, newStacks } = applyMove(board, stacks, move, currentOwner);
        const evalScore = minimax(newBoard, newStacks, depth - 1, false, owner, alpha, beta);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves.slice(0, 20)) {
        const { newBoard, newStacks } = applyMove(board, stacks, move, currentOwner);
        const evalScore = minimax(newBoard, newStacks, depth - 1, true, owner, alpha, beta);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }, [evaluateBoard, getValidMoves, applyMove]);

  const isSafeMove = useCallback((currentBoard, currentStacks, cpuMove) => {
    const { newBoard: boardAfterCpu, newStacks: stacksAfterCpu } = applyMove(currentBoard, currentStacks, cpuMove, 'cpu');

    if (checkWinner(boardAfterCpu) === 'cpu') return true;

    const playerMovesAfter = getValidMoves(boardAfterCpu, stacksAfterCpu, 'player');

    for (const playerMove of playerMovesAfter) {
      const { newBoard: boardAfterPlayer } = applyMove(boardAfterCpu, stacksAfterCpu, playerMove, 'player');

      if (checkWinner(boardAfterPlayer) === 'player') {
        return false;
      }

      if (countPlayerThreats(boardAfterPlayer) >= 2) {
        return false;
      }
    }

    return true;
  }, [applyMove, getValidMoves, countPlayerThreats]);

  const allowsImmediateWin = useCallback((currentBoard, currentStacks, cpuMove) => {
    const { newBoard: boardAfterCpu, newStacks: stacksAfterCpu } = applyMove(currentBoard, currentStacks, cpuMove, 'cpu');

    if (checkWinner(boardAfterCpu) === 'cpu') return false;

    const playerMovesAfter = getValidMoves(boardAfterCpu, stacksAfterCpu, 'player');

    for (const playerMove of playerMovesAfter) {
      const { newBoard: boardAfterPlayer } = applyMove(boardAfterCpu, stacksAfterCpu, playerMove, 'player');
      if (checkWinner(boardAfterPlayer) === 'player') {
        return true;
      }
    }

    return false;
  }, [applyMove, getValidMoves]);

  const getCpuMove = useCallback(() => {
    const moves = getValidMoves(board, stacks, 'cpu');
    if (moves.length === 0) return null;

    if (difficulty === 'easy') {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    for (const move of moves) {
      const { newBoard } = applyMove(board, stacks, move, 'cpu');
      if (checkWinner(newBoard) === 'cpu') {
        return move;
      }
    }

    const playerMoves = getValidMoves(board, stacks, 'player');
    for (const playerMove of playerMoves) {
      const { newBoard: testBoard } = applyMove(board, stacks, playerMove, 'player');
      if (checkWinner(testBoard) === 'player') {
        for (const move of moves) {
          if (move.toRow === playerMove.toRow && move.toCol === playerMove.toCol) {
            return move;
          }
        }
      }
    }

    if (difficulty === 'normal') {
      let bestMove = moves[0];
      let bestScore = -Infinity;

      for (const move of moves) {
        const { newBoard } = applyMove(board, stacks, move, 'cpu');
        const score = evaluateBoard(newBoard, 'cpu');
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    const isPlayerInFork = countPlayerThreats(board) >= 2;

    if (difficulty === 'hard') {
      let candidateMoves = moves;
      if (!isPlayerInFork) {
        const safeMoves = moves.filter(move => isSafeMove(board, stacks, move));
        if (safeMoves.length > 0) {
          candidateMoves = safeMoves;
        } else {
          const nonLosingMoves = moves.filter(move => !allowsImmediateWin(board, stacks, move));
          if (nonLosingMoves.length > 0) {
            candidateMoves = nonLosingMoves;
          }
        }
      }

      let bestMove = candidateMoves[0];
      let bestScore = -Infinity;

      for (const move of candidateMoves) {
        const { newBoard, newStacks } = applyMove(board, stacks, move, 'cpu');
        const score = minimax(newBoard, newStacks, 3, false, 'cpu', -Infinity, Infinity);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    // Ultra Hard: deeper search, more moves evaluated
    let candidateMoves = moves;
    if (!isPlayerInFork) {
      const safeMoves = moves.filter(move => isSafeMove(board, stacks, move));
      if (safeMoves.length > 0) {
        candidateMoves = safeMoves;
      } else {
        const nonLosingMoves = moves.filter(move => !allowsImmediateWin(board, stacks, move));
        if (nonLosingMoves.length > 0) {
          candidateMoves = nonLosingMoves;
        }
      }
    }

    let bestMove = candidateMoves[0];
    let bestScore = -Infinity;
    const movesToEvaluate = Math.min(candidateMoves.length, 40);

    for (let i = 0; i < movesToEvaluate; i++) {
      const move = candidateMoves[i];
      const { newBoard, newStacks } = applyMove(board, stacks, move, 'cpu');
      const score = minimax(newBoard, newStacks, 4, false, 'cpu', -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }, [board, stacks, difficulty, getValidMoves, applyMove, evaluateBoard, minimax, countPlayerThreats, isSafeMove, allowsImmediateWin]);

  useEffect(() => {
    if (currentTurn === 'cpu' && !winner && gameStarted) {
      setMessage('CPU thinking...');
      const delay = difficulty === 'ultrahard' ? 1500 : 800;
      const timer = setTimeout(() => {
        const move = getCpuMove();
        if (move) {
          setGameLog(prev => [...prev, formatMove(move, 'cpu')]);
          const { newBoard, newStacks } = applyMove(board, stacks, move, 'cpu');
          setBoard(newBoard);
          setStacks(newStacks);

          const gameWinner = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            setMessage(gameWinner === 'player' ? '🎉 You Win!' : '💻 CPU Wins');
          } else {
            setCurrentTurn('player');
            setMessage('Your turn');
          }
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, winner, gameStarted, getCpuMove, applyMove, board, stacks, difficulty, formatMove]);

  const handleStackClick = (stackIndex) => {
    if (currentTurn !== 'player' || winner) return;

    if (selectedPiece?.type === 'stack' && selectedPiece?.stackIndex === stackIndex) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece({ type: 'stack', stackIndex });
    }
  };

  const handleBoardPieceClick = (row, col) => {
    if (currentTurn !== 'player' || winner) return;

    const cell = board[row][col];
    if (cell.length > 0 && cell[cell.length - 1].owner === 'player') {
      if (selectedPiece?.type === 'board' && selectedPiece?.row === row && selectedPiece?.col === col) {
        setSelectedPiece(null);
      } else {
        setSelectedPiece({ type: 'board', row, col });
      }
    }
  };

  const handleCellClick = (row, col) => {
    if (currentTurn !== 'player' || winner || !selectedPiece) return;

    const cell = board[row][col];

    if (selectedPiece.type === 'board' && selectedPiece.row === row && selectedPiece.col === col) {
      handleBoardPieceClick(row, col);
      return;
    }

    let pieceSize;
    if (selectedPiece.type === 'stack') {
      pieceSize = stacks.player[selectedPiece.stackIndex][stacks.player[selectedPiece.stackIndex].length - 1];
    } else {
      pieceSize = board[selectedPiece.row][selectedPiece.col][board[selectedPiece.row][selectedPiece.col].length - 1].size;
    }

    const canPlace = cell.length === 0 || cell[cell.length - 1].size < pieceSize;

    if (canPlace) {
      const move = selectedPiece.type === 'stack'
        ? { type: 'stack', stackIndex: selectedPiece.stackIndex, toRow: row, toCol: col }
        : { type: 'board', fromRow: selectedPiece.row, fromCol: selectedPiece.col, toRow: row, toCol: col };

      setGameLog(prev => [...prev, formatMove(move, 'player')]);

      const { newBoard, newStacks } = applyMove(board, stacks, move, 'player');

      const potentialWinner = checkWinner(newBoard);

      if (selectedPiece.type === 'board') {
        const uncoveredCell = newBoard[selectedPiece.row][selectedPiece.col];
        if (uncoveredCell.length > 0) {
          const uncoveredPiece = uncoveredCell[uncoveredCell.length - 1];
          if (uncoveredPiece.owner === 'cpu') {
            const cpuWinCheck = checkWinner(newBoard);
            if (cpuWinCheck === 'cpu' && potentialWinner !== 'player') {
              setBoard(newBoard);
              setStacks(newStacks);
              setSelectedPiece(null);
              setWinner('cpu');
              setMessage('💻 CPU Wins');
              return;
            }
          }
        }
      }

      setBoard(newBoard);
      setStacks(newStacks);
      setSelectedPiece(null);

      if (potentialWinner) {
        setWinner(potentialWinner);
        setMessage(potentialWinner === 'player' ? '🎉 You Win!' : '💻 CPU Wins');
      } else {
        setCurrentTurn('cpu');
      }
    }
  };

  const canPlaceAt = (row, col) => {
    if (!selectedPiece || currentTurn !== 'player') return false;

    const cell = board[row][col];
    let pieceSize;

    if (selectedPiece.type === 'stack') {
      const stack = stacks.player[selectedPiece.stackIndex];
      if (stack.length === 0) return false;
      pieceSize = stack[stack.length - 1];
    } else {
      if (selectedPiece.row === row && selectedPiece.col === col) return false;
      pieceSize = board[selectedPiece.row][selectedPiece.col][board[selectedPiece.row][selectedPiece.col].length - 1].size;
    }

    return cell.length === 0 || cell[cell.length - 1].size < pieceSize;
  };

  if (!gameStarted) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Cinzel", Georgia, serif',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

        <h1 style={{
          fontSize: 'clamp(28px, 8vw, 48px)',
          color: '#d4a574',
          textShadow: '0 4px 8px rgba(0,0,0,0.5), 0 0 40px rgba(212,165,116,0.3)',
          marginBottom: '12px',
          letterSpacing: '6px',
        }}>
          GOBBLET
        </h1>

        <p style={{
          color: '#a89070',
          fontSize: 'clamp(10px, 2.5vw, 14px)',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '90%',
          lineHeight: '1.6',
        }}>
          4-in-a-row on 4×4 board. Cover with bigger pieces
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: '280px',
        }}>
          {[
            { key: 'easy', label: 'Easy' },
            { key: 'normal', label: 'Normal' },
            { key: 'hard', label: 'Hard' },
            { key: 'ultrahard', label: 'Ultra Hard' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => startGame(key)}
              style={{
                padding: '12px',
                fontSize: '15px',
                fontFamily: '"Cinzel", serif',
                background: 'linear-gradient(180deg, #8b7355 0%, #6d5d47 100%)',
                border: '2px solid #a89070',
                borderRadius: '10px',
                color: '#f5e6d3',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          color: '#6d5d47',
          fontSize: '9px',
          fontFamily: 'monospace',
          opacity: 0.6,
        }}>
          v1.5.0
        </div>
      </div>
    );
  }

  const boardSize = cellSize * 4 + 6 * 3;

  return (
    <div style={{
      height: '100dvh',
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: '6px',
      padding: '8px',
      fontFamily: '"Cinzel", Georgia, serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: `${boardSize + 40}px`,
      }}>
        <h1 style={{
          fontSize: '16px',
          color: '#d4a574',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '2px',
          margin: 0,
        }}>
          GOBBLET
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            color: '#a89070',
            fontSize: '11px',
          }}>
            {difficulty === 'easy' ? '★' : difficulty === 'normal' ? '★★' : difficulty === 'hard' ? '★★★' : '★★★★'}
          </span>
          <span style={{
            color: '#6d5d47',
            fontSize: '8px',
            fontFamily: 'monospace',
          }}>
            v1.5.0
          </span>
        </div>
      </div>

      <div style={{ flex: 'none' }}>
        <StackArea
          stacks={stacks.cpu}
          owner="cpu"
          onStackClick={() => {}}
          selectedPiece={null}
          isPlayerTurn={false}
          label="CPU"
          cellSize={cellSize}
        />
      </div>

      <div style={{
        flex: '1',
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          padding: '8px',
          background: 'linear-gradient(145deg, #6d5d47, #5d4e37)',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)',
          border: '3px solid #8b7355',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(4, ${cellSize}px)`,
            gap: '5px',
          }}>
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <BoardCell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  onCellClick={(r, c) => {
                    if (cell.length > 0 && cell[cell.length - 1].owner === 'player' && !selectedPiece) {
                      handleBoardPieceClick(r, c);
                    } else {
                      handleCellClick(r, c);
                    }
                  }}
                  canPlace={canPlaceAt(rowIndex, colIndex)}
                  cellSize={cellSize}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 'none' }}>
        <StackArea
          stacks={stacks.player}
          owner="player"
          onStackClick={handleStackClick}
          selectedPiece={selectedPiece}
          isPlayerTurn={currentTurn === 'player'}
          label="YOU"
          cellSize={cellSize}
        />
      </div>

      <div style={{
        flex: 'none',
        padding: '6px 14px',
        background: winner
          ? (winner === 'player' ? 'linear-gradient(180deg, #27ae60, #1e8449)' : 'linear-gradient(180deg, #e74c3c, #c0392b)')
          : 'linear-gradient(180deg, #5d4e37, #4a3f2f)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        <p style={{
          color: '#f5e6d3',
          fontSize: '11px',
          textAlign: 'center',
          margin: 0,
        }}>
          {message}
        </p>
      </div>

      <div style={{
        flex: 'none',
        display: 'flex',
        gap: '10px',
      }}>
        <button
          onClick={resetGame}
          style={{
            padding: '6px 16px',
            fontSize: '11px',
            fontFamily: '"Cinzel", serif',
            background: 'linear-gradient(180deg, #8b7355 0%, #6d5d47 100%)',
            border: '2px solid #a89070',
            borderRadius: '6px',
            color: '#f5e6d3',
            cursor: 'pointer',
          }}
        >
          Play Again
        </button>

        {winner && (
          <button
            onClick={copyGameLog}
            style={{
              padding: '6px 16px',
              fontSize: '11px',
              fontFamily: '"Cinzel", serif',
              background: copySuccess
                ? 'linear-gradient(180deg, #27ae60 0%, #1e8449 100%)'
                : 'linear-gradient(180deg, #2471a3 0%, #1a5276 100%)',
              border: '2px solid #5dade2',
              borderRadius: '6px',
              color: '#f5e6d3',
              cursor: 'pointer',
            }}
          >
            {copySuccess ? 'Copied!' : 'Copy Log'}
          </button>
        )}

        <button
          onClick={() => setGameStarted(false)}
          style={{
            padding: '6px 16px',
            fontSize: '11px',
            fontFamily: '"Cinzel", serif',
            background: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)',
            border: '2px solid #6d5d47',
            borderRadius: '6px',
            color: '#a89070',
            cursor: 'pointer',
          }}
        >
          Menu
        </button>
      </div>
    </div>
  );
}
