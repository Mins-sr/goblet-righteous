// getCpuMove のロジックをシミュレートして問題を特定

const BOARD_SIZE = 4;

// 完全な状態
const board = [
  [
    [{ size: 2, owner: 'cpu' }, { size: 4, owner: 'player' }],
    [{ size: 1, owner: 'player' }],
    [],
    [{ size: 2, owner: 'player' }]
  ],
  [
    [{ size: 4, owner: 'cpu' }],
    [{ size: 3, owner: 'player' }, { size: 3, owner: 'cpu' }],
    [],
    []
  ],
  [
    [{ size: 4, owner: 'player' }],
    [],
    [{ size: 1, owner: 'player' }, { size: 1, owner: 'cpu' }],
    []
  ],
  [
    [{ size: 2, owner: 'player' }],
    [{ size: 3, owner: 'player' }],
    [],
    []
  ]
];

const stacks = {
  player: [[], [], [1, 2, 3, 4]],
  cpu: [[], [1, 2, 3], [1, 2, 3, 4]]
};

const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;

const checkWinner = (board) => {
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

const countPlayerThreats = (board) => {
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
    if (playerCount === 3 && cpuCount === 0) threatCount++;
  }
  return threatCount;
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
            moves.push({ type: 'stack', stackIndex, pieceSize, toRow: row, toCol: col });
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
              moves.push({ type: 'board', fromRow: row, fromCol: col, pieceSize: piece.size, toRow, toCol });
            }
          }
        }
      }
    }
  }
  return moves;
};

const applyMove = (board, stacks, move, owner) => {
  const newBoard = board.map(row => row.map(cell => [...cell.map(p => ({ ...p }))]));
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
  const opponent = owner === 'cpu' ? 'player' : 'cpu';
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

  // Center control bonus
  [[1,1], [1,2], [2,1], [2,2]].forEach(([r, c]) => {
    const top = getTopPiece(board[r][c]);
    if (top) {
      score += top.owner === owner ? 20 : -20;
    }
  });

  // Corner bonus
  [[0,0], [0,3], [3,0], [3,3]].forEach(([r, c]) => {
    const top = getTopPiece(board[r][c]);
    if (top) {
      score += top.owner === owner ? 10 : -10;
    }
  });

  return score;
};

const isSafeMove = (currentBoard, currentStacks, cpuMove) => {
  const { newBoard: boardAfterCpu, newStacks: stacksAfterCpu } = applyMove(currentBoard, currentStacks, cpuMove, 'cpu');
  if (checkWinner(boardAfterCpu) === 'cpu') return true;

  const playerMovesAfter = getValidMoves(boardAfterCpu, stacksAfterCpu, 'player');
  for (const playerMove of playerMovesAfter) {
    const { newBoard: boardAfterPlayer } = applyMove(boardAfterCpu, stacksAfterCpu, playerMove, 'player');
    if (checkWinner(boardAfterPlayer) === 'player') return false;
    if (countPlayerThreats(boardAfterPlayer) >= 2) return false;
  }
  return true;
};

const allowsImmediateWin = (currentBoard, currentStacks, cpuMove) => {
  const { newBoard: boardAfterCpu, newStacks: stacksAfterCpu } = applyMove(currentBoard, currentStacks, cpuMove, 'cpu');
  if (checkWinner(boardAfterCpu) === 'cpu') return false;

  const playerMovesAfter = getValidMoves(boardAfterCpu, stacksAfterCpu, 'player');
  for (const playerMove of playerMovesAfter) {
    const { newBoard: boardAfterPlayer } = applyMove(boardAfterCpu, stacksAfterCpu, playerMove, 'player');
    if (checkWinner(boardAfterPlayer) === 'player') return true;
  }
  return false;
};

// Minimax with alpha-beta pruning (simplified version)
const minimax = (board, stacks, depth, isMaximizing, owner, alpha, beta) => {
  const currentWinner = checkWinner(board);
  if (currentWinner === 'cpu') return 10000 - depth;
  if (currentWinner === 'player') return -10000 + depth;
  if (depth === 0) return evaluateBoard(board, 'cpu');

  const currentOwner = isMaximizing ? 'cpu' : 'player';
  const moves = getValidMoves(board, stacks, currentOwner).slice(0, 20);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const { newBoard, newStacks } = applyMove(board, stacks, move, currentOwner);
      const evalScore = minimax(newBoard, newStacks, depth - 1, false, owner, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const { newBoard, newStacks } = applyMove(board, stacks, move, currentOwner);
      const evalScore = minimax(newBoard, newStacks, depth - 1, true, owner, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

const formatMove = (move) => {
  const colLabels = ['A', 'B', 'C', 'D'];
  const rowLabels = ['1', '2', '3', '4'];
  const to = colLabels[move.toCol] + rowLabels[move.toRow];
  if (move.type === 'stack') {
    return 'Stack[' + move.stackIndex + '](size ' + move.pieceSize + ') → ' + to;
  } else {
    const from = colLabels[move.fromCol] + rowLabels[move.fromRow];
    return from + '(size ' + move.pieceSize + ') → ' + to;
  }
};

console.log('='.repeat(80));
console.log('getCpuMove シミュレーション (Ultra Hard モード)');
console.log('='.repeat(80));

const difficulty = 'ultraHard';
const moves = getValidMoves(board, stacks, 'cpu');

console.log('\n[Step 1] 有効手数: ' + moves.length);

// CPUの即勝手をチェック
let winningMove = null;
for (const move of moves) {
  const { newBoard } = applyMove(board, stacks, move, 'cpu');
  if (checkWinner(newBoard) === 'cpu') {
    winningMove = move;
    break;
  }
}
console.log('[Step 2] CPU即勝手: ' + (winningMove ? formatMove(winningMove) : 'なし'));

// プレイヤーの脅威チェック
const isPlayerInFork = countPlayerThreats(board) >= 2;
console.log('[Step 3] isPlayerInFork: ' + isPlayerInFork);

if (!winningMove) {
  let candidateMoves = moves;

  if (!isPlayerInFork) {
    console.log('\n[Step 4] isSafeMoveでフィルタリング...');
    const safeMoves = moves.filter(move => isSafeMove(board, stacks, move));
    console.log('安全な手: ' + safeMoves.length + '件');
    safeMoves.forEach(m => console.log('  - ' + formatMove(m)));

    if (safeMoves.length > 0) {
      candidateMoves = safeMoves;
      console.log('\n→ 安全な手のみを候補に');
    } else {
      console.log('\n→ 安全な手がないため、全ての手を候補に');
      const nonLosingMoves = moves.filter(move => !allowsImmediateWin(board, stacks, move));
      console.log('非負け手: ' + nonLosingMoves.length + '件');
      if (nonLosingMoves.length > 0) {
        candidateMoves = nonLosingMoves;
      }
    }
  } else {
    console.log('\n[Step 4] プレイヤーがフォーク中のため、フィルタリングをスキップ');
  }

  console.log('\n[Step 5] Minimax評価（深さ4、最大40手）');
  let bestMove = candidateMoves[0];
  let bestScore = -Infinity;
  const movesToEvaluate = Math.min(candidateMoves.length, 40);

  const evaluatedMoves = [];
  for (let i = 0; i < movesToEvaluate; i++) {
    const move = candidateMoves[i];
    const { newBoard, newStacks } = applyMove(board, stacks, move, 'cpu');
    const score = minimax(newBoard, newStacks, 4, false, 'cpu', -Infinity, Infinity);
    evaluatedMoves.push({ move, score });
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  evaluatedMoves.sort((a, b) => b.score - a.score);
  console.log('\nMinimax評価（上位10手）:');
  evaluatedMoves.slice(0, 10).forEach((e, i) => {
    console.log('  ' + (i + 1) + '. ' + formatMove(e.move) + ' (score: ' + e.score + ')');
  });

  console.log('\n[Step 6] 選択された手: ' + formatMove(bestMove) + ' (score: ' + bestScore + ')');

  // 実際に選ばれた手（A2→C1）はこのリストに含まれているか？
  const actualBadMove = { type: 'board', fromRow: 1, fromCol: 0, toRow: 0, toCol: 2, pieceSize: 4 };
  const isBadMoveInCandidates = candidateMoves.some(m =>
    m.type === actualBadMove.type &&
    m.fromRow === actualBadMove.fromRow &&
    m.fromCol === actualBadMove.fromCol &&
    m.toRow === actualBadMove.toRow &&
    m.toCol === actualBadMove.toCol
  );

  console.log('\n' + '='.repeat(80));
  console.log('検証結果');
  console.log('='.repeat(80));
  console.log('\n悪手「A2 → C1」が候補に含まれているか: ' + isBadMoveInCandidates);

  if (!isBadMoveInCandidates) {
    console.log('\n✓ 正常動作: 悪手は候補から除外されている');
    console.log('  このシミュレーションでは正しく安全な手が選ばれる');
  } else {
    console.log('\n❌ 問題: 悪手が候補に含まれている');
  }
}
