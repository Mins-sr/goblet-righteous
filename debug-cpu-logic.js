// CPUの思考ロジックをデバッグ - なぜ危険な手を選んだのか

const BOARD_SIZE = 4;

const boardAfter27 = [
  [
    [{ size: 4, owner: 'player' }],
    [{ size: 1, owner: 'player' }],
    [],
    [{ size: 2, owner: 'player' }]
  ],
  [
    [{ size: 4, owner: 'cpu' }],
    [{ size: 3, owner: 'cpu' }],
    [],
    []
  ],
  [
    [{ size: 4, owner: 'player' }],
    [],
    [{ size: 1, owner: 'cpu' }],
    []
  ],
  [
    [{ size: 2, owner: 'player' }],
    [{ size: 3, owner: 'player' }],
    [],
    []
  ]
];

const stacksAfter27 = {
  player: [[], [], [1, 2, 3, 4]],
  cpu: [[], [1, 2, 3], [1, 2, 3, 4]]
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

const countPlayerThreats = (board) => {
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

const isSafeMove = (currentBoard, currentStacks, cpuMove) => {
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
};

const formatMove = (move) => {
  const colLabels = ['A', 'B', 'C', 'D'];
  const rowLabels = ['1', '2', '3', '4'];
  const to = `${colLabels[move.toCol]}${rowLabels[move.toRow]}`;
  if (move.type === 'stack') {
    return `Stack[${move.stackIndex}](size ${move.pieceSize}) → ${to}`;
  } else {
    const from = `${colLabels[move.fromCol]}${rowLabels[move.fromRow]}`;
    return `${from}(size ${move.pieceSize}) → ${to}`;
  }
};

console.log('='.repeat(80));
console.log('CPUの思考ロジック デバッグ (Ultra Hard モード)');
console.log('='.repeat(80));

// Gobblet.jsxの getCpuMove ロジックを再現
const board = boardAfter27;
const stacks = stacksAfter27;

const moves = getValidMoves(board, stacks, 'cpu');
console.log(`\n全有効手: ${moves.length}件`);

// Ultra Hard ロジック
const isPlayerInFork = countPlayerThreats(board) >= 2;
console.log(`isPlayerInFork: ${isPlayerInFork}`);

let candidateMoves = moves;
if (!isPlayerInFork) {
  console.log('\nプレイヤーはフォーク状態ではないので、安全な手をフィルタリングします...');

  const safeMoves = moves.filter(move => isSafeMove(board, stacks, move));
  console.log(`安全な手: ${safeMoves.length}件`);

  if (safeMoves.length > 0) {
    candidateMoves = safeMoves;
    console.log('✓ 候補を安全な手のみに絞りました');
  }
}

console.log(`\n最終候補手数: ${candidateMoves.length}件`);

// movesToEvaluate = Math.min(candidateMoves.length, 40)
const movesToEvaluate = Math.min(candidateMoves.length, 40);
console.log(`評価する手数: ${movesToEvaluate}件 (最大40件)`);

console.log('\n評価対象の手（最初の20件）:');
for (let i = 0; i < Math.min(20, movesToEvaluate); i++) {
  const move = candidateMoves[i];
  const safe = isSafeMove(board, stacks, move);
  console.log(`  ${i + 1}. ${formatMove(move)} ${safe ? '✓' : '❌'}`);
}

if (movesToEvaluate > 20) {
  console.log(`  ... 他 ${movesToEvaluate - 20}件`);
}

// 「A2 → C1」が候補に含まれているかチェック
const badMove = { type: 'board', fromRow: 1, fromCol: 0, toRow: 0, toCol: 2, pieceSize: 4 };
const badMoveIndex = candidateMoves.findIndex(m =>
  m.type === 'board' &&
  m.fromRow === 1 && m.fromCol === 0 &&
  m.toRow === 0 && m.toCol === 2
);

console.log('\n' + '='.repeat(80));
console.log('問題の手「A2 → C1」のチェック:');
console.log('='.repeat(80));
if (badMoveIndex >= 0) {
  console.log(`❌ 「A2 → C1」が候補に含まれています！ (インデックス: ${badMoveIndex})`);
  console.log(`   評価対象に含まれる: ${badMoveIndex < movesToEvaluate ? 'はい' : 'いいえ'}`);
} else {
  console.log(`✓ 「A2 → C1」は候補から除外されています`);
}

console.log(`「A2 → C1」のisSafeMove: ${isSafeMove(board, stacks, badMove)}`);

// 元の moves 配列での位置を確認
const badMoveIndexInOriginal = moves.findIndex(m =>
  m.type === 'board' &&
  m.fromRow === 1 && m.fromCol === 0 &&
  m.toRow === 0 && m.toCol === 2
);
console.log(`「A2 → C1」の元の配列でのインデックス: ${badMoveIndexInOriginal}`);

console.log('\n' + '='.repeat(80));
console.log('結論:');
console.log('='.repeat(80));

if (badMoveIndex >= 0 && badMoveIndex < movesToEvaluate) {
  console.log('❌❌❌ バグ発見！ ❌❌❌');
  console.log('安全でない手「A2 → C1」が候補に含まれており、評価されています。');
  console.log('これは isSafeMove によるフィルタリングが失敗していることを意味します。');
} else if (badMoveIndex >= 0) {
  console.log('⚠️  「A2 → C1」は候補には含まれていますが、評価対象外です（40件制限）。');
  console.log('しかし、実際のゲームでは選ばれているので、別の問題があります。');
} else {
  console.log('✓ 「A2 → C1」は正しくフィルタリングされています。');
  console.log('実際のゲームで選ばれた理由は、別のコードパスにある可能性があります。');
}
