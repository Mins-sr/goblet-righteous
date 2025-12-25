// 隠れた駒を含む完全な状態でのテスト

const BOARD_SIZE = 4;

// 隠れた駒を含む実際の状態
const boardAfter27_full = [
  [
    [{ size: 2, owner: 'cpu' }, { size: 4, owner: 'player' }],  // A1
    [{ size: 1, owner: 'player' }],  // B1
    [],  // C1
    [{ size: 2, owner: 'player' }]   // D1
  ],
  [
    [{ size: 4, owner: 'cpu' }],     // A2
    [{ size: 3, owner: 'player' }, { size: 3, owner: 'cpu' }],  // B2
    [],  // C2
    []   // D2
  ],
  [
    [{ size: 4, owner: 'player' }],  // A3
    [],  // B3
    [{ size: 1, owner: 'player' }, { size: 1, owner: 'cpu' }],  // C3
    []   // D3
  ],
  [
    [{ size: 2, owner: 'player' }],  // A4
    [{ size: 3, owner: 'player' }],  // B4
    [],  // C4
    []   // D4
  ]
];

// 隠れた駒を無視した簡略状態（元のテストで使用）
const boardAfter27_simple = [
  [
    [{ size: 4, owner: 'player' }],  // A1
    [{ size: 1, owner: 'player' }],  // B1
    [],  // C1
    [{ size: 2, owner: 'player' }]   // D1
  ],
  [
    [{ size: 4, owner: 'cpu' }],     // A2
    [{ size: 3, owner: 'cpu' }],     // B2
    [],  // C2
    []   // D2
  ],
  [
    [{ size: 4, owner: 'player' }],  // A3
    [],  // B3
    [{ size: 1, owner: 'cpu' }],     // C3
    []   // D3
  ],
  [
    [{ size: 2, owner: 'player' }],  // A4
    [{ size: 3, owner: 'player' }],  // B4
    [],  // C4
    []   // D4
  ]
];

const stacksAfter27 = {
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
    lines.push({ type: 'row' + (i+1), cells: board[i].map(getTopPiece) });
    lines.push({ type: 'col' + String.fromCharCode(65+i), cells: board.map(row => getTopPiece(row[i])) });
  }
  lines.push({ type: 'diag1', cells: [0, 1, 2, 3].map(i => getTopPiece(board[i][i])) });
  lines.push({ type: 'diag2', cells: [0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i])) });

  let threatCount = 0;
  let threatLines = [];
  for (const line of lines) {
    const playerCount = line.cells.filter(p => p && p.owner === 'player').length;
    const cpuCount = line.cells.filter(p => p && p.owner === 'cpu').length;
    if (playerCount === 3 && cpuCount === 0) {
      threatCount++;
      threatLines.push({
        type: line.type,
        cells: line.cells.map(p => p ? (p.owner === 'player' ? 'P' : 'C') + p.size : '·')
      });
    }
  }
  return { count: threatCount, lines: threatLines };
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

const isSafeMove = (currentBoard, currentStacks, cpuMove) => {
  const { newBoard: boardAfterCpu, newStacks: stacksAfterCpu } = applyMove(currentBoard, currentStacks, cpuMove, 'cpu');
  if (checkWinner(boardAfterCpu) === 'cpu') return true;

  const playerMovesAfter = getValidMoves(boardAfterCpu, stacksAfterCpu, 'player');
  for (const playerMove of playerMovesAfter) {
    const { newBoard: boardAfterPlayer } = applyMove(boardAfterCpu, stacksAfterCpu, playerMove, 'player');
    if (checkWinner(boardAfterPlayer) === 'player') return false;
    if (countPlayerThreats(boardAfterPlayer).count >= 2) return false;
  }
  return true;
};

console.log('='.repeat(80));
console.log('countPlayerThreats の検証');
console.log('='.repeat(80));

console.log('\n【完全な状態（隠れた駒を含む）】');
const threats_full = countPlayerThreats(boardAfter27_full);
console.log('脅威数: ' + threats_full.count);
console.log('isPlayerInFork: ' + (threats_full.count >= 2));
if (threats_full.lines.length > 0) {
  console.log('脅威のあるライン:');
  threats_full.lines.forEach(l => console.log('  ' + l.type + ': ' + l.cells.join(' ')));
}

console.log('\n【簡略状態（元のテスト）】');
const threats_simple = countPlayerThreats(boardAfter27_simple);
console.log('脅威数: ' + threats_simple.count);
console.log('isPlayerInFork: ' + (threats_simple.count >= 2));
if (threats_simple.lines.length > 0) {
  console.log('脅威のあるライン:');
  threats_simple.lines.forEach(l => console.log('  ' + l.type + ': ' + l.cells.join(' ')));
}

console.log('\n' + '='.repeat(80));
console.log('isSafeMove の検証（完全な状態）');
console.log('='.repeat(80));

const badMove = { type: 'board', fromRow: 1, fromCol: 0, toRow: 0, toCol: 2, pieceSize: 4 };
console.log('\n[悪手] A2(C4) → C1');
console.log('isSafeMove結果: ' + isSafeMove(boardAfter27_full, stacksAfter27, badMove));

const safeMove = { type: 'stack', stackIndex: 2, pieceSize: 4, toRow: 0, toCol: 2 };
console.log('\n[安全手] Stack[2](size 4) → C1');
console.log('isSafeMove結果: ' + isSafeMove(boardAfter27_full, stacksAfter27, safeMove));

console.log('\n' + '='.repeat(80));
console.log('全ての安全な手を列挙（完全な状態）');
console.log('='.repeat(80));

const cpuMoves = getValidMoves(boardAfter27_full, stacksAfter27, 'cpu');
const safeMoves = cpuMoves.filter(m => isSafeMove(boardAfter27_full, stacksAfter27, m));

console.log('\n安全な手数: ' + safeMoves.length + ' / ' + cpuMoves.length);
if (safeMoves.length > 0) {
  const colLabels = ['A', 'B', 'C', 'D'];
  const rowLabels = ['1', '2', '3', '4'];
  safeMoves.forEach(m => {
    const to = colLabels[m.toCol] + rowLabels[m.toRow];
    if (m.type === 'stack') {
      console.log('  Stack[' + m.stackIndex + '](size ' + m.pieceSize + ') → ' + to);
    } else {
      const from = colLabels[m.fromCol] + rowLabels[m.fromRow];
      console.log('  ' + from + '(size ' + m.pieceSize + ') → ' + to);
    }
  });
}

console.log('\n' + '='.repeat(80));
console.log('結論');
console.log('='.repeat(80));

if (threats_full.count === threats_simple.count) {
  console.log('✓ 脅威数は同じ: ' + threats_full.count);
} else {
  console.log('❌ 脅威数が異なる！');
}

if (isSafeMove(boardAfter27_full, stacksAfter27, badMove) === false) {
  console.log('✓ isSafeMove は悪手を正しく検出');
} else {
  console.log('❌ isSafeMove が悪手を検出できていない！');
}

if (safeMoves.length > 0) {
  console.log('✓ 安全な手が ' + safeMoves.length + '件存在');
} else {
  console.log('❌ 安全な手が見つからない！これが問題の原因');
}
