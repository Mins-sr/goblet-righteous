import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { getDinosaurComponent } from './DinosaurIcons';
import { useDeviceType, useOrientation, useViewportSize } from './hooks/useResponsive';
import LandscapeGameLayout from './components/LandscapeGameLayout.jsx';
import LandscapeTitleLayout from './components/LandscapeTitleLayout.jsx';
import {
  calculateFixedHeight,
  getMaxCellSize,
  ensureMinTouchSize,
  getStackBoxSizeFactor,
  HEADER_SPACING_OFFSET,
  TOP_SPACING_OFFSET,
  BOTTOM_SPACING_OFFSET,
  MESSAGE_SPACING_OFFSET,
} from './utils/calculations';

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
    ? { main: '#FF6B6B', belly: '#FFB3B3' }
    : { main: '#5DADE2', belly: '#AED6F1' };

  const DinoComponent = getDinosaurComponent(size);

  return (
    <div
      onClick={onClick}
      style={{
        width: `${baseSize}px`,
        height: `${baseSize}px`,
        cursor: isTop ? 'pointer' : 'default',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        zIndex: size,
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
        filter: isSelected ? 'drop-shadow(0 0 4px #f1c40f) drop-shadow(0 0 8px #f1c40f)' : 'drop-shadow(1px 2px 2px rgba(0,0,0,0.3))',
      }}
    >
      <DinoComponent mainColor={colors.main} bellyColor={colors.belly} size={baseSize} />
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
      {cell.length > 0 && (
        <Piece
          size={cell[cell.length - 1].size}
          owner={cell[cell.length - 1].owner}
          isTop={true}
          cellSize={cellSize}
        />
      )}
    </div>
  );
};

const StackArea = ({ stacks, owner, onStackClick, selectedPiece, isPlayerTurn, label, cellSize, deviceType }) => {
  const stackBoxSize = cellSize * getStackBoxSizeFactor(deviceType);

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
            data-testid="stack-box"
            onClick={() => owner === 'player' && isPlayerTurn && stack.length > 0 && onStackClick(stackIndex)}
            style={{
              width: `${stackBoxSize}px`,
              height: `${stackBoxSize}px`,
              minWidth: '44px',
              minHeight: '44px',
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

// デフォルトのスペーシング設定
const DEFAULT_SPACING = {
  headerSpacing: 7,  // Header↔CPU間調整値 (-6〜20px) → デフォルト13px
  topSpacing: 13,    // CPU↔Board間調整値 (-10〜30px) → デフォルト23px
  bottomSpacing: 2,  // Board↔YOU間調整値 (-20〜20px) → デフォルト22px
  messageSpacing: 15, // YOU↔Message間調整値 (-6〜30px) → デフォルト21px
};

// LocalStorageキー
const SPACING_STORAGE_KEY = 'gobblet-spacing-options';

// LocalStorageからスペーシング設定を読み込む
const loadSpacingOptions = () => {
  try {
    const saved = localStorage.getItem(SPACING_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SPACING, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load spacing options:', e);
  }
  return DEFAULT_SPACING;
};

// LocalStorageにスペーシング設定を保存
const saveSpacingOptions = (options) => {
  try {
    localStorage.setItem(SPACING_STORAGE_KEY, JSON.stringify(options));
  } catch (e) {
    console.error('Failed to save spacing options:', e);
  }
};

export default function Gobblet() {
  // レスポンシブデザイン用フック
  const deviceType = useDeviceType();
  const orientation = useOrientation();
  const viewportSize = useViewportSize();

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
  const [showOptions, setShowOptions] = useState(false);
  const [spacingOptions, setSpacingOptions] = useState(loadSpacingOptions);

  // CSS変数--vhの設定（モバイルブラウザのビューポート高さ問題対策）
  useEffect(() => {
    const setVhVariable = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhVariable();
    window.addEventListener('resize', setVhVariable);

    return () => {
      window.removeEventListener('resize', setVhVariable);
    };
  }, []);

  // Task 6.1: fixedElementsHeightをuseMemoでメモ化
  const fixedElementsHeight = useMemo(() => {
    return calculateFixedHeight(
      deviceType,
      orientation,
      spacingOptions
    );
  }, [deviceType, orientation, spacingOptions]);

  // Task 6.1: cellSize計算をuseMemoでメモ化
  const calculatedCellSize = useMemo(() => {
    const vh = viewportSize.height;
    const vw = viewportSize.width;

    const availableHeight = vh - fixedElementsHeight;
    const maxCellFromHeight = Math.floor((availableHeight - 37) / 4);

    const availableWidth = vw - 16;
    const maxCellFromWidth = Math.floor((availableWidth - 37) / 4);

    // デバイスタイプに応じた最大cellSizeを取得
    const maxCellSizeForDevice = getMaxCellSize(deviceType);

    const calculatedSize = Math.min(
      Math.min(maxCellFromHeight, maxCellFromWidth),
      maxCellSizeForDevice
    );

    // 44pxの最小タッチターゲットサイズを保証
    return ensureMinTouchSize(calculatedSize, 44);
  }, [viewportSize, fixedElementsHeight, deviceType]);

  // calculatedCellSizeをcellSize stateに同期
  useEffect(() => {
    setCellSize(calculatedCellSize);
  }, [calculatedCellSize]);

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

  const updateSpacingOption = (key, value) => {
    const newOptions = { ...spacingOptions, [key]: value };
    setSpacingOptions(newOptions);
    saveSpacingOptions(newOptions);
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

  const wouldAbandonDefense = useCallback((currentBoard, move) => {
    // Only check when moving a piece from the board (not from stack)
    if (move.type !== 'board') return false;

    const fromCell = currentBoard[move.fromRow][move.fromCol];
    if (fromCell.length <= 1) return false;

    const hiddenPieces = fromCell.slice(0, -1);
    const hasPlayerPieceUnderneath = hiddenPieces.some(p => p.owner === 'player');

    if (!hasPlayerPieceUnderneath) return false;

    // Simulate revealing the hidden piece
    const boardAfterReveal = currentBoard.map(row => row.map(cell => [...cell]));
    boardAfterReveal[move.fromRow][move.fromCol] = [...fromCell.slice(0, -1)];

    // Check if revealing creates an immediate win for player
    return checkWinner(boardAfterReveal) === 'player';
  }, []);

  const isSafeMove = useCallback((currentBoard, currentStacks, cpuMove) => {
    const { newBoard: boardAfterCpu, newStacks: stacksAfterCpu } = applyMove(currentBoard, currentStacks, cpuMove, 'cpu');

    // If this move wins the game, it's always safe
    if (checkWinner(boardAfterCpu) === 'cpu') return true;

    // CRITICAL: Block moves that abandon defensive positions and cause immediate loss
    if (wouldAbandonDefense(currentBoard, cpuMove)) {
      return false;
    }

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
  }, [applyMove, getValidMoves, countPlayerThreats, wouldAbandonDefense]);

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

  const findSafeBlockMove = useCallback((currentBoard, currentStacks, cpuMoves, targetRow, targetCol) => {
    const blockMoves = cpuMoves.filter(m => m.toRow === targetRow && m.toCol === targetCol);
    if (blockMoves.length === 0) return null;

    // サイズ降順でソート（大きいコマ優先）
    blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);

    for (const blockMove of blockMoves) {
      const { newBoard, newStacks } = applyMove(currentBoard, currentStacks, blockMove, 'cpu');

      // ブロック後、プレイヤーがそのマスを覆い被せて勝てるかチェック
      const playerMovesAfter = getValidMoves(newBoard, newStacks, 'player');
      let canBeCovered = false;

      for (const playerMove of playerMovesAfter) {
        if (playerMove.toRow === targetRow && playerMove.toCol === targetCol) {
          const { newBoard: boardAfterPlayer } = applyMove(newBoard, newStacks, playerMove, 'player');
          if (checkWinner(boardAfterPlayer) === 'player') {
            canBeCovered = true;
            break;
          }
        }
      }

      if (!canBeCovered) {
        return blockMove;
      }
    }

    return null;
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
        if (difficulty === 'hard' || difficulty === 'ultrahard') {
          // ハード以上: 覆い被せられない安全なブロック手を探す
          const safeBlock = findSafeBlockMove(board, stacks, moves, playerMove.toRow, playerMove.toCol);
          if (safeBlock) {
            return safeBlock;
          }
          // 安全なブロック手がない場合でも、最大サイズの駒でブロック（ブロックしないより良い）
          const blockMoves = moves.filter(m => m.toRow === playerMove.toRow && m.toCol === playerMove.toCol);
          if (blockMoves.length > 0) {
            blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);
            return blockMoves[0];
          }
        } else {
          // ノーマル: 最大サイズのコマでブロック
          const blockMoves = moves.filter(m => m.toRow === playerMove.toRow && m.toCol === playerMove.toCol);
          if (blockMoves.length > 0) {
            blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);
            return blockMoves[0];
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
  }, [board, stacks, difficulty, getValidMoves, applyMove, evaluateBoard, minimax, countPlayerThreats, isSafeMove, allowsImmediateWin, findSafeBlockMove]);

  useEffect(() => {
    if (currentTurn === 'cpu' && !winner && gameStarted) {
      setMessage('CPU thinking...');
      const delay = 800;
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

  // オプション画面
  if (showOptions) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: '"Cinzel", Georgia, serif',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
        boxSizing: 'border-box',
        overflow: 'auto',
        position: 'relative',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

        <h2 style={{
          fontSize: 'clamp(20px, 6vw, 32px)',
          color: '#d4a574',
          textShadow: '0 4px 8px rgba(0,0,0,0.5)',
          marginTop: '8px',
          marginBottom: '12px',
          letterSpacing: '4px',
        }}>
          OPTIONS
        </h2>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '100%',
          maxWidth: deviceType === 'mobile' ? '300px' : '500px',
          background: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          border: '2px solid #6d5d47',
        }}>
          {/* Header↔CPU間スペース設定 */}
          <div>
            <label style={{
              display: 'block',
              color: '#d4a574',
              fontSize: '13px',
              marginBottom: '8px',
              letterSpacing: '1px',
            }}>
              Header↔CPU Spacing
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min={-HEADER_SPACING_OFFSET}
                max="20"
                value={spacingOptions.headerSpacing}
                onChange={(e) => updateSpacingOption('headerSpacing', parseInt(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#d4a574',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              />
              <span style={{
                color: '#f5e6d3',
                fontSize: '12px',
                minWidth: '36px',
                textAlign: 'right',
              }}>
                {spacingOptions.headerSpacing + HEADER_SPACING_OFFSET}px
              </span>
            </div>
          </div>

          {/* CPU↔Board間スペース設定 */}
          <div>
            <label style={{
              display: 'block',
              color: '#d4a574',
              fontSize: '13px',
              marginBottom: '8px',
              letterSpacing: '1px',
            }}>
              Top Spacing (CPU↔Board)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min={-TOP_SPACING_OFFSET}
                max="30"
                value={spacingOptions.topSpacing}
                onChange={(e) => updateSpacingOption('topSpacing', parseInt(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#d4a574',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              />
              <span style={{
                color: '#f5e6d3',
                fontSize: '12px',
                minWidth: '36px',
                textAlign: 'right',
              }}>
                {spacingOptions.topSpacing + TOP_SPACING_OFFSET}px
              </span>
            </div>
          </div>

          {/* 下部スペース設定 */}
          <div>
            <label style={{
              display: 'block',
              color: '#d4a574',
              fontSize: '13px',
              marginBottom: '8px',
              letterSpacing: '1px',
            }}>
              Bottom Spacing (Board↔YOU)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min={-BOTTOM_SPACING_OFFSET}
                max="20"
                value={spacingOptions.bottomSpacing}
                onChange={(e) => updateSpacingOption('bottomSpacing', parseInt(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#d4a574',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              />
              <span style={{
                color: '#f5e6d3',
                fontSize: '12px',
                minWidth: '36px',
                textAlign: 'right',
              }}>
                {spacingOptions.bottomSpacing + BOTTOM_SPACING_OFFSET}px
              </span>
            </div>
          </div>

          {/* メッセージスペース設定 */}
          <div>
            <label style={{
              display: 'block',
              color: '#d4a574',
              fontSize: '13px',
              marginBottom: '8px',
              letterSpacing: '1px',
            }}>
              Message Spacing (YOU↔Message)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min={-MESSAGE_SPACING_OFFSET}
                max="30"
                value={spacingOptions.messageSpacing}
                onChange={(e) => updateSpacingOption('messageSpacing', parseInt(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: '#d4a574',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              />
              <span style={{
                color: '#f5e6d3',
                fontSize: '12px',
                minWidth: '36px',
                textAlign: 'right',
              }}>
                {spacingOptions.messageSpacing + MESSAGE_SPACING_OFFSET}px
              </span>
            </div>
          </div>

          {/* プレビュー表示 */}
          <div style={{
            marginTop: '8px',
            padding: '12px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '8px',
          }}>
            <div style={{
              color: '#a89070',
              fontSize: '10px',
              marginBottom: '8px',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Preview
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}>
              <div style={{
                width: '60px',
                height: '12px',
                background: '#d4a574',
                borderRadius: '3px',
                fontSize: '7px',
                color: '#2c1810',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>Header</div>
              <div style={{
                height: `${Math.max((spacingOptions.headerSpacing + HEADER_SPACING_OFFSET) * (deviceType === 'mobile' ? 0.4 : deviceType === 'tablet' ? 0.6 : 0.7), 2)}px`,
                width: '2px',
                background: '#d4a574',
              }} />
              <div style={{
                width: '80px',
                height: '16px',
                background: '#5DADE2',
                borderRadius: '4px',
                fontSize: '8px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>CPU</div>
              <div style={{
                height: `${Math.max((spacingOptions.topSpacing + TOP_SPACING_OFFSET) * (deviceType === 'mobile' ? 0.4 : deviceType === 'tablet' ? 0.6 : 0.7), 2)}px`,
                width: '2px',
                background: '#d4a574',
              }} />
              <div style={{
                width: '60px',
                height: '40px',
                background: '#8b7355',
                borderRadius: '4px',
                fontSize: '8px',
                color: '#f5e6d3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>Board</div>
              <div style={{
                height: `${Math.max((spacingOptions.bottomSpacing + BOTTOM_SPACING_OFFSET) * (deviceType === 'mobile' ? 0.4 : deviceType === 'tablet' ? 0.6 : 0.7), 2)}px`,
                width: '2px',
                background: '#d4a574',
              }} />
              <div style={{
                width: '80px',
                height: '16px',
                background: '#FF6B6B',
                borderRadius: '4px',
                fontSize: '8px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>YOU</div>
              <div style={{
                height: `${Math.max((spacingOptions.messageSpacing + MESSAGE_SPACING_OFFSET) * (deviceType === 'mobile' ? 0.4 : deviceType === 'tablet' ? 0.6 : 0.7), 2)}px`,
                width: '2px',
                background: '#d4a574',
              }} />
              <div style={{
                width: '70px',
                height: '14px',
                background: '#5d4e37',
                borderRadius: '3px',
                fontSize: '7px',
                color: '#f5e6d3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>Message</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowOptions(false)}
          style={{
            marginTop: '12px',
            marginBottom: '8px',
            padding: '10px 28px',
            fontSize: '13px',
            fontFamily: '"Cinzel", serif',
            background: 'linear-gradient(180deg, #8b7355 0%, #6d5d47 100%)',
            border: '2px solid #a89070',
            borderRadius: '10px',
            color: '#f5e6d3',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          Back
        </button>

        <div style={{
          color: '#6d5d47',
          fontSize: '9px',
          fontFamily: 'monospace',
          opacity: 0.6,
          marginTop: '4px',
          marginBottom: '16px',
        }}>
          v1.9.0
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    // 横向きモードのタイトル画面 (Task 9.1 & 10.1: LandscapeTitleLayoutコンポーネント使用)
    // 640px以上の横向きでのみ横向きレイアウトを使用
    const isLandscape = orientation === 'landscape' && viewportSize.width >= 640;
    if (isLandscape) {
      return (
        <LandscapeTitleLayout
          onStartGame={startGame}
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          spacingOptions={spacingOptions}
          updateSpacingOption={updateSpacingOption}
          cellSize={cellSize}
          deviceType={deviceType}
          HEADER_SPACING_OFFSET={HEADER_SPACING_OFFSET}
          TOP_SPACING_OFFSET={TOP_SPACING_OFFSET}
          BOTTOM_SPACING_OFFSET={BOTTOM_SPACING_OFFSET}
          MESSAGE_SPACING_OFFSET={MESSAGE_SPACING_OFFSET}
        />
      );
    }

    // 縦向きモードのタイトル画面（既存）
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: '"Cinzel", Georgia, serif',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
        boxSizing: 'border-box',
        overflow: 'auto',
        position: 'relative',
        // Task 10.2: レイアウト切り替えトランジション（300ms、ちらつき防止）
        opacity: 1,
        transition: 'opacity 300ms ease-in-out',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

        <h1 style={{
          fontSize: deviceType === 'tablet' ? 'clamp(28px, 8vw, 57.6px)' : 'clamp(28px, 8vw, 48px)',
          color: '#d4a574',
          textShadow: '0 4px 8px rgba(0,0,0,0.5), 0 0 40px rgba(212,165,116,0.3)',
          marginTop: '16px',
          marginBottom: '8px',
          letterSpacing: '6px',
        }}>
          GOBBLET
        </h1>

        <p style={{
          color: '#a89070',
          fontSize: 'clamp(10px, 2.5vw, 14px)',
          marginTop: '0',
          marginBottom: '16px',
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
                fontSize: deviceType === 'tablet' ? '18px' : '15px',
                fontFamily: '"Cinzel", serif',
                background: 'linear-gradient(180deg, #8b7355 0%, #6d5d47 100%)',
                border: '2px solid #a89070',
                borderRadius: '10px',
                color: '#f5e6d3',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* オプションボタン */}
        <button
          onClick={() => setShowOptions(true)}
          style={{
            marginTop: '12px',
            marginBottom: '8px',
            padding: '10px 24px',
            fontSize: deviceType === 'tablet' ? '14.4px' : '12px',
            fontFamily: '"Cinzel", serif',
            background: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)',
            border: '2px solid #6d5d47',
            borderRadius: '8px',
            color: '#a89070',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          ⚙ Options
        </button>

        <div style={{
          color: '#6d5d47',
          fontSize: '9px',
          fontFamily: 'monospace',
          opacity: 0.6,
          marginTop: '4px',
          marginBottom: '16px',
        }}>
          v1.9.0
        </div>
      </div>
    );
  }

  const boardSize = cellSize * 4 + 6 * 3;

  // 横向きモードのレイアウト (Task 8.1 & 10.1: LandscapeGameLayoutコンポーネント使用)
  // 640px以上の横向きでのみ横向きレイアウトを使用
  const isLandscape = orientation === 'landscape' && viewportSize.width >= 640;
  if (isLandscape) {
    return (
      <LandscapeGameLayout
        board={board}
        stacks={stacks}
        cellSize={cellSize}
        selectedPiece={selectedPiece}
        currentTurn={currentTurn}
        message={message}
        onCellClick={handleCellClick}
        onStackClick={handleStackClick}
        handleBoardPieceClick={handleBoardPieceClick}
        resetGame={resetGame}
        copyGameLog={copyGameLog}
        canPlaceAt={canPlaceAt}
        winner={winner}
        copySuccess={copySuccess}
        difficulty={difficulty}
        BoardCell={BoardCell}
        StackArea={StackArea}
        setGameStarted={setGameStarted}
        deviceType={deviceType}
      />
    );
  }

  // 縦向きモード（既存のレイアウト）
  return (
    <div style={{
      height: 'calc(var(--vh, 1vh) * 100)',
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 'max(8px, env(safe-area-inset-top))',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      paddingLeft: 'max(8px, env(safe-area-inset-left))',
      paddingRight: 'max(8px, env(safe-area-inset-right))',
      fontFamily: '"Cinzel", Georgia, serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
      // Task 10.2: レイアウト切り替えトランジション（300ms、ちらつき防止）
      opacity: 1,
      transition: 'opacity 300ms ease-in-out',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: `${boardSize + 40}px`,
        marginBottom: `${spacingOptions.headerSpacing + HEADER_SPACING_OFFSET}px`,
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
            v1.9.0
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
          deviceType={deviceType}
        />
      </div>

      {/* 上部スペーサー (CPU↔Board) */}
      {(spacingOptions.topSpacing + TOP_SPACING_OFFSET) > 0 && (
        <div style={{ flex: 'none', height: `${spacingOptions.topSpacing + TOP_SPACING_OFFSET}px` }} />
      )}

      <div style={{ flex: 'none' }}>
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

      {/* 下部スペーサー (Board↔YOU) */}
      {(spacingOptions.bottomSpacing + BOTTOM_SPACING_OFFSET) > 0 && (
        <div style={{ flex: 'none', height: `${spacingOptions.bottomSpacing + BOTTOM_SPACING_OFFSET}px` }} />
      )}

      <div style={{ flex: 'none' }}>
        <StackArea
          stacks={stacks.player}
          owner="player"
          onStackClick={handleStackClick}
          selectedPiece={selectedPiece}
          isPlayerTurn={currentTurn === 'player'}
          label="YOU"
          cellSize={cellSize}
          deviceType={deviceType}
        />
      </div>

      {/* スペーサー (YOU↔Message) */}
      {(spacingOptions.messageSpacing + MESSAGE_SPACING_OFFSET) > 0 && (
        <div style={{ flex: 'none', height: `${spacingOptions.messageSpacing + MESSAGE_SPACING_OFFSET}px` }} />
      )}

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
          fontSize: deviceType === 'tablet' ? '13.2px' : '11px',
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
        marginTop: '6px',
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
            minHeight: '44px',
            minWidth: '44px',
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
              minHeight: '44px',
              minWidth: '44px',
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
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          Menu
        </button>
      </div>
    </div>
  );
}
