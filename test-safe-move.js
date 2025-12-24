// isSafeMove関数が正しく動作しているか検証

const BOARD_SIZE = 4;

const boardAfter27 = [
  [
    [{ size: 4, owner: 'player' }],  // A1
    [{ size: 1, owner: 'player' }],  // B1
    [],                               // C1
    [{ size: 2, owner: 'player' }]   // D1
  ],
  [
    [{ size: 4, owner: 'cpu' }],     // A2
    [{ size: 3, owner: 'cpu' }],     // B2
    [],                               // C2
    []                                // D2
  ],
  [
    [{ size: 4, owner: 'player' }],  // A3
    [],                               // B3
    [{ size: 1, owner: 'cpu' }],     // C3
    []                                // D3
  ],
  [
    [{ size: 2, owner: 'player' }],  // A4
    [{ size: 3, owner: 'player' }],  // B4
    [],                               // C4
    []                                // D4
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

// Gobblet.jsxの実装そのまま
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

console.log('='.repeat(80));
console.log('isSafeMove関数のテスト');
console.log('='.repeat(80));

// テスト1: 実際にCPUが選んだ手「A2 → C1」
const badMove = { type: 'board', fromRow: 1, fromCol: 0, toRow: 0, toCol: 2, pieceSize: 4 };
console.log('\n[テスト1] 実際にCPUが選んだ手: A2 → C1');
console.log(`isSafeMove結果: ${isSafeMove(boardAfter27, stacksAfter27, badMove)}`);

// テスト2: 安全なはずの手「Stack[2](size 4) → C1」
const safeMove = { type: 'stack', stackIndex: 2, pieceSize: 4, toRow: 0, toCol: 2 };
console.log('\n[テスト2] 安全なはずの手: Stack[2](size 4) → C1');
console.log(`isSafeMove結果: ${isSafeMove(boardAfter27, stacksAfter27, safeMove)}`);

// デバッグ: なぜ「A2 → C1」がunsafeと判定されないのか
console.log('\n' + '='.repeat(80));
console.log('[デバッグ] A2 → C1 の詳細検証');
console.log('='.repeat(80));

const { newBoard: boardAfterBadMove, newStacks: stacksAfterBadMove } = applyMove(boardAfter27, stacksAfter27, badMove, 'cpu');

console.log('\nA2 → C1 の後のボード:');
console.log('  A   B   C   D');
for (let row = 0; row < BOARD_SIZE; row++) {
  let line = (row + 1) + ' ';
  for (let col = 0; col < BOARD_SIZE; col++) {
    const cell = boardAfterBadMove[row][col];
    if (cell.length === 0) {
      line += '·   ';
    } else {
      const top = cell[cell.length - 1];
      const owner = top.owner === 'player' ? 'P' : 'C';
      line += `${owner}${top.size}  `;
    }
  }
  console.log(line);
}

console.log('\nプレイヤーの有効手を確認:');
const playerMoves = getValidMoves(boardAfterBadMove, stacksAfterBadMove, 'player');
console.log(`プレイヤーの有効手数: ${playerMoves.length}`);

let winningMoveFound = false;
for (const pMove of playerMoves) {
  const { newBoard: boardAfterPlayer } = applyMove(boardAfterBadMove, stacksAfterBadMove, pMove, 'player');
  const winner = checkWinner(boardAfterPlayer);

  if (winner === 'player') {
    const colLabels = ['A', 'B', 'C', 'D'];
    const rowLabels = ['1', '2', '3', '4'];
    const to = `${colLabels[pMove.toCol]}${rowLabels[pMove.toRow]}`;
    let moveStr;
    if (pMove.type === 'stack') {
      moveStr = `Stack[${pMove.stackIndex}](size ${pMove.pieceSize}) → ${to}`;
    } else {
      const from = `${colLabels[pMove.fromCol]}${rowLabels[pMove.fromRow]}`;
      moveStr = `${from}(size ${pMove.pieceSize}) → ${to}`;
    }
    console.log(`  ✓ 勝ち手発見: ${moveStr}`);
    winningMoveFound = true;
  }
}

console.log(`\n勝ち手が見つかった: ${winningMoveFound}`);
console.log(`isSafeMoveの結果: ${isSafeMove(boardAfter27, stacksAfter27, badMove)}`);

if (winningMoveFound && isSafeMove(boardAfter27, stacksAfter27, badMove)) {
  console.log('\n❌❌❌ バグ発見！ ❌❌❌');
  console.log('勝ち手が存在するのに、isSafeMove が true を返しています！');
}

// プレイヤーのフォーク状態を確認
console.log('\n' + '='.repeat(80));
console.log('プレイヤーのフォーク状態');
console.log('='.repeat(80));
const threatsBefore = countPlayerThreats(boardAfter27);
console.log(`手番27後のプレイヤーの脅威数: ${threatsBefore}`);
console.log(`isPlayerInFork: ${threatsBefore >= 2}`);
