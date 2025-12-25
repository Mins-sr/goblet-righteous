# Hard以上のアルゴリズム強化 - GitHub Issues

以下のissueをGitHubで作成してください。

---

## Issue 1: React状態管理の修正（useRef活用）

**優先度**: 高 | **難易度**: 低

### 概要
CPU思考時にReactのクロージャ問題で古い状態を参照してしまい、危険な手を選択するバグを修正する。

### 問題の詳細
- `getCpuMove()`呼び出し時点で`board`や`stacks`が古い参照を指している
- プレイヤーの手適用直後、React状態更新完了前にCPU思考が開始される可能性

### 解決策
```javascript
// useRefで最新状態を保持
const boardRef = useRef(board);
const stacksRef = useRef(stacks);

useEffect(() => {
  boardRef.current = board;
  stacksRef.current = stacks;
}, [board, stacks]);

// getCpuMoveでrefを使用
const getCpuMove = useCallback(() => {
  const currentBoard = boardRef.current;
  const currentStacks = stacksRef.current;
  // ...
}, []); // 依存配列は空でOK
```

### 期待効果
- バグ修正で安定性向上
- 常に最新の盤面状態でCPUが思考

---

## Issue 2: 防御拠点放棄チェックの追加

**優先度**: 高 | **難易度**: 中

### 概要
駒を動かした結果、守っていたラインが崩れるケースを検出する機能を追加する。

### 問題の詳細
現在の`isSafeMove`は「この手を打った後に負けるか」のみをチェック。
**駒を動かした結果、守っていたラインが崩れる**ケースを検出していない。

例：A2にCPUの駒があり、その下にプレイヤーの駒が隠れている場合、A2の駒を動かすとプレイヤーの駒が現れてラインが揃う可能性がある。

### 解決策
```javascript
const checkDefensivePostAbandonment = (board, move) => {
  // 駒を動かす場合のみ（スタックからではない）
  if (move.fromRow === null) return false;

  const fromCell = board[move.fromRow][move.fromCol];
  // 動かす駒の下に敵の駒があるか確認
  const hiddenPieces = fromCell.slice(0, -1);
  const enemyUnderneath = hiddenPieces.some(p => p.owner === 'player');

  if (enemyUnderneath) {
    // その敵駒が現れた時、ラインが揃うかチェック
    // → 揃うなら危険な手
  }
  return false;
};
```

### 期待効果
- 致命的なミス（守りの駒を動かして負ける）を防止
- 隠れた駒を意識した戦略的判断

---

## Issue 3: 評価関数の強化（Gobble戦術評価）

**優先度**: 中 | **難易度**: 中

### 概要
評価関数に覆い被せ（Gobble）の戦術的価値、隠れた駒の評価、機動性、フォーク生成可能性を追加する。

### 現状
現在の評価関数は以下を評価：
- ライン評価（行、列、斜め）
- フォーク検出
- 中央・コーナー制御
- 駒サイズ

### 追加する評価項目

#### A) 覆い被せ可能性の評価
```javascript
const evaluateGobblePotential = (board, owner) => {
  let score = 0;
  for (const cell of allCells) {
    const topPiece = getTopPiece(cell);
    if (topPiece && topPiece.owner !== owner) {
      // 自分がより大きな駒を持っているか
      if (canGobble(owner, topPiece.size)) {
        score += 15; // 覆い被せられる可能性
      }
    }
  }
  return score;
};
```

#### B) 隠れた駒の戦術価値
自分の駒が相手の駒の下に隠れている場合の評価

#### C) 機動性（動かせる駒の数）
選択肢が多いほど有利

#### D) フォーク生成可能性
次の手でフォークを作れる可能性の評価

### 期待効果
- 判断精度向上
- Gobbletゲーム特有の戦術をより深く理解

---

## Issue 4: Move Ordering（候補手ソート）の実装

**優先度**: 中 | **難易度**: 低

### 概要
α-β枝刈りの効率を向上させるため、候補手を優先度順にソートする。

### 背景
α-β枝刈りは「良い手から探索する」と枝刈りが多く発生し、効率が大幅に向上する。
現在は候補手をソートせずに探索しているため、枝刈りの効果が限定的。

### 解決策
```javascript
const orderMoves = (moves, board, stacks, owner) => {
  return moves.map(move => {
    let priority = 0;

    // 勝ち手は最優先
    const { newBoard } = applyMove(board, stacks, move, owner);
    if (checkWinner(newBoard) === owner) priority += 10000;

    // ブロック手は高優先
    if (isBlockingMove(move, board)) priority += 500;

    // 中央への配置は優先
    if (isCenterCell(move.toRow, move.toCol)) priority += 50;

    // 大きな駒での覆い被せは優先
    if (move.fromRow !== null && move.pieceSize >= 3) priority += 30;

    return { move, priority };
  })
  .sort((a, b) => b.priority - a.priority)
  .map(x => x.move);
};
```

### 期待効果
- 探索効率2-3倍向上
- 同じ深さでより多くの手を評価可能

---

## Issue 5: Transposition Table（局面表）の導入

**優先度**: 中 | **難易度**: 中

### 概要
同じ局面を複数回評価しないようにキャッシュする仕組みを導入する。

### 背景
Minimaxでは、異なる手順で同じ局面に到達することがある。
同じ局面の評価結果をキャッシュすることで、重複計算を避けられる。

### 解決策
```javascript
const transpositionTable = new Map();

const getBoardHash = (board) => {
  // 盤面をハッシュ化（簡易版）
  return JSON.stringify(board);
};

const minimaxWithTT = (board, stacks, depth, isMax, alpha, beta) => {
  const hash = getBoardHash(board) + depth + isMax;

  if (transpositionTable.has(hash)) {
    return transpositionTable.get(hash);
  }

  const result = minimax(board, stacks, depth, isMax, alpha, beta);
  transpositionTable.set(hash, result);
  return result;
};
```

### 注意点
- ハッシュ衝突の可能性（Zobrist Hashingの検討）
- メモリ使用量の管理（LRUキャッシュの検討）
- 手番ごとにテーブルをクリアするか検討

### 期待効果
- 探索効率向上
- 特に終盤で効果大

---

## Issue 6: Iterative Deepening（反復深化）の実装

**優先度**: 中 | **難易度**: 中

### 概要
時間制限内で可能な限り深く探索する反復深化アルゴリズムを実装する。

### 背景
現在は固定深さ（Hard=3, Ultra Hard=4）で探索。
反復深化を使うと、時間内で可能な限り深く探索でき、時間管理も柔軟になる。

### 解決策
```javascript
const getCpuMoveWithIterativeDeepening = (board, stacks, timeLimit = 800) => {
  const startTime = Date.now();
  let bestMove = null;
  let depth = 1;

  while (Date.now() - startTime < timeLimit * 0.8) {
    const result = searchAtDepth(board, stacks, depth);
    bestMove = result.move;
    depth++;

    // 勝ち確定なら早期終了
    if (result.score >= 9000) break;
  }

  console.log(`Searched to depth ${depth - 1}`);
  return bestMove;
};
```

### メリット
- 時間効率最適化
- 浅い探索結果がMove Orderingに使える
- 勝ち確定時に早期終了可能

### 期待効果
- 時間内で最大限の深さを探索
- 局面によって動的に探索深さが変わる

---

## Issue 7: 戦術パターン認識の追加

**優先度**: 低 | **難易度**: 高

### 概要
特定の勝ちパターン/危険パターンを認識し、評価に反映する。

### 背景
Gobbletには特有の戦術パターンが存在する。
これらを認識することで、より強いAIを実現できる。

### 認識すべきパターン

#### 勝ちパターン
1. **L字フォーク**: コーナー + 隣接2マスで3方向の脅威を作る
2. **中央制圧**: 中央4マス中3マス以上を取ると優位
3. **対角線支配**: 両方の対角線に駒を配置

#### 危険パターン
1. **覆い被せトラップ**: 相手が意図的に小さい駒を置いて誘う
2. **隠し駒の罠**: 覆い被せた下に相手の勝ち筋がある
3. **フォーク準備**: 相手が次手でフォークを作れる状態

### 実装案
```javascript
const recognizePatterns = (board, owner) => {
  let score = 0;

  // L字フォーク検出
  score += detectLShapeFork(board, owner);

  // 中央制圧検出
  score += detectCenterDomination(board, owner);

  // 覆い被せトラップ検出
  score -= detectGobbleTrap(board, owner);

  return score;
};
```

### 期待効果
- 特殊局面での判断力向上
- 人間のような戦術的思考

---

## 実装優先順位まとめ

| 優先度 | Issue | 期待効果 | 難易度 |
|--------|-------|----------|--------|
| 1 | React状態管理修正 | バグ修正で安定性向上 | 低 |
| 2 | 防御拠点放棄チェック | 致命的ミス防止 | 中 |
| 3 | 評価関数強化 | 判断精度向上 | 中 |
| 4 | Move Ordering | 探索効率2-3倍向上 | 低 |
| 5 | Transposition Table | 探索効率向上 | 中 |
| 6 | Iterative Deepening | 時間効率最適化 | 中 |
| 7 | 戦術パターン認識 | 特殊局面の強化 | 高 |
