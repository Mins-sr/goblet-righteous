// 完全な状態での分析（隠れた駒も含む）

const BOARD_SIZE = 4;

// JSON出力から正確なボード状態を再構築
const boardAfter27 = [
  [
    // Row 1
    [
      { size: 2, owner: "cpu" },
      { size: 4, owner: "player" }
    ],  // A1
    [
      { size: 1, owner: "player" }
    ],  // B1
    [],  // C1
    [
      { size: 2, owner: "player" }
    ]   // D1
  ],
  [
    // Row 2
    [
      { size: 4, owner: "cpu" }
    ],  // A2
    [
      { size: 3, owner: "player" },
      { size: 3, owner: "cpu" }
    ],  // B2
    [],  // C2
    []   // D2
  ],
  [
    // Row 3
    [
      { size: 4, owner: "player" }
    ],  // A3
    [],  // B3
    [
      { size: 1, owner: "player" },
      { size: 1, owner: "cpu" }
    ],  // C3
    []   // D3
  ],
  [
    // Row 4
    [
      { size: 2, owner: "player" }
    ],  // A4
    [
      { size: 3, owner: "player" }
    ],  // B4
    [],  // C4
    []   // D4
  ]
];

const stacksAfter27 = {
  player: [[], [], [1, 2, 3, 4]],
  cpu: [[], [1, 2, 3], [1, 2, 3, 4]]
};

const displayFullBoard = (board) => {
  console.log('\n完全なボード状態（すべての駒を表示）:');
  console.log('  A         B         C         D');
  for (let row = 0; row < BOARD_SIZE; row++) {
    let line = (row + 1) + ' ';
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      if (cell.length === 0) {
        line += '·         ';
      } else {
        const cellStr = cell.map(p => `${p.owner === 'player' ? 'P' : 'C'}${p.size}`).join(',');
        line += cellStr.padEnd(10, ' ');
      }
    }
    console.log(line);
  }
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

console.log('='.repeat(80));
console.log('完全な状態での手番27後の分析');
console.log('='.repeat(80));

displayFullBoard(boardAfter27);

console.log('\n' + '='.repeat(80));
console.log('手番28: A2 → C1 を適用');
console.log('='.repeat(80));

const move28 = { type: 'board', fromRow: 1, fromCol: 0, toRow: 0, toCol: 2 };
const { newBoard: boardAfter28 } = applyMove(boardAfter27, stacksAfter27, move28, 'cpu');

displayFullBoard(boardAfter28);

console.log('\n' + '='.repeat(80));
console.log('重要な発見:');
console.log('='.repeat(80));

console.log('\n手番28でCPUは A2 の C4 (サイズ4) を C1 に移動しました。');
console.log('この手の後、A2 は空になります。');
console.log('プレイヤーは次の手で A2 に駒を置いて Col A で勝利できます。');

console.log('\nしかし、A1 には下に CPU の C2 (サイズ2) が隠れています！');
console.log('もしプレイヤーが A2 にサイズ4を置いたとしても...');

const playerMove29 = { type: 'stack', stackIndex: 2, toRow: 1, toCol: 0 };
const { newBoard: boardAfterPlayer29 } = applyMove(boardAfter28, stacksAfter27, playerMove29, 'player');

console.log('\n手番29: プレイヤーが Stack → A2 (サイズ4) を実行した場合:');
displayFullBoard(boardAfterPlayer29);

const winner = checkWinner(boardAfterPlayer29);
console.log(`\n勝者: ${winner ? (winner === 'player' ? 'プレイヤー' : 'CPU') : 'なし'}`);

if (winner === 'player') {
  console.log('\n✓ プレイヤーが Col A で勝利します:');
  console.log('  A1: P4 (下に C2 が隠れているが、トップは P4)');
  console.log('  A2: P4');
  console.log('  A3: P4');
  console.log('  A4: P2');
  console.log('\n  トップの駒: P4, P4, P4, P2');
  console.log('  → 4つ全てプレイヤーの駒なので勝利！');
}

console.log('\n' + '='.repeat(80));
console.log('結論:');
console.log('='.repeat(80));
console.log('隠れた駒があっても、勝利判定はトップの駒のみで判定されます。');
console.log('したがって、CPUの手「A2 → C1」は依然として致命的なミスです。');
