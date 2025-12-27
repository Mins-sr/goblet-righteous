# プレイヤー手持ち駒エリアとメッセージバー間マージン調整オプション 要求仕様書

## 1. 概要

### 1.1 目的

プレイヤー手持ち駒エリア（YOU）と下部メッセージバー（"YOUR TURN"等）の間のマージンを、ユーザーがオプション画面から調整可能にする。

### 1.2 背景

現在、以下のスペーシングオプションが実装されている：
- `headerSpacing`: ヘッダー ↔ CPU手持ち駒エリア間
- `topSpacing`: CPU手持ち駒エリア ↔ ゲームボード間
- `bottomSpacing`: ゲームボード ↔ プレイヤー手持ち駒エリア間

しかし、プレイヤー手持ち駒エリアとメッセージバーの間のマージン（現在6pxで固定）は調整できない。ユーザーがレイアウトの密度をより細かくカスタマイズできるよう、この部分も可変にする。

### 1.3 対象範囲

![添付図の赤線部分]

```
┌─────────────────────────────┐
│  ヘッダー (GOBBLET ★★)     │
├─────────────────────────────┤
│  CPU手持ち駒エリア (CPU)    │
│                             │
│     [headerSpacing制御]     │
│                             │
├─────────────────────────────┤
│  ゲームボード (4×4)         │
│                             │
│     [topSpacing制御]        │
│                             │
├─────────────────────────────┤
│  プレイヤー手持ち駒 (YOU)   │  ← Player StackArea
├─────────────────────────────┤
│  【この部分のマージン】 ← 調整対象 (messageSpacing) │
├─────────────────────────────┤
│  YOUR TURN / 勝敗表示       │  ← Message Bar
├─────────────────────────────┤
│  [Play Again] [Menu]        │  ← Button Group
└─────────────────────────────┘
```

---

## 2. 要求仕様

### 2.1 機能要件

#### FR-001: メッセージマージンの可変制御

| 項目 | 内容 |
|------|------|
| 要件ID | FR-001 |
| 優先度 | 高 |
| 説明 | プレイヤー手持ち駒エリア（YOU）とメッセージバー間のマージンをユーザーが調整可能にする |
| 設定範囲 | -6px 〜 +30px |
| ベースライン | 6px（オフセット値） |
| 初期値 | 0px（実効値: 6px） |
| 受入条件 | オプション画面のスライダーで設定値を変更でき、即座にプレビューに反映されること |

#### FR-002: 設定値の永続化

| 項目 | 内容 |
|------|------|
| 要件ID | FR-002 |
| 優先度 | 高 |
| 説明 | 設定したマージン値をLocalStorageに保存し、リロード後も復元すること |
| ストレージキー | `gobblet-spacing-options` （既存キーを拡張） |
| 保存形式 | `{ headerSpacing, topSpacing, bottomSpacing, messageSpacing }` のJSON形式 |
| 受入条件 | ページをリロードしても設定値が維持されること |

#### FR-003: 他のスペーシングオプションとの独立性

| 項目 | 内容 |
|------|------|
| 要件ID | FR-003 |
| 優先度 | 中 |
| 説明 | `messageSpacing`の変更が他のスペーシング設定（header/top/bottom）に影響を与えないこと |
| 受入条件 | 各スペーシング設定が独立して動作すること |

#### FR-004: オプション画面での設定UI

| 項目 | 内容 |
|------|------|
| 要件ID | FR-004 |
| 優先度 | 高 |
| 説明 | 既存のオプション画面に「YOU ↔ Message」スライダーを追加 |
| 表示位置 | 既存の「Board ↔ YOU」スライダーの下 |
| ラベル | "YOU ↔ Message" または "プレイヤー ↔ メッセージ" |
| スライダー範囲 | -6 〜 +30 |
| 数値表示 | 実効値を表示（例: スライダー値0 → "6px"、値+10 → "16px"） |
| 受入条件 | 既存UIと統一されたデザインで、直感的に操作できること |

### 2.2 非機能要件

#### NFR-001: レスポンシブ対応

| 項目 | 内容 |
|------|------|
| 要件ID | NFR-001 |
| 説明 | 全ての画面サイズ（320px〜428px幅）で正しく動作すること |
| 受入条件 | iPhone SE〜iPhone 14 Pro Maxで検証済みであること |

#### NFR-002: 既存機能への影響なし

| 項目 | 内容 |
|------|------|
| 要件ID | NFR-002 |
| 説明 | ゲームプレイ、ボードサイズ計算、その他UI要素に影響を与えないこと |
| 受入条件 | 既存の全機能が正常動作すること |

#### NFR-003: パフォーマンス

| 項目 | 内容 |
|------|------|
| 要件ID | NFR-003 |
| 説明 | スライダー操作時のプレビュー更新が滑らかであること |
| 目標 | スライダー変更から表示更新まで50ms以内 |

---

## 3. 設計方針

### 3.1 設定データ構造の拡張

#### 現在の設定オブジェクト

```javascript
const DEFAULT_SPACING = {
  headerSpacing: 0,   // Adds to 6px baseline
  topSpacing: 0,      // Adds to 10px baseline
  bottomSpacing: 0,   // Adds to 20px baseline
};
```

#### 拡張後の設定オブジェクト

```javascript
const MESSAGE_SPACING_OFFSET = 6;  // YOU↔Message spacing baseline (6px)

const DEFAULT_SPACING = {
  headerSpacing: 0,    // Adds to 6px baseline
  topSpacing: 0,       // Adds to 10px baseline
  bottomSpacing: 0,    // Adds to 20px baseline
  messageSpacing: 0,   // Adds to 6px baseline ← 新規追加
};
```

### 3.2 レイアウト構造の変更

#### 変更前（現在の実装）

```jsx
<div style={{ flex: 'none' }}>
  <StackArea
    // ... プレイヤー手持ち駒エリア
    label="YOU"
  />
</div>

{/* マージンが固定値 */}
<div style={{
  flex: 'none',
  marginTop: '6px',  // ← ハードコード
  padding: '6px 14px',
  background: '...',
}}>
  <p>{message}</p>  {/* "YOUR TURN" 等 */}
</div>
```

#### 変更後（可変マージン対応）

```jsx
<div style={{ flex: 'none' }}>
  <StackArea
    // ... プレイヤー手持ち駒エリア
    label="YOU"
  />
</div>

{/* スペーサー要素で可変マージンを実現 */}
{messageSpacing + MESSAGE_SPACING_OFFSET > 0 && (
  <div style={{
    flex: 'none',
    height: `${messageSpacing + MESSAGE_SPACING_OFFSET}px`
  }} />
)}

{/* メッセージバー（marginTopを削除） */}
<div style={{
  flex: 'none',
  // marginTop: '6px', ← 削除（スペーサーで制御）
  padding: '6px 14px',
  background: '...',
}}>
  <p>{message}</p>
</div>
```

### 3.3 スペーシング制御方式

既存の実装に合わせて**スペーサー要素方式**を採用：

| 方式 | 説明 | 採用理由 |
|------|------|---------|
| **スペーサー要素方式** | 専用のdiv要素でスペースを確保 | 既存のtopSpacing/bottomSpacingと一貫性がある |
| margin方式 | メッセージバーに直接marginTopを設定 | ✗ 既存パターンと異なる |

### 3.4 オプション画面UI構成

既存のスライダーコンポーネントを再利用：

```jsx
<div style={{ marginBottom: '20px' }}>
  <label style={{ ... }}>
    YOU ↔ Message: {messageSpacing + MESSAGE_SPACING_OFFSET}px
  </label>
  <input
    type="range"
    min={-6}
    max={30}
    value={messageSpacing}
    onChange={(e) => setMessageSpacing(Number(e.target.value))}
    style={{ ... }}
  />
</div>
```

### 3.5 プレビュー表示の更新

オプション画面のプレビューエリアに、新しいスペーシングを反映：

```jsx
{/* プレビュー内のYOU手持ち駒エリア */}
<div style={{ /* YOU StackArea preview */ }} />

{/* messageSpacingプレビュー */}
{messageSpacing + MESSAGE_SPACING_OFFSET > 0 && (
  <div style={{
    height: `${(messageSpacing + MESSAGE_SPACING_OFFSET) * 0.5}px`,  // スケール調整
    background: 'rgba(212, 165, 116, 0.2)',
    borderTop: '1px dashed rgba(212, 165, 116, 0.4)',
    borderBottom: '1px dashed rgba(212, 165, 116, 0.4)',
  }} />
)}

{/* メッセージバープレビュー */}
<div style={{ /* Message bar preview */ }} />
```

---

## 4. テスト要件

### 4.1 テストケース

| ID | テスト内容 | 期待結果 |
|----|-----------|---------|
| TC-001 | messageSpacingを0px（デフォルト）に設定 | YOU手持ち駒エリアとメッセージバーの間が6px |
| TC-002 | messageSpacingを-6px（最小値）に設定 | 要素間が密着（0px） |
| TC-003 | messageSpacingを+30px（最大値）に設定 | 要素間距離が36px（6+30） |
| TC-004 | messageSpacingを+10pxに設定 | 要素間距離が16px±1px |
| TC-005 | 設定値のLocalStorage保存 | リロード後も設定が維持される |
| TC-006 | オプション画面のプレビュー | スライダー変更が即座にプレビューに反映される |
| TC-007 | 他のスペーシング設定との独立性 | messageSpacing変更がheader/top/bottomに影響しない |
| TC-008 | 小画面（320px幅）での動作 | レイアウト崩れなし |
| TC-009 | 大画面（428px幅）での動作 | レイアウト崩れなし |
| TC-010 | ゲームプレイ中の動作 | 駒の選択・配置が正常に機能する |

### 4.2 検証方法

1. **ブラウザ開発者ツール**でComputed Styleを確認
   - スペーサー要素の `height` が設定値と一致するか
   - メッセージバーの `marginTop` が削除されているか

2. **実機テスト**（iOS Safari）で視覚的に確認
   - 各設定値での実際の表示
   - スライダー操作の滑らかさ

3. **LocalStorageの確認**
   - `gobblet-spacing-options` キーのJSON内容
   - リロード後の復元動作

4. **スクリーンショット比較**
   - 設定値ごとのレイアウト差分を視覚的に検証

---

## 5. 実装手順

### Phase 1: データ構造の拡張
1. `MESSAGE_SPACING_OFFSET` 定数を追加
2. `DEFAULT_SPACING` に `messageSpacing: 0` を追加
3. LocalStorageの読み込み/保存処理を拡張

### Phase 2: レイアウト構造の変更
1. メッセージバーの `marginTop: '6px'` を削除
2. YOU手持ち駒エリアとメッセージバーの間にスペーサー要素を挿入
3. スペーサーの高さを `messageSpacing + MESSAGE_SPACING_OFFSET` で制御

### Phase 3: オプション画面UI追加
1. 「YOU ↔ Message」スライダーを追加
2. 既存のスライダーと同じスタイルを適用
3. 値変更時の状態更新処理を実装

### Phase 4: プレビュー機能の実装
1. オプション画面のプレビューエリアにmessageSpacingを反映
2. スペーサー部分を視覚的に区別（半透明背景 + 破線ボーダー）

### Phase 5: テスト・微調整
1. 各テストケースの実行
2. レスポンシブ動作の確認
3. パフォーマンスの確認

---

## 6. 制約事項

- 既存のゲームロジックは変更しない
- cellSize計算ロジックは維持する
- LocalStorageのキー名は変更しない（既存データとの互換性維持）
- 他のスペーシング設定（header/top/bottom）に影響を与えない
- バージョン番号の更新は別途検討

---

## 7. 参考情報

### 関連ファイル

| ファイルパス | 説明 |
|------------|------|
| `/home/user/goblet-righteous/src/Gobblet.jsx` | メインコンポーネント（lines 1345-1375に対象箇所） |
| `/home/user/goblet-righteous/docs/specs/board-spacing-fix-spec.md` | スペーシング修正の先行仕様 |
| `/home/user/goblet-righteous/docs/specs/board-subtitle-spacing-spec.md` | 字幕スペース仕様（参考） |

### 現在のコード（Gobblet.jsx lines 1345-1375）

```jsx
{/* Player StackArea */}
<div style={{ flex: 'none' }}>
  <StackArea
    stacks={stacks.player}
    owner="player"
    onStackClick={handleStackClick}
    selectedPiece={selectedPiece}
    isPlayerTurn={currentTurn === 'player'}
    label="YOU"
    cellSize={cellSize}
  />
</div>

{/* Message Bar - 現在marginTop固定 */}
<div style={{
  flex: 'none',
  marginTop: '6px',  // ← この値を可変にする
  padding: '6px 14px',
  background: winner ?
    (winner === 'player' ?
      'linear-gradient(180deg, #2d7a3e, #1f5c2e)' :
      'linear-gradient(180deg, #8b3a3a, #6d2828)') :
    'linear-gradient(180deg, #5d4e37, #4a3f2f)',
  borderRadius: '8px',
  boxShadow: winner ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
}}>
  <p style={{ ... }}>{message}</p>
</div>
```

---

## 8. 承認フロー

| ステップ | 担当 | 期限 |
|---------|------|------|
| 仕様書レビュー | 開発者 | - |
| 設計承認 | プロジェクトオーナー | - |
| 実装 | 開発者 | - |
| テスト | QA | - |
| リリース判定 | プロジェクトオーナー | - |

---

作成日: 2025-12-27
ステータス: ドラフト
前提ドキュメント: board-spacing-fix-spec.md
関連ブランチ: `claude/add-button-margin-option-GGbhH`
