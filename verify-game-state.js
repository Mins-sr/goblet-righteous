// ゲームログの解析が正確か検証

const BOARD_SIZE = 4;
const PIECE_SIZES = [1, 2, 3, 4];
const STACKS_PER_PLAYER = 3;

const gameLogRaw = `P: Stack → C2
C: Stack → D1
P: Stack → B2
C: Stack → D2
P: Stack → D4
C: Stack → A1
P: Stack → C3
C: Stack → A1
P: Stack → A3
C: Stack → B1
P: D4 → C1
C: A1 → C4
P: B2 → D3
C: D1 → B3
P: Stack → B2
C: D2 → B2
P: D3 → B4
C: B1 → A4
P: Stack → D1
C: B3 → D1
P: C1 → A4
C: C4 → C1
P: C2 → B1
C: C1 → C3
P: B1 → A1
C: D1 → A2
P: Stack → B1
C: A2 → C1
P: Stack → A2`;

const createInitialStacks = () => ({
  player: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES]),
  cpu: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES])
});

const createEmptyBoard = () =>
  Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null).map(() => [])
  );

const parsePosition = (pos) => {
  const col = pos.charCodeAt(0) - 65;
  const row = parseInt(pos[1]) - 1;
  return { row, col };
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

const displayBoard = (board) => {
  console.log('  A   B   C   D');
  for (let row = 0; row < BOARD_SIZE; row++) {
    let line = (row + 1) + ' ';
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
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
};

const displayStacks = (stacks) => {
  console.log('Player stacks:', stacks.player.map((s, i) => `[${i}]: ${s.join(',') || 'empty'}`).join(' | '));
  console.log('CPU stacks:   ', stacks.cpu.map((s, i) => `[${i}]: ${s.join(',') || 'empty'}`).join(' | '));
};

const parseMove = (moveStr) => {
  const [owner, moveDesc] = moveStr.split(': ');
  const parts = moveDesc.split(' → ');

  if (parts[0] === 'Stack') {
    const to = parsePosition(parts[1]);
    return { type: 'stack', ...to, owner: owner === 'P' ? 'player' : 'cpu' };
  } else {
    const from = parsePosition(parts[0]);
    const to = parsePosition(parts[1]);
    return { type: 'board', fromRow: from.row, fromCol: from.col, toRow: to.row, toCol: to.col, owner: owner === 'P' ? 'player' : 'cpu' };
  }
};

let board = createEmptyBoard();
let stacks = createInitialStacks();
const moves = gameLogRaw.split('\n');

// Gobblet.jsxの動作を正確に再現
// スタックから駒を取る際、最初の非空スタックから取る
const getStackIndexForNewPiece = (ownerStacks) => {
  for (let i = 0; i < ownerStacks.length; i++) {
    if (ownerStacks[i].length > 0) {
      return i;
    }
  }
  return -1;
};

console.log('='.repeat(80));
console.log('ゲームログの正確な再現');
console.log('='.repeat(80));

// 手番27まで進める
for (let i = 0; i < 27; i++) {
  const moveStr = moves[i];
  const parsedMove = parseMove(moveStr);
  const owner = parsedMove.owner;

  let move;
  if (parsedMove.type === 'stack') {
    const stackIndex = getStackIndexForNewPiece(stacks[owner]);
    move = { type: 'stack', stackIndex, toRow: parsedMove.row, toCol: parsedMove.col };
  } else {
    move = { type: 'board', fromRow: parsedMove.fromRow, fromCol: parsedMove.fromCol, toRow: parsedMove.toRow, toCol: parsedMove.toCol };
  }

  const result = applyMove(board, stacks, move, owner);
  board = result.newBoard;
  stacks = result.newStacks;
}

console.log('\n手番27後の状態:');
displayBoard(board);
console.log();
displayStacks(stacks);

console.log('\n' + '='.repeat(80));
console.log('手番28: C: A2 → C1');
console.log('='.repeat(80));

// A2にCPUの駒があるか確認
console.log('\nA2のセル内容:');
const a2Cell = board[1][0];
if (a2Cell.length > 0) {
  a2Cell.forEach((piece, i) => {
    console.log(`  [${i}] ${piece.owner === 'player' ? 'P' : 'C'}${piece.size}`);
  });
  console.log(`  トップ: ${a2Cell[a2Cell.length - 1].owner === 'player' ? 'P' : 'C'}${a2Cell[a2Cell.length - 1].size}`);
} else {
  console.log('  (空)');
}

// C1のセル内容
console.log('\nC1のセル内容:');
const c1Cell = board[0][2];
if (c1Cell.length > 0) {
  c1Cell.forEach((piece, i) => {
    console.log(`  [${i}] ${piece.owner === 'player' ? 'P' : 'C'}${piece.size}`);
  });
  console.log(`  トップ: ${c1Cell[c1Cell.length - 1].owner === 'player' ? 'P' : 'C'}${c1Cell[c1Cell.length - 1].size}`);
} else {
  console.log('  (空)');
}

// 手番28を適用
if (a2Cell.length > 0 && a2Cell[a2Cell.length - 1].owner === 'cpu') {
  console.log('\n✓ A2にCPUの駒があります。A2 → C1 は有効な手です。');

  const move28 = { type: 'board', fromRow: 1, fromCol: 0, toRow: 0, toCol: 2 };
  const result = applyMove(board, stacks, move28, 'cpu');
  const boardAfter28 = result.newBoard;

  console.log('\n手番28後の状態:');
  displayBoard(boardAfter28);
} else {
  console.log('\n❌ エラー: A2にCPUの駒がありません！ゲームログの解析が間違っています。');
}

console.log('\n' + '='.repeat(80));
console.log('検証結果:');
console.log('='.repeat(80));

// JSONで状態を出力（コピペしやすいように）
console.log('\n手番27後のボード状態 (JSON):');
console.log(JSON.stringify(board, null, 2));

console.log('\n手番27後のスタック状態 (JSON):');
console.log(JSON.stringify(stacks, null, 2));
