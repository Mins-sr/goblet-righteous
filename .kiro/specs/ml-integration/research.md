# 機械学習統合研究調査レポート

**調査日**: 2025-12-29
**対象プロジェクト**: Gobblet-Righteous (4×4 ボードゲーム)
**現在のAI**: Minimax + Alpha-Beta剪定 (深さ3-4)

---

## 1. エグゼクティブサマリー

Gobbletゲームに機械学習を統合するための調査を実施した。現在のMinimax AIは十分な強度を持つが、以下の領域でML導入のメリットがある：

| アプローチ | 実装難易度 | 期待効果 | 推奨度 |
|-----------|----------|---------|--------|
| **ニューラル評価関数** | 中 | 高 | ★★★★★ |
| **AlphaZero型強化学習** | 高 | 最高 | ★★★★☆ |
| **パターン認識モデル** | 低 | 中 | ★★★☆☆ |
| **難易度適応システム** | 中 | 高 | ★★★★☆ |

**最優先推奨**: ニューラル評価関数による`evaluateBoard()`の強化

---

## 2. 現状分析

### 2.1 現在のAI実装（`src/Gobblet.jsx`）

```
難易度レベル:
├── Easy: ランダム選択
├── Normal: ヒューリスティック評価（evaluateBoard）
├── Hard: Minimax 深さ3 + Alpha-Beta剪定
└── Ultra Hard: Minimax 深さ4 + 拡張評価
```

**現在の評価関数（`evaluateBoard`）**:
- ライン評価（行/列/対角線）
- 脅威カウント
- 中央制御ボーナス
- ランダムノイズ（多様性のため）

**制限事項**:
- 手動でチューニングされた重み付け
- 複雑な盤面パターンの認識が限定的
- 長期的戦略の評価が困難

### 2.2 技術スタック

```
フロントエンド専用:
├── React 19.2.0
├── Vite 7.2.4
├── バックエンドなし
├── 完全クライアント実行
└── GitHub Pages デプロイ
```

**ML統合の制約**:
- サーバー処理なし → ブラウザ内推論必須
- バンドルサイズ制限（現在 ~206KB）
- モバイルデバイス対応必須

---

## 3. ML統合アプローチ

### 3.1 アプローチA: ニューラル評価関数（推奨）

**概要**: 現在の`evaluateBoard()`をニューラルネットワークで置き換え

**アーキテクチャ**:
```
入力層: 盤面状態ベクトル
  ├── 16セル × 4層（スタック深さ）× 3状態（空/プレイヤー/CPU）
  ├── 各プレイヤーのスタック残り
  └── 合計: ~200次元

隠れ層:
  ├── Dense 128 units (ReLU)
  ├── Dense 64 units (ReLU)
  └── Dense 32 units (ReLU)

出力層: 評価スコア（-1 to 1）
```

**推奨フレームワーク**:

| フレームワーク | バンドルサイズ | WebGPU | 推奨度 |
|--------------|--------------|--------|--------|
| **TensorFlow.js** | ~400KB (gzip) | 対応 | ★★★★★ |
| **ONNX Runtime Web** | ~300KB (gzip) | 対応 | ★★★★☆ |
| **Brain.js** | ~100KB | 非対応 | ★★★☆☆ |

**実装例**:
```javascript
// TensorFlow.js を使用した評価関数
import * as tf from '@tensorflow/tfjs';

const model = await tf.loadLayersModel('/models/gobblet-eval/model.json');

const neuralEvaluateBoard = (board, owner) => {
  const input = boardToTensor(board);  // 盤面をテンソルに変換
  const prediction = model.predict(input);
  return prediction.dataSync()[0];
};
```

**メリット**:
- 既存のMinimax構造を維持
- 漸進的な導入が可能
- 学習データの収集が容易

**デメリット**:
- バンドルサイズ増加
- 初期ロード時間の増加

### 3.2 アプローチB: AlphaZero型強化学習

**概要**: 自己対戦による強化学習でAIを訓練

**アーキテクチャ**:
```
ニューラルネットワーク (Policy + Value Network)
├── 入力: 盤面状態
├── Policy Head: 次の手の確率分布
└── Value Head: 勝率予測

モンテカルロ木探索 (MCTS)
├── シミュレーション回数: 100-800
├── UCB探索
└── ニューラルネット評価でガイド
```

**参考実装**:
- [AlphaZero JavaScript実装](https://towardsdatascience.com/alphazero-a-novel-reinforcement-learning-algorithm-deployed-in-javascript-56018503ad18)
- [Simple Alpha Zero](https://suragnair.github.io/posts/alphazero.html)

**訓練プロセス**:
1. 自己対戦でゲームを生成（~10,000ゲーム）
2. 勝敗結果でネットワークを更新
3. 反復して強化

**メリット**:
- 人間の知識なしで超人的強度達成可能
- ゲーム固有の戦略を自動発見
- 最も強いAIを実現可能

**デメリット**:
- 訓練に大量の計算資源が必要
- 実装が複雑
- 初期開発コストが高い

### 3.3 アプローチC: パターン認識モデル

**概要**: 特定の盤面パターン（定石、危険形）を学習

**用途**:
- 開幕定石の認識
- 危険なフォーク形成の検出
- 勝ちパターンの早期認識

**実装**:
```javascript
const patterns = await loadPatternModel();

const detectThreats = (board) => {
  const features = extractFeatures(board);
  return patterns.predict(features);
};
```

**メリット**:
- 軽量モデルで実装可能
- 解釈可能性が高い
- 既存ロジックとの併用が容易

**デメリット**:
- パターンの収集・ラベリングが必要
- 汎用性が限定的

### 3.4 アプローチD: 難易度適応システム

**概要**: プレイヤーのスキルレベルに応じてAI強度を動的調整

**方法**:
```
プレイヤー分析:
├── 勝率の追跡
├── 平均手数
├── ミスの頻度（脅威見逃し等）
└── 反応時間

適応ロジック:
├── 勝率 > 70% → 難易度上昇
├── 勝率 < 30% → 難易度低下
└── ブロック失敗が多い → ヒント表示
```

**メリット**:
- ユーザー体験の向上
- 継続的なエンゲージメント
- 教育的価値

**デメリット**:
- 追加のデータ収集が必要
- プライバシー考慮（LocalStorage使用）

---

## 4. 技術詳細

### 4.1 TensorFlow.js統合

**インストール**:
```bash
npm install @tensorflow/tfjs
```

**モデルの最適化**:
```javascript
// 量子化でモデルサイズ削減
import { quantize } from '@tensorflow/tfjs-converter';

const quantizedModel = await quantize(model, {
  type: 'uint8'  // float32 → uint8 で ~75%削減
});
```

**推論パフォーマンス**:
| バックエンド | 推論時間 | 推奨環境 |
|------------|---------|---------|
| WebGL | ~5ms | デスクトップ |
| WebGPU | ~2ms | Chrome 113+ |
| WASM | ~15ms | モバイル/フォールバック |
| CPU | ~50ms | 最終フォールバック |

### 4.2 ONNX Runtime Web統合

**インストール**:
```bash
npm install onnxruntime-web
```

**使用例**:
```javascript
import * as ort from 'onnxruntime-web';

const session = await ort.InferenceSession.create('/models/gobblet.onnx');

const evaluate = async (boardState) => {
  const tensor = new ort.Tensor('float32', boardState, [1, 200]);
  const results = await session.run({ input: tensor });
  return results.output.data[0];
};
```

**WebGPU対応** (2024年以降):
```javascript
// WebGPU バックエンドを優先
const session = await ort.InferenceSession.create('/models/gobblet.onnx', {
  executionProviders: ['webgpu', 'wasm']
});
```

### 4.3 盤面のベクトル化

**現在の盤面構造**:
```javascript
board[4][4][] // 4×4 各セルにスタック
// 各駒: { size: 1-4, owner: 'player'|'cpu' }
```

**提案するベクトル化**:
```javascript
const boardToVector = (board, stacks) => {
  const vector = [];

  // 盤面状態 (16セル × 4層 × 2チャネル)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = board[row][col];
      for (let layer = 0; layer < 4; layer++) {
        const piece = cell[layer] || null;
        vector.push(piece?.owner === 'player' ? piece.size / 4 : 0);
        vector.push(piece?.owner === 'cpu' ? piece.size / 4 : 0);
      }
    }
  }

  // スタック残り (各プレイヤー3スタック × 4サイズ)
  for (const stack of stacks.player) {
    for (let size = 1; size <= 4; size++) {
      vector.push(stack.includes(size) ? 1 : 0);
    }
  }
  for (const stack of stacks.cpu) {
    for (let size = 1; size <= 4; size++) {
      vector.push(stack.includes(size) ? 1 : 0);
    }
  }

  return new Float32Array(vector);
};
```

---

## 5. データ収集戦略

### 5.1 既存ログの活用

現在の実装には`gameLog`状態が存在:
```javascript
const [gameLog, setGameLog] = useState([]);
// 各手が記録される: formatMove(move, owner)
```

**拡張提案**:
```javascript
const enhancedLog = {
  moves: gameLog,
  boardStates: [],     // 各手後の盤面状態
  winner: null,        // 最終結果
  difficulty: 'hard',  // 使用難易度
  timestamp: Date.now()
};
```

### 5.2 自己対戦データ生成

```javascript
// Node.jsスクリプトで大量データ生成
const generateTrainingData = async (numGames) => {
  const data = [];

  for (let i = 0; i < numGames; i++) {
    const game = simulateGame('ultrahard', 'ultrahard');
    data.push(...extractTrainingExamples(game));
  }

  return data;
};

// 既存のtest-ai-battle.jsを拡張可能
```

### 5.3 人間プレイデータ

**オプトイン収集**:
```javascript
// ゲーム終了時に匿名データ送信（オプション）
const submitGameData = async (gameLog, winner) => {
  if (!userConsent) return;

  await fetch('/api/games', {
    method: 'POST',
    body: JSON.stringify({ gameLog, winner })
  });
};
```

---

## 6. 実装ロードマップ

### Phase 1: 基盤準備（推奨開始点）

```
タスク:
├── [ ] TensorFlow.js 依存追加
├── [ ] 盤面ベクトル化ユーティリティ作成
├── [ ] 自己対戦データ生成スクリプト拡張
└── [ ] 訓練データ形式の定義
```

### Phase 2: モデル開発

```
タスク:
├── [ ] 評価関数用ニューラルネットワーク設計
├── [ ] Python/Node.jsで訓練パイプライン構築
├── [ ] 自己対戦データで訓練
├── [ ] モデルの量子化・最適化
└── [ ] TensorFlow.js形式でエクスポート
```

### Phase 3: 統合・テスト

```
タスク:
├── [ ] ブラウザでのモデルロード実装
├── [ ] neuralEvaluateBoard() 関数実装
├── [ ] A/Bテスト（Minimax vs Neural）
├── [ ] パフォーマンス最適化
└── [ ] モバイルテスト
```

### Phase 4: 拡張（オプション）

```
タスク:
├── [ ] AlphaZero型MCTSの実装
├── [ ] 難易度適応システム
├── [ ] オンライン学習（フェデレーテッドラーニング）
└── [ ] 説明可能AI機能
```

---

## 7. 推奨事項

### 7.1 短期（すぐ始められる）

1. **TensorFlow.jsの導入テスト**
   - 小さなモデルでロード・推論を検証
   - バンドルサイズへの影響を測定

2. **訓練データの収集開始**
   - `test-ai-battle.js`を拡張
   - 1,000ゲーム以上のデータを生成

### 7.2 中期

1. **ニューラル評価関数の開発**
   - 最も費用対効果が高い
   - 既存アーキテクチャとの統合が容易

2. **新しい難易度レベル「AI」の追加**
   - ML搭載AIを別オプションとして提供
   - 従来のMinimax AIも維持

### 7.3 長期

1. **AlphaZero型アプローチの検討**
   - 計算資源が確保できれば最強AI実現可能
   - 教育・研究目的にも価値あり

---

## 8. リスクと対策

| リスク | 影響 | 対策 |
|-------|-----|------|
| バンドルサイズ増加 | ロード時間悪化 | モデル量子化、遅延ロード |
| モバイル性能 | 推論遅延 | WASMバックエンド、軽量モデル |
| 訓練データ不足 | モデル精度低下 | 自己対戦で大量生成 |
| 過学習 | 特定パターンに弱い | データ拡張、正則化 |

---

## 9. 参考リソース

### 公式ドキュメント
- [TensorFlow.js](https://www.tensorflow.org/js)
- [ONNX Runtime Web](https://onnxruntime.ai/)

### チュートリアル・実装例
- [AlphaZero in JavaScript](https://towardsdatascience.com/alphazero-a-novel-reinforcement-learning-algorithm-deployed-in-javascript-56018503ad18)
- [TensorFlow Board Game Reference App](https://blog.tensorflow.org/2021/10/building-board-game-app-with-tensorflow.html)
- [Snake AI with TensorFlow.js](https://www.docker.com/blog/leveraging-docker-with-tensorflow/)

### GitHub リポジトリ
- [blanyal/alpha-zero](https://github.com/blanyal/alpha-zero) - AlphaZero実装例
- [Simple Alpha Zero](https://suragnair.github.io/posts/alphazero.html) - 簡易実装

### 2024-2025年の動向
- [ONNX Runtime Web with WebGPU](https://opensource.microsoft.com/blog/2024/02/29/onnx-runtime-web-unleashes-generative-ai-in-the-browser-using-webgpu)

---

## 10. 結論

Gobbletゲームへの機械学習統合は技術的に実現可能であり、特に**ニューラル評価関数アプローチ**が最も推奨される。このアプローチは：

- 既存のMinimaxアーキテクチャを活かせる
- 漸進的な導入が可能
- ブラウザ完結型を維持できる
- 訓練データの収集が既存インフラで可能

次のステップとして、TensorFlow.jsの導入テストと訓練データ収集を開始することを推奨する。
