# 恐竜アイコン変更計画書

## 概要
現在の球体（ゴブレット）デザインを、子供向けの恐竜アイコンに変更する。

## 現状
- **ファイル**: `src/Gobblet.jsx` の `Piece` コンポーネント（50-86行目）
- **描画方式**: CSS `radial-gradient` による球体
- **サイズ**: 1-4の4段階
- **色**: プレイヤー=赤系、CPU=青系

## 変更後のデザイン

### サイズと恐竜の対応
| サイズ | 恐竜 | 特徴 |
|--------|------|------|
| 4（最大）| ブラキオサウルス | 長い首、優雅な印象 |
| 3（大）| ティラノサウルス | 大きな頭、牙と鉤爪 |
| 2（中）| ステゴサウルス | 背中のプレート、尻尾のスパイク |
| 1（小）| たまご | 斑点模様の卵 |

### カラーパレット
| プレイヤー | 色 | CPU | 色 |
|------------|-----|-----|-----|
| メイン | `#FF6B6B`（コーラルレッド）| メイン | `#5DADE2`（スカイブルー）|
| お腹 | `#FFB3B3` | お腹 | `#AED6F1` |
| 輪郭 | `#2c2c2c` | 輪郭 | `#2c2c2c` |

## 実装ステップ

### Step 1: 恐竜SVGコンポーネントの作成
`src/DinosaurIcons.jsx` を新規作成し、4種類の恐竜SVGを定義。

```jsx
// 各恐竜は mainColor と bellyColor を props で受け取る
export const Brachiosaurus = ({ mainColor, bellyColor }) => { ... }
export const TRex = ({ mainColor, bellyColor }) => { ... }
export const Stegosaurus = ({ mainColor, bellyColor }) => { ... }
export const DinoEgg = ({ mainColor, bellyColor }) => { ... }
```

### Step 2: Pieceコンポーネントの修正
`src/Gobblet.jsx` の `Piece` コンポーネントを修正:

1. 恐竜コンポーネントをインポート
2. サイズに応じて適切な恐竜を選択
3. オーナーに応じて色を設定
4. 選択状態の表示（黄色の枠など）を維持

```jsx
const Piece = ({ size, owner, isTop, onClick, isSelected, cellSize }) => {
  const colors = owner === 'player'
    ? { main: '#FF6B6B', belly: '#FFB3B3' }
    : { main: '#5DADE2', belly: '#AED6F1' };

  const DinoComponent = {
    4: Brachiosaurus,
    3: TRex,
    2: Stegosaurus,
    1: DinoEgg,
  }[size];

  return (
    <div onClick={onClick} style={{ ... }}>
      <DinoComponent mainColor={colors.main} bellyColor={colors.belly} />
    </div>
  );
};
```

### Step 3: スタイル調整
- 選択時のハイライト効果を恐竜用に調整
- zIndexは既存のサイズベースを維持
- クリック可能なカーソル表示を維持

## ファイル変更一覧
| ファイル | 操作 |
|----------|------|
| `src/DinosaurIcons.jsx` | 新規作成 |
| `src/Gobblet.jsx` | Pieceコンポーネント修正 |

## 注意点
- viewBox="0 0 30 30" を統一して使用
- stroke-width="1.5" で輪郭を描画
- 各恐竜の特徴（牙、プレート、首など）を維持

## 確認事項
この計画で進めてよろしいですか？
