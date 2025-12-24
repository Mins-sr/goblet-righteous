// 手番28の詳細分析 - なぜCPUはA2→C1を選んだのか

const BOARD_SIZE = 4;

// 手番27後のボード状態を再現
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
console.log('手番28の詳細分析: CPUの選択肢と結果');
console.log('='.repeat(80));

const cpuMoves = getValidMoves(boardAfter27, stacksAfter27, 'cpu');

console.log(`\nCPUの全有効手: ${cpuMoves.length}件`);
console.log('\n各手の結果分析:\n');

// 各手を評価
const moveAnalysis = [];

for (const move of cpuMoves) {
  const { newBoard, newStacks } = applyMove(boardAfter27, stacksAfter27, move, 'cpu');

  // この手の後、プレイヤーが勝てるかチェック
  const playerMoves = getValidMoves(newBoard, newStacks, 'player');
  let playerWinningMoves = [];

  for (const pMove of playerMoves) {
    const { newBoard: boardAfterPlayer } = applyMove(newBoard, newStacks, pMove, 'player');
    const winner = checkWinner(boardAfterPlayer);
    if (winner && winner.winner === 'player') {
      playerWinningMoves.push(formatMove(pMove));
    }
  }

  // CPUが即座に勝てるかチェック
  const cpuWinner = checkWinner(newBoard);

  moveAnalysis.push({
    move: formatMove(move),
    cpuWins: cpuWinner ? true : false,
    allowsPlayerWin: playerWinningMoves.length > 0,
    playerWinCount: playerWinningMoves.length,
    playerWinningMoves: playerWinningMoves.slice(0, 3), // 最初の3つのみ
    raw: move
  });
}

// ソート: CPUが勝つ手 > プレイヤーが勝てない手 > プレイヤーの勝ち手が少ない順
moveAnalysis.sort((a, b) => {
  if (a.cpuWins !== b.cpuWins) return b.cpuWins - a.cpuWins;
  if (a.allowsPlayerWin !== b.allowsPlayerWin) return a.allowsPlayerWin - b.allowsPlayerWin;
  return a.playerWinCount - b.playerWinCount;
});

// CPUが勝てる手
const winningMoves = moveAnalysis.filter(m => m.cpuWins);
console.log(`\n✅ CPUが即座に勝てる手: ${winningMoves.length}件`);
if (winningMoves.length > 0) {
  winningMoves.forEach(m => {
    console.log(`   - ${m.move}`);
  });
}

// プレイヤーが勝てない手
const safeMoves = moveAnalysis.filter(m => !m.cpuWins && !m.allowsPlayerWin);
console.log(`\n✅ プレイヤーに勝ちを許さない安全な手: ${safeMoves.length}件`);
if (safeMoves.length > 0) {
  safeMoves.slice(0, 10).forEach(m => {
    console.log(`   - ${m.move}`);
  });
  if (safeMoves.length > 10) {
    console.log(`   ... 他 ${safeMoves.length - 10}件`);
  }
}

// プレイヤーが勝てる手（最悪の手）
const dangerousMoves = moveAnalysis.filter(m => !m.cpuWins && m.allowsPlayerWin);
console.log(`\n❌ プレイヤーに勝ちを許す危険な手: ${dangerousMoves.length}件`);
if (dangerousMoves.length > 0) {
  dangerousMoves.slice(0, 10).forEach(m => {
    console.log(`   - ${m.move} (プレイヤーの勝ち手: ${m.playerWinCount}件)`);
    if (m.playerWinningMoves.length > 0) {
      m.playerWinningMoves.forEach(pm => {
        console.log(`      └─> ${pm}`);
      });
    }
  });
  if (dangerousMoves.length > 10) {
    console.log(`   ... 他 ${dangerousMoves.length - 10}件`);
  }
}

// 実際にCPUが選んだ手
const actualMove = moveAnalysis.find(m =>
  m.raw.type === 'board' &&
  m.raw.fromRow === 1 && m.raw.fromCol === 0 &&
  m.raw.toRow === 0 && m.raw.toCol === 2
);

console.log('\n' + '='.repeat(80));
console.log('実際にCPUが選んだ手:');
console.log('='.repeat(80));
if (actualMove) {
  console.log(`手: ${actualMove.move}`);
  console.log(`CPUが勝つ: ${actualMove.cpuWins ? 'はい' : 'いいえ'}`);
  console.log(`プレイヤーに勝ちを許す: ${actualMove.allowsPlayerWin ? 'はい ❌' : 'いいえ ✅'}`);
  console.log(`プレイヤーの勝ち手数: ${actualMove.playerWinCount}件`);
  if (actualMove.playerWinningMoves.length > 0) {
    console.log(`プレイヤーの勝ち手:`);
    actualMove.playerWinningMoves.forEach(pm => {
      console.log(`   - ${pm}`);
    });
  }

  // ランキング
  const rank = moveAnalysis.indexOf(actualMove) + 1;
  console.log(`\n評価順位: ${rank}/${moveAnalysis.length} (1が最良)`);
}

console.log('\n' + '='.repeat(80));
console.log('結論:');
console.log('='.repeat(80));
if (safeMoves.length > 0) {
  console.log(`❌ CPUには${safeMoves.length}件の安全な手があったにも関わらず、`);
  console.log(`   プレイヤーに即座の勝利を許す手「A2 → C1」を選択しました。`);
  console.log(`\n推奨されていた安全な手の例:`);
  safeMoves.slice(0, 5).forEach(m => {
    console.log(`   - ${m.move}`);
  });
} else if (winningMoves.length > 0) {
  console.log(`❌ CPUには${winningMoves.length}件の勝利手があったにも関わらず、`);
  console.log(`   それを選ばずプレイヤーに勝ちを許しました。`);
} else {
  console.log(`⚠️  この局面では、CPUにはプレイヤーの勝利を防ぐ手がなかった可能性があります。`);
  console.log(`   しかし、選択した手は${actualMove.playerWinCount}件もの勝ち手をプレイヤーに与えました。`);
}

console.log('\n='.repeat(80));
