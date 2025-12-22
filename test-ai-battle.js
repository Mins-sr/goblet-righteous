// AI Battle Test: Hard vs Ultra Hard
// This script simulates multiple games between Hard and Ultra Hard AI

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

const getValidMoves = (board, stacks, owner) => {
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
};

const applyMove = (board, stacks, move, owner) => {
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
};

const evaluateBoard = (board, owner) => {
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
};

const minimax = (board, stacks, depth, isMaximizing, owner, alpha, beta) => {
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
};

const getAIMove = (board, stacks, owner, difficulty) => {
  const moves = getValidMoves(board, stacks, owner);
  if (moves.length === 0) return null;

  // Check for winning move
  for (const move of moves) {
    const { newBoard } = applyMove(board, stacks, move, owner);
    if (checkWinner(newBoard) === owner) {
      return move;
    }
  }

  // Check for blocking opponent's winning move
  const opponent = owner === 'player' ? 'cpu' : 'player';
  const opponentMoves = getValidMoves(board, stacks, opponent);
  for (const opponentMove of opponentMoves) {
    const { newBoard: testBoard } = applyMove(board, stacks, opponentMove, opponent);
    if (checkWinner(testBoard) === opponent) {
      for (const move of moves) {
        if (move.toRow === opponentMove.toRow && move.toCol === opponentMove.toCol) {
          return move;
        }
      }
    }
  }

  if (difficulty === 'hard') {
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      const { newBoard, newStacks } = applyMove(board, stacks, move, owner);
      const score = minimax(newBoard, newStacks, 3, false, owner, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // Ultra Hard
  let bestMove = moves[0];
  let bestScore = -Infinity;
  const movesToEvaluate = Math.min(moves.length, 40);

  for (let i = 0; i < movesToEvaluate; i++) {
    const move = moves[i];
    const { newBoard, newStacks } = applyMove(board, stacks, move, owner);
    const score = minimax(newBoard, newStacks, 4, false, owner, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const playGame = (player1Difficulty, player2Difficulty, gameNum) => {
  let board = createEmptyBoard();
  let stacks = createInitialStacks();
  let currentTurn = 'player'; // player = Hard, cpu = Ultra Hard
  let moveCount = 0;
  const maxMoves = 100; // Prevent infinite games

  while (moveCount < maxMoves) {
    const move = currentTurn === 'player'
      ? getAIMove(board, stacks, 'player', player1Difficulty)
      : getAIMove(board, stacks, 'cpu', player2Difficulty);

    if (!move) {
      console.log(`  Game ${gameNum}: No valid moves available. Draw.`);
      return 'draw';
    }

    const result = applyMove(board, stacks, move, currentTurn);
    board = result.newBoard;
    stacks = result.newStacks;

    const winner = checkWinner(board);
    if (winner) {
      return winner;
    }

    currentTurn = currentTurn === 'player' ? 'cpu' : 'player';
    moveCount++;
  }

  console.log(`  Game ${gameNum}: Max moves reached. Draw.`);
  return 'draw';
};

// Run battle test
console.log('🎮 AI Battle Test: Hard vs Ultra Hard\n');
console.log('Player (Hard) plays first');
console.log('CPU (Ultra Hard) plays second\n');

const numGames = 10;
let hardWins = 0;
let ultraHardWins = 0;
let draws = 0;

console.log(`Running ${numGames} games...\n`);

for (let i = 0; i < numGames; i++) {
  const result = playGame('hard', 'ultrahard', i + 1);

  if (result === 'player') {
    hardWins++;
    console.log(`  Game ${i + 1}: Hard wins`);
  } else if (result === 'cpu') {
    ultraHardWins++;
    console.log(`  Game ${i + 1}: Ultra Hard wins ✓`);
  } else {
    draws++;
    console.log(`  Game ${i + 1}: Draw`);
  }
}

console.log('\n' + '='.repeat(50));
console.log('📊 Results:');
console.log('='.repeat(50));
console.log(`Hard wins:       ${hardWins}/${numGames} (${(hardWins/numGames*100).toFixed(1)}%)`);
console.log(`Ultra Hard wins: ${ultraHardWins}/${numGames} (${(ultraHardWins/numGames*100).toFixed(1)}%)`);
console.log(`Draws:           ${draws}/${numGames} (${(draws/numGames*100).toFixed(1)}%)`);
console.log('='.repeat(50));

if (ultraHardWins > hardWins) {
  console.log('\n✅ ACCEPTANCE TEST PASSED: Ultra Hard wins more games than Hard');
  process.exit(0);
} else if (ultraHardWins === hardWins) {
  console.log('\n⚠️  ACCEPTANCE TEST INCONCLUSIVE: Ultra Hard and Hard have equal wins');
  console.log('   Consider running more games or adjusting AI parameters');
  process.exit(1);
} else {
  console.log('\n❌ ACCEPTANCE TEST FAILED: Hard wins more games than Ultra Hard');
  console.log('   Ultra Hard AI needs improvement');
  process.exit(1);
}
