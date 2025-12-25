// Acceptance Test: Old Hard AI vs New Hard AI
// Testing the defensive post abandonment check improvement

const BOARD_SIZE = 4;
const PIECE_SIZES = [1, 2, 3, 4];
const STACKS_PER_PLAYER = 3;

const createInitialStacks = () => {
  return {
    player1: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES]),
    player2: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES])
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
    player1: stacks.player1.map(s => [...s]),
    player2: stacks.player2.map(s => [...s])
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
  const opponent = owner === 'player1' ? 'player2' : 'player1';
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

  if (ownerThreeCount >= 2) score += 300;
  if (opponentThreeCount >= 2) score -= 400;

  const centerCells = [[1,1], [1,2], [2,1], [2,2]];
  for (const [row, col] of centerCells) {
    const piece = getTopPiece(board[row][col]);
    if (piece) {
      if (piece.owner === owner) score += 20;
      else score -= 18;
    }
  }

  const cornerCells = [[0,0], [0,3], [3,0], [3,3]];
  for (const [row, col] of cornerCells) {
    const piece = getTopPiece(board[row][col]);
    if (piece) {
      if (piece.owner === owner) score += 15;
      else score -= 13;
    }
  }

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

const countPlayerThreats = (board, owner) => {
  const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;
  const lines = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    lines.push(board[i].map(getTopPiece));
    lines.push(board.map(row => getTopPiece(row[i])));
  }
  lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][i])));
  lines.push([0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i])));

  let threatCount = 0;
  const opponent = owner === 'player1' ? 'player2' : 'player1';

  for (const line of lines) {
    const opponentPieces = line.filter(p => p && p.owner === opponent).length;
    const ownerPieces = line.filter(p => p && p.owner === owner).length;
    if (opponentPieces === 3 && ownerPieces === 0) {
      threatCount++;
    }
  }
  return threatCount;
};

const minimax = (board, stacks, depth, isMaximizing, owner, alpha, beta) => {
  const currentWinner = checkWinner(board);
  if (currentWinner === owner) return 10000 - depth;
  const opponent = owner === 'player1' ? 'player2' : 'player1';
  if (currentWinner === opponent) return -10000 + depth;
  if (depth === 0) return evaluateBoard(board, owner);

  const currentOwner = isMaximizing ? owner : opponent;
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

// NEW VERSION: With defensive post abandonment check
const wouldAbandonDefense = (currentBoard, move, owner) => {
  if (move.type !== 'board') return false;

  const fromCell = currentBoard[move.fromRow][move.fromCol];
  if (fromCell.length <= 1) return false;

  const hiddenPieces = fromCell.slice(0, -1);
  const opponent = owner === 'player1' ? 'player2' : 'player1';
  const hasOpponentPieceUnderneath = hiddenPieces.some(p => p.owner === opponent);

  if (!hasOpponentPieceUnderneath) return false;

  const boardAfterReveal = currentBoard.map(row => row.map(cell => [...cell]));
  boardAfterReveal[move.fromRow][move.fromCol] = [...fromCell.slice(0, -1)];

  const winner = checkWinner(boardAfterReveal);
  return winner === opponent;
};

const isSafeMoveNew = (currentBoard, currentStacks, move, owner) => {
  const { newBoard: boardAfterMove, newStacks: stacksAfterMove } = applyMove(currentBoard, currentStacks, move, owner);

  // If this move wins the game, it's always safe (winning overrides all other concerns)
  if (checkWinner(boardAfterMove) === owner) return true;

  // NEW: Check defensive abandonment (only after checking for win)
  if (wouldAbandonDefense(currentBoard, move, owner)) {
    return false;
  }

  const opponent = owner === 'player1' ? 'player2' : 'player1';
  const opponentMovesAfter = getValidMoves(boardAfterMove, stacksAfterMove, opponent);

  for (const opponentMove of opponentMovesAfter) {
    const { newBoard: boardAfterOpponent } = applyMove(boardAfterMove, stacksAfterMove, opponentMove, opponent);

    if (checkWinner(boardAfterOpponent) === opponent) {
      return false;
    }

    if (countPlayerThreats(boardAfterOpponent, owner) >= 2) {
      return false;
    }
  }

  return true;
};

// OLD VERSION: Without defensive post abandonment check
const isSafeMoveOld = (currentBoard, currentStacks, move, owner) => {
  // OLD: No defensive abandonment check

  const { newBoard: boardAfterMove, newStacks: stacksAfterMove } = applyMove(currentBoard, currentStacks, move, owner);

  if (checkWinner(boardAfterMove) === owner) return true;

  const opponent = owner === 'player1' ? 'player2' : 'player1';
  const opponentMovesAfter = getValidMoves(boardAfterMove, stacksAfterMove, opponent);

  for (const opponentMove of opponentMovesAfter) {
    const { newBoard: boardAfterOpponent } = applyMove(boardAfterMove, stacksAfterMove, opponentMove, opponent);

    if (checkWinner(boardAfterOpponent) === opponent) {
      return false;
    }

    if (countPlayerThreats(boardAfterOpponent, owner) >= 2) {
      return false;
    }
  }

  return true;
};

const findSafeBlockMove = (currentBoard, currentStacks, moves, targetRow, targetCol, owner, isSafeMoveFn) => {
  const blockMoves = moves.filter(m => m.toRow === targetRow && m.toCol === targetCol);
  if (blockMoves.length === 0) return null;

  blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);

  for (const blockMove of blockMoves) {
    const { newBoard, newStacks } = applyMove(currentBoard, currentStacks, blockMove, owner);

    const opponent = owner === 'player1' ? 'player2' : 'player1';
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

const getAIMove = (board, stacks, owner, useNewVersion) => {
  const moves = getValidMoves(board, stacks, owner);
  if (moves.length === 0) return null;

  const isSafeMoveFn = useNewVersion ? isSafeMoveNew : isSafeMoveOld;

  // Check for winning move
  for (const move of moves) {
    const { newBoard } = applyMove(board, stacks, move, owner);
    if (checkWinner(newBoard) === owner) {
      return move;
    }
  }

  // Check for blocking move
  const opponent = owner === 'player1' ? 'player2' : 'player1';
  const opponentMoves = getValidMoves(board, stacks, opponent);
  for (const opponentMove of opponentMoves) {
    const { newBoard: testBoard } = applyMove(board, stacks, opponentMove, opponent);
    if (checkWinner(testBoard) === opponent) {
      const safeBlock = findSafeBlockMove(board, stacks, moves, opponentMove.toRow, opponentMove.toCol, owner, isSafeMoveFn);
      if (safeBlock) {
        return safeBlock;
      }
      const blockMoves = moves.filter(m => m.toRow === opponentMove.toRow && m.toCol === opponentMove.toCol);
      if (blockMoves.length > 0) {
        blockMoves.sort((a, b) => b.pieceSize - a.pieceSize);
        return blockMoves[0];
      }
    }
  }

  // Filter safe moves
  const isPlayerInFork = countPlayerThreats(board, owner) >= 2;
  let candidateMoves = moves;

  if (!isPlayerInFork) {
    const safeMoves = moves.filter(move => isSafeMoveFn(board, stacks, move, owner));
    if (safeMoves.length > 0) {
      candidateMoves = safeMoves;
    }
  }

  // Minimax search
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

const playGame = (player1UsesNew, player2UsesNew, verbose = false) => {
  let board = createEmptyBoard();
  let stacks = createInitialStacks();
  let currentPlayer = 'player1';
  let moveCount = 0;
  const maxMoves = 100;

  while (moveCount < maxMoves) {
    const useNewVersion = currentPlayer === 'player1' ? player1UsesNew : player2UsesNew;
    const move = getAIMove(board, stacks, currentPlayer, useNewVersion);

    if (!move) {
      if (verbose) console.log('No valid moves available');
      return 'draw';
    }

    const result = applyMove(board, stacks, move, currentPlayer);
    board = result.newBoard;
    stacks = result.newStacks;

    const winner = checkWinner(board);
    if (winner) {
      if (verbose) console.log(`Winner: ${winner} after ${moveCount + 1} moves`);
      return winner;
    }

    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    moveCount++;
  }

  if (verbose) console.log('Draw: Max moves reached');
  return 'draw';
};

// Run acceptance tests
console.log('🧪 受け入れテスト: 旧Hard vs 新Hard');
console.log('=' .repeat(60));
console.log('旧Hard: 防御拠点放棄チェックなし');
console.log('新Hard: 防御拠点放棄チェックあり');
console.log('=' .repeat(60));
console.log();

const NUM_GAMES = 50;
let newWins = 0;
let oldWins = 0;
let draws = 0;

console.log(`${NUM_GAMES}ゲーム実施中...`);
console.log();

for (let i = 0; i < NUM_GAMES; i++) {
  // Alternate who goes first to be fair
  const newGoesFirst = i % 2 === 0;
  const winner = playGame(newGoesFirst, !newGoesFirst, false);

  if (winner === 'player1') {
    if (newGoesFirst) {
      newWins++;
      console.log(`Game ${i + 1}: 新Hard勝利 (先攻)`);
    } else {
      oldWins++;
      console.log(`Game ${i + 1}: 旧Hard勝利 (先攻)`);
    }
  } else if (winner === 'player2') {
    if (newGoesFirst) {
      oldWins++;
      console.log(`Game ${i + 1}: 旧Hard勝利 (後攻)`);
    } else {
      newWins++;
      console.log(`Game ${i + 1}: 新Hard勝利 (後攻)`);
    }
  } else {
    draws++;
    console.log(`Game ${i + 1}: 引き分け`);
  }
}

console.log();
console.log('=' .repeat(60));
console.log('📊 最終結果');
console.log('=' .repeat(60));
console.log(`新Hard (防御拠点放棄チェックあり): ${newWins}勝`);
console.log(`旧Hard (防御拠点放棄チェックなし): ${oldWins}勝`);
console.log(`引き分け: ${draws}`);
console.log();

const newWinRate = (newWins / NUM_GAMES * 100).toFixed(1);
const oldWinRate = (oldWins / NUM_GAMES * 100).toFixed(1);

console.log(`新Hard勝率: ${newWinRate}%`);
console.log(`旧Hard勝率: ${oldWinRate}%`);
console.log();

if (newWins > oldWins) {
  const improvement = newWins - oldWins;
  console.log(`✅ 受け入れテスト合格！`);
  console.log(`   新Hardが${improvement}ゲーム多く勝利しました`);
  console.log(`   防御拠点放棄チェックの追加により、AIが強化されています`);
} else if (newWins === oldWins) {
  console.log(`⚠️  同等の結果`);
  console.log(`   両バージョンが同じ勝利数ですが、退化はありません`);
} else {
  console.log(`❌ 警告: 新バージョンが劣っています`);
  console.log(`   実装を見直す必要があります`);
}
console.log('=' .repeat(60));
