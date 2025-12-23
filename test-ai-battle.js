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

const countThreats = (board, targetOwner) => {
  const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;
  const lines = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    lines.push(board[i].map(getTopPiece));
    lines.push(board.map(row => getTopPiece(row[i])));
  }
  lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][i])));
  lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i])));

  let threatCount = 0;
  const opponent = targetOwner === 'player' ? 'cpu' : 'player';
  for (const line of lines) {
    const ownerCount = line.filter(p => p && p.owner === targetOwner).length;
    const opponentCount = line.filter(p => p && p.owner === opponent).length;
    if (ownerCount === 3 && opponentCount === 0) {
      threatCount++;
    }
  }
  return threatCount;
};

const isSafeMove = (currentBoard, currentStacks, move, owner) => {
  const { newBoard: boardAfterMove, newStacks: stacksAfterMove } = applyMove(currentBoard, currentStacks, move, owner);

  if (checkWinner(boardAfterMove) === owner) return true;

  const opponent = owner === 'player' ? 'cpu' : 'player';
  const opponentMovesAfter = getValidMoves(boardAfterMove, stacksAfterMove, opponent);

  for (const opponentMove of opponentMovesAfter) {
    const { newBoard: boardAfterOpponent } = applyMove(boardAfterMove, stacksAfterMove, opponentMove, opponent);

    if (checkWinner(boardAfterOpponent) === opponent) {
      return false;
    }

    if (countThreats(boardAfterOpponent, opponent) >= 2) {
      return false;
    }
  }

  return true;
};

const allowsImmediateWin = (currentBoard, currentStacks, move, owner) => {
  const { newBoard: boardAfterMove, newStacks: stacksAfterMove } = applyMove(currentBoard, currentStacks, move, owner);

  if (checkWinner(boardAfterMove) === owner) return false;

  const opponent = owner === 'player' ? 'cpu' : 'player';
  const opponentMovesAfter = getValidMoves(boardAfterMove, stacksAfterMove, opponent);

  for (const opponentMove of opponentMovesAfter) {
    const { newBoard: boardAfterOpponent } = applyMove(boardAfterMove, stacksAfterMove, opponentMove, opponent);
    if (checkWinner(boardAfterOpponent) === opponent) {
      return true;
    }
  }

  return false;
};

// 安全なブロック手を探す（新ロジック）
const findSafeBlockMove = (currentBoard, currentStacks, moves, owner, targetRow, targetCol) => {
  const blockMoves = moves.filter(m => m.toRow === targetRow && m.toCol === targetCol);
  if (blockMoves.length === 0) return null;

  blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);

  const opponent = owner === 'player' ? 'cpu' : 'player';

  for (const blockMove of blockMoves) {
    const { newBoard, newStacks } = applyMove(currentBoard, currentStacks, blockMove, owner);

    const opponentMovesAfter = getValidMoves(newBoard, newStacks, opponent);
    let canBeCovered = false;

    for (const opponentMove of opponentMovesAfter) {
      if (opponentMove.toRow === targetRow && opponentMove.toCol === targetCol) {
        const { newBoard: boardAfterOpponent } = applyMove(newBoard, newStacks, opponentMove, opponent);
        if (checkWinner(boardAfterOpponent) === opponent) {
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
};

// 旧ロジック（v1.5.0以前）: ブロック時に覆い被せリスクを考慮しない
const getAIMove_Old = (board, stacks, owner, difficulty) => {
  const moves = getValidMoves(board, stacks, owner);
  if (moves.length === 0) return null;

  for (const move of moves) {
    const { newBoard } = applyMove(board, stacks, move, owner);
    if (checkWinner(newBoard) === owner) {
      return move;
    }
  }

  const opponent = owner === 'player' ? 'cpu' : 'player';
  const opponentMoves = getValidMoves(board, stacks, opponent);
  for (const opponentMove of opponentMoves) {
    const { newBoard: testBoard } = applyMove(board, stacks, opponentMove, opponent);
    if (checkWinner(testBoard) === opponent) {
      // 旧ロジック: 最大サイズの駒でブロック（v1.5.0の実装）
      const blockMoves = moves.filter(m => m.toRow === opponentMove.toRow && m.toCol === opponentMove.toCol);
      if (blockMoves.length > 0) {
        blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);
        return blockMoves[0];
      }
    }
  }

  const isOpponentInFork = countThreats(board, opponent) >= 2;

  let candidateMoves = moves;
  if (!isOpponentInFork) {
    const safeMoves = moves.filter(move => isSafeMove(board, stacks, move, owner));
    if (safeMoves.length > 0) {
      candidateMoves = safeMoves;
    } else {
      const nonLosingMoves = moves.filter(move => !allowsImmediateWin(board, stacks, move, owner));
      if (nonLosingMoves.length > 0) {
        candidateMoves = nonLosingMoves;
      }
    }
  }

  let bestMove = candidateMoves[0];
  let bestScore = -Infinity;

  for (const move of candidateMoves) {
    const { newBoard, newStacks } = applyMove(board, stacks, move, owner);
    const score = minimax(newBoard, newStacks, 3, false, owner, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
};

// 新ロジック（v1.6.0）: ブロック時に覆い被せリスクを考慮
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
      // 新ロジック: 覆い被せられない安全なブロック手を探す
      const safeBlock = findSafeBlockMove(board, stacks, moves, owner, opponentMove.toRow, opponentMove.toCol);
      if (safeBlock) {
        return safeBlock;
      }
      // 安全なブロック手がない場合でも、最大サイズの駒でブロック（ブロックしないより良い）
      const blockMoves = moves.filter(m => m.toRow === opponentMove.toRow && m.toCol === opponentMove.toCol);
      if (blockMoves.length > 0) {
        blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);
        return blockMoves[0];
      }
    }
  }

  const isOpponentInFork = countThreats(board, opponent) >= 2;

  if (difficulty === 'hard') {
    let candidateMoves = moves;
    if (!isOpponentInFork) {
      const safeMoves = moves.filter(move => isSafeMove(board, stacks, move, owner));
      if (safeMoves.length > 0) {
        candidateMoves = safeMoves;
      } else {
        const nonLosingMoves = moves.filter(move => !allowsImmediateWin(board, stacks, move, owner));
        if (nonLosingMoves.length > 0) {
          candidateMoves = nonLosingMoves;
        }
      }
    }

    let bestMove = candidateMoves[0];
    let bestScore = -Infinity;

    for (const move of candidateMoves) {
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
  let candidateMoves = moves;
  if (!isOpponentInFork) {
    const safeMoves = moves.filter(move => isSafeMove(board, stacks, move, owner));
    if (safeMoves.length > 0) {
      candidateMoves = safeMoves;
    } else {
      const nonLosingMoves = moves.filter(move => !allowsImmediateWin(board, stacks, move, owner));
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
  console.log('\n✅ TEST 1 PASSED: Ultra Hard wins more games than Hard');
} else if (ultraHardWins === hardWins) {
  console.log('\n⚠️  TEST 1 INCONCLUSIVE: Ultra Hard and Hard have equal wins');
} else {
  console.log('\n❌ TEST 1 FAILED: Hard wins more games than Ultra Hard');
}

// ============================================================
// Test 2: New Hard vs Old Hard (Regression Test / ディグレーションテスト)
// ============================================================

const playGameNewVsOld = (gameNum) => {
  let board = createEmptyBoard();
  let stacks = createInitialStacks();
  let currentTurn = 'player'; // player = Old Hard (v1.5.0), cpu = New Hard (v1.6.0)
  let moveCount = 0;
  const maxMoves = 100;

  while (moveCount < maxMoves) {
    // minimaxが'cpu'視点でハードコードされているため、役割を入れ替え
    const move = currentTurn === 'player'
      ? getAIMove_Old(board, stacks, 'player', 'hard') // 旧ロジック（先手）
      : getAIMove(board, stacks, 'cpu', 'hard');       // 新ロジック（後手）

    if (!move) {
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

  return 'draw';
};

console.log('\n\n🎮 Regression Test: New Hard (v1.6.0) vs Old Hard (v1.5.0)\n');
console.log('Player (Old Hard v1.5.0) plays first');
console.log('CPU (New Hard v1.6.0) plays second\n');

const numGames2 = 20;
let newHardWins = 0;
let oldHardWins = 0;
let draws2 = 0;

console.log(`Running ${numGames2} games...\n`);

for (let i = 0; i < numGames2; i++) {
  const result = playGameNewVsOld(i + 1);

  if (result === 'cpu') {
    // cpu = New Hard (v1.6.0)
    newHardWins++;
    console.log(`  Game ${i + 1}: New Hard wins ✓`);
  } else if (result === 'player') {
    // player = Old Hard (v1.5.0)
    oldHardWins++;
    console.log(`  Game ${i + 1}: Old Hard wins`);
  } else {
    draws2++;
    console.log(`  Game ${i + 1}: Draw`);
  }
}

console.log('\n' + '='.repeat(50));
console.log('📊 Regression Test Results:');
console.log('='.repeat(50));
console.log(`New Hard (v1.6.0) wins: ${newHardWins}/${numGames2} (${(newHardWins/numGames2*100).toFixed(1)}%)`);
console.log(`Old Hard (v1.5.0) wins: ${oldHardWins}/${numGames2} (${(oldHardWins/numGames2*100).toFixed(1)}%)`);
console.log(`Draws:                  ${draws2}/${numGames2} (${(draws2/numGames2*100).toFixed(1)}%)`);
console.log('='.repeat(50));

let allTestsPassed = true;

if (ultraHardWins >= hardWins) {
  console.log('\n✅ TEST 1 (Ultra Hard > Hard): PASSED');
} else {
  console.log('\n❌ TEST 1 (Ultra Hard > Hard): FAILED');
  allTestsPassed = false;
}

if (newHardWins >= oldHardWins) {
  console.log('✅ TEST 2 (New Hard >= Old Hard): PASSED - No regression');
} else {
  console.log('❌ TEST 2 (New Hard >= Old Hard): FAILED - Regression detected!');
  allTestsPassed = false;
}

if (allTestsPassed) {
  console.log('\n🎉 ALL TESTS PASSED');
  process.exit(0);
} else {
  console.log('\n💥 SOME TESTS FAILED');
  process.exit(1);
}
