// Debug version to understand what moves are being filtered

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

const checkDefensivePostAbandonment = (currentBoard, move, owner) => {
  if (move.type !== 'board') return false;

  const fromCell = currentBoard[move.fromRow][move.fromCol];
  if (fromCell.length <= 1) return false;

  const hiddenPieces = fromCell.slice(0, -1);
  const opponent = owner === 'player1' ? 'player2' : 'player1';
  const hasOpponentPieceUnderneath = hiddenPieces.some(p => p.owner === opponent);

  if (!hasOpponentPieceUnderneath) return false;

  const boardAfterMove = currentBoard.map(row => row.map(cell => [...cell]));
  boardAfterMove[move.fromRow][move.fromCol] = [...fromCell.slice(0, -1)];

  const winner = checkWinner(boardAfterMove);

  if (winner === opponent) {
    console.log(`⚠️ Defensive abandonment detected!`);
    console.log(`   Moving from (${move.fromRow},${move.fromCol}) to (${move.toRow},${move.toCol})`);
    console.log(`   Reveals opponent piece that creates winning line`);
    return true;
  }

  return false;
};

// Create a specific scenario to test
const testScenario = () => {
  console.log('Testing specific scenario where defensive abandonment matters...\n');

  // Create a board with a defensive situation
  const board = createEmptyBoard();

  // Set up scenario: Player has 3 in a row at row 0, but CPU's piece is blocking at position (0,3)
  // Under CPU's piece at (0,3) is a player piece
  board[0][0] = [{ size: 2, owner: 'player1' }];
  board[0][1] = [{ size: 2, owner: 'player1' }];
  board[0][2] = [{ size: 2, owner: 'player1' }];
  board[0][3] = [
    { size: 1, owner: 'player1' },  // Hidden player piece
    { size: 3, owner: 'player2' }   // CPU blocking piece on top
  ];

  // CPU also has a piece elsewhere
  board[1][1] = [{ size: 4, owner: 'player2' }];

  console.log('Board state:');
  console.log('Row 0: P1(2) P1(2) P1(2) [P1(1),P2(3)]');
  console.log('Row 1: ---   P2(4) ---   ---');
  console.log();
  console.log('If CPU moves the piece from (0,3), player1 wins immediately');
  console.log();

  // Test the defensive check
  const move = {
    type: 'board',
    fromRow: 0,
    fromCol: 3,
    toRow: 2,
    toCol: 2,
    pieceSize: 3
  };

  console.log('Testing move: (0,3) -> (2,2)');
  const isDangerous = checkDefensivePostAbandonment(board, move, 'player2');

  if (isDangerous) {
    console.log('✅ Correctly identified as dangerous move');
  } else {
    console.log('❌ Failed to identify dangerous move');
  }

  console.log();
  console.log('Board after move (simulated):');
  const testBoard = board.map(row => row.map(cell => [...cell]));
  testBoard[0][3] = [{ size: 1, owner: 'player1' }];  // Remove CPU piece, reveal player piece
  const winner = checkWinner(testBoard);
  console.log(`Winner: ${winner || 'none'}`);

  return isDangerous;
};

testScenario();
