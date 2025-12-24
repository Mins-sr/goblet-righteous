// ゲームログ分析スクリプト
const BOARD_SIZE = 4;
const PIECE_SIZES = [1, 2, 3, 4];
const STACKS_PER_PLAYER = 3;

const gameLog = `P: Stack → C2
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

// 初期化
const createInitialStacks = () => ({
  player: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES]),
  cpu: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES])
});

const createEmptyBoard = () =>
  Array(BOARD_SIZE).fill(null).map(() =>
    Array(BOARD_SIZE).fill(null).map(() => [])
  );

// 勝利判定
const checkWinner = (board) => {
  const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;

  for (let row = 0; row < BOARD_SIZE; row++) {
    const pieces = board[row].map(getTopPiece);
    if (pieces[0] && pieces.every(p => p && p.owner === pieces[0].owner)) {
      return { winner: pieces[0].owner, line: `Row ${row + 1}` };
    }
  }

  for (let col = 0; col < BOARD_SIZE; col++) {
    const pieces = board.map(row => getTopPiece(row[col]));
    if (pieces[0] && pieces.every(p => p && p.owner === pieces[0].owner)) {
      return { winner: pieces[0].owner, line: `Col ${String.fromCharCode(65 + col)}` };
    }
  }

  const diag1 = [0, 1, 2, 3].map(i => getTopPiece(board[i][i]));
  if (diag1[0] && diag1.every(p => p && p.owner === diag1[0].owner)) {
    return { winner: diag1[0].owner, line: 'Diagonal ↘' };
  }

  const diag2 = [0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i]));
  if (diag2[0] && diag2.every(p => p && p.owner === diag2[0].owner)) {
    return { winner: diag2[0].owner, line: 'Diagonal ↙' };
  }

  return null;
};

// 座標変換
const parsePosition = (pos) => {
  const col = pos.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
  const row = parseInt(pos[1]) - 1;    // 1=0, 2=1, 3=2, 4=3
  return { row, col };
};

// ボード表示
const displayBoard = (board) => {
  console.log('\n  A   B   C   D');
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

// スタック表示
const displayStacks = (stacks) => {
  console.log('Player stacks:', stacks.player.map((s, i) => `[${i}]: ${s.join(',') || 'empty'}`).join(' | '));
  console.log('CPU stacks:   ', stacks.cpu.map((s, i) => `[${i}]: ${s.join(',') || 'empty'}`).join(' | '));
};

// 脅威カウント
const countThreats = (board, owner) => {
  const getTopPiece = (cell) => cell.length > 0 ? cell[cell.length - 1] : null;
  const opponent = owner === 'player' ? 'cpu' : 'player';
  const lines = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    lines.push({ name: `Row ${i + 1}`, pieces: board[i].map(getTopPiece) });
    lines.push({ name: `Col ${String.fromCharCode(65 + i)}`, pieces: board.map(row => getTopPiece(row[i])) });
  }
  lines.push({ name: 'Diag ↘', pieces: [0, 1, 2, 3].map(i => getTopPiece(board[i][i])) });
  lines.push({ name: 'Diag ↙', pieces: [0, 1, 2, 3].map(i => getTopPiece(board[i][3 - i])) });

  const threats = [];
  for (const line of lines) {
    const ownerCount = line.pieces.filter(p => p && p.owner === owner).length;
    const opponentCount = line.pieces.filter(p => p && p.owner === opponent).length;
    if (ownerCount === 3 && opponentCount === 0) {
      threats.push(line.name);
    }
  }
  return threats;
};

// 有効手を取得
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

// 手を適用
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

// 手のパース
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

// メイン解析
let board = createEmptyBoard();
let stacks = createInitialStacks();
const moves = gameLog.split('\n');

console.log('='.repeat(70));
console.log('GOBBLET ゲームログ分析 - CPUの敗因調査');
console.log('='.repeat(70));

let stackUsageCount = { player: [0, 0, 0], cpu: [0, 0, 0] };

for (let i = 0; i < moves.length; i++) {
  const moveStr = moves[i];
  const parsedMove = parseMove(moveStr);
  const owner = parsedMove.owner;

  console.log(`\n${'='.repeat(70)}`);
  console.log(`手番 ${i + 1}: ${moveStr}`);
  console.log('-'.repeat(70));

  // スタックインデックスを見つける
  let move;
  if (parsedMove.type === 'stack') {
    // どのスタックから取るか決定（最初の非空スタック）
    let stackIndex = -1;
    for (let si = 0; si < stacks[owner].length; si++) {
      if (stacks[owner][si].length > 0) {
        stackIndex = si;
        stackUsageCount[owner][si]++;
        break;
      }
    }
    move = { type: 'stack', stackIndex, toRow: parsedMove.row, toCol: parsedMove.col };
  } else {
    move = { type: 'board', fromRow: parsedMove.fromRow, fromCol: parsedMove.fromCol, toRow: parsedMove.toRow, toCol: parsedMove.toCol };
  }

  const result = applyMove(board, stacks, move, owner);
  board = result.newBoard;
  stacks = result.newStacks;

  displayBoard(board);
  displayStacks(stacks);

  const winner = checkWinner(board);
  if (winner) {
    console.log(`\n🏆 勝者: ${winner.winner === 'player' ? 'プレイヤー' : 'CPU'} (${winner.line})`);
  }

  const playerThreats = countThreats(board, 'player');
  const cpuThreats = countThreats(board, 'cpu');

  if (playerThreats.length > 0) {
    console.log(`⚠️  プレイヤーの脅威 (${playerThreats.length}): ${playerThreats.join(', ')}`);
  }
  if (cpuThreats.length > 0) {
    console.log(`💡 CPUの脅威 (${cpuThreats.length}): ${cpuThreats.join(', ')}`);
  }

  // CPUの手の場合、次のプレイヤーの手で勝てるかチェック
  if (owner === 'cpu' && i < moves.length - 1) {
    const playerMoves = getValidMoves(board, stacks, 'player');
    const winningMoves = [];

    for (const pMove of playerMoves) {
      const { newBoard } = applyMove(board, stacks, pMove, 'player');
      const testWinner = checkWinner(newBoard);
      if (testWinner && testWinner.winner === 'player') {
        const colLabels = ['A', 'B', 'C', 'D'];
        const rowLabels = ['1', '2', '3', '4'];
        const to = `${colLabels[pMove.toCol]}${rowLabels[pMove.toRow]}`;
        if (pMove.type === 'stack') {
          winningMoves.push(`Stack → ${to}`);
        } else {
          const from = `${colLabels[pMove.fromCol]}${rowLabels[pMove.fromRow]}`;
          winningMoves.push(`${from} → ${to}`);
        }
      }
    }

    if (winningMoves.length > 0) {
      console.log(`\n❌ 致命的ミス: CPUの手の後、プレイヤーは次の手で勝てる:`);
      winningMoves.forEach(wm => console.log(`   - ${wm}`));
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('ゲーム終了');
console.log('='.repeat(70));
