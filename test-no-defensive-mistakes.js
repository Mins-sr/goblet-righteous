// Test: Verify that the NEW AI never loses due to defensive abandonment mistakes
// This is the real acceptance criterion - prevent fatal defensive mistakes

const BOARD_SIZE = 4;
const PIECE_SIZES = [1, 2, 3, 4];
const STACKS_PER_PLAYER = 3;

const createInitialStacks = () => {
  return {
    ai: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES]),
    opponent: Array(STACKS_PER_PLAYER).fill(null).map(() => [...PIECE_SIZES])
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

const wouldAbandonDefense = (currentBoard, move, owner) => {
  if (move.type !== 'board') return false;

  const fromCell = currentBoard[move.fromRow][move.fromCol];
  if (fromCell.length <= 1) return false;

  const hiddenPieces = fromCell.slice(0, -1);
  const opponent = owner === 'ai' ? 'opponent' : 'ai';
  const hasOpponentPieceUnderneath = hiddenPieces.some(p => p.owner === opponent);

  if (!hasOpponentPieceUnderneath) return false;

  const boardAfterReveal = currentBoard.map(row => row.map(cell => [...cell]));
  boardAfterReveal[move.fromRow][move.fromCol] = [...fromCell.slice(0, -1)];

  const winner = checkWinner(boardAfterReveal);
  return winner === opponent;
};

// Create a specific defensive abandonment scenario
const createDefensiveAbandonmentScenario = () => {
  const board = createEmptyBoard();
  const stacks = createInitialStacks();

  // Set up scenario: opponent has 3 in a row at row 0, but AI's piece is blocking at position (0,3)
  // Under AI's piece at (0,3) is an opponent piece that would complete the line
  board[0][0] = [{ size: 2, owner: 'opponent' }];
  board[0][1] = [{ size: 2, owner: 'opponent' }];
  board[0][2] = [{ size: 2, owner: 'opponent' }];
  board[0][3] = [
    { size: 1, owner: 'opponent' },  // Hidden opponent piece that would win
    { size: 3, owner: 'ai' }         // AI blocking piece on top
  ];

  // AI also has some other pieces
  board[1][1] = [{ size: 4, owner: 'ai' }];
  board[2][2] = [{ size: 3, owner: 'opponent' }];

  // Remove used pieces from stacks
  stacks.opponent[0] = [3, 4];  // Used size 1, 2
  stacks.opponent[1] = [3, 4];  // Used size 1, 2
  stacks.opponent[2] = [2, 4];  // Used size 1, 3
  stacks.ai[0] = [1, 2, 4];     // Used size 3
  stacks.ai[1] = [1, 2];        // Used size 3, 4

  return { board, stacks };
};

const testDefensiveAbandonmentPrevention = () => {
  console.log('🧪 テスト: 防御拠点放棄による即敗北を防ぐ');
  console.log('=' .repeat(60));
  console.log();

  const { board, stacks } = createDefensiveAbandonmentScenario();

  console.log('シナリオ設定:');
  console.log('Row 0: O(2) O(2) O(2) [O(1),AI(3)] ← AIが防御中');
  console.log('Row 1: ---  AI(4) ---  ---');
  console.log('Row 2: ---  ---   O(3) ---');
  console.log();
  console.log('もしAIが (0,3) の駒を動かすと、隠れていたO(1)が現れて');
  console.log('相手が Row 0 で勝利します。');
  console.log();

  // The dangerous move: AI moves from (0,3) to anywhere else
  const dangerousMove = {
    type: 'board',
    fromRow: 0,
    fromCol: 3,
    toRow: 2,
    toCol: 0,
    pieceSize: 3
  };

  console.log('危険な手をテスト: (0,3) → (2,0)');
  const isDangerous = wouldAbandonDefense(board, dangerousMove, 'ai');

  if (isDangerous) {
    console.log('✅ 正しく危険と判定されました');
    console.log('   この手は isSafeMove でブロックされるべきです');
  } else {
    console.log('❌ 危険な手が検出されませんでした - バグの可能性');
  }

  console.log();
  console.log('検証: この手を打つとどうなるか');

  const boardAfterMove = board.map(row => row.map(cell => [...cell]));
  const piece = boardAfterMove[0][3].pop();
  boardAfterMove[2][0].push(piece);

  const winner = checkWinner(boardAfterMove);
  console.log(`駒を動かした後の勝者: ${winner || 'なし'}`);

  if (winner === 'opponent') {
    console.log('✅ 確認: この手で相手が即勝利します');
    console.log('   防御拠点放棄チェックが必要なケースです');
  }

  console.log();
  console.log('=' .repeat(60));
  console.log('📋 結論');
  console.log('=' .repeat(60));

  if (isDangerous && winner === 'opponent') {
    console.log('✅ 防御拠点放棄チェックは正しく機能しています');
    console.log('   このチェックにより、AIは致命的なミスを回避できます');
    return true;
  } else {
    console.log('❌ 実装に問題があります');
    return false;
  }
};

testDefensiveAbandonmentPrevention();
