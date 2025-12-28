# Implementation Gap Analysis: responsive-design

## 分析サマリー

本ギャップ分析では、responsive-design機能の要件と既存コードベースの実装状況を調査しました。

**主要な発見事項**:
- ✅ **Phase 1（デバイス検出・ブレークポイント）は80%完了**: `useResponsive.js`と`calculations.js`が既に実装済み
- ✅ **Phase 2（動的スペーシング）は70%完了**: `calculateFixedHeight()`関数が実装済みだが、一部の要件未対応
- ❌ **Phase 3（横向きモード対応）は未実装**: レイアウト切り替えロジックが存在しない
- ⚠️ **Phase 4-7は部分実装**: タブレット最適化は関数準備済みだが未使用、その他は未実装

**推奨アプローチ**: Hybrid Approach（Option C）- 既存のHookと計算関数を拡張し、横向きレイアウトとパフォーマンス最適化は新規実装

**実装規模**: Medium-Large (M-L: 5-10日)

---

## 1. Current State Investigation

### 1.1 既存の関連ファイル・モジュール

#### コアファイル構成
```
src/
├── Gobblet.jsx              # メインコンポーネント (1,300+ lines)
├── hooks/
│   └── useResponsive.js     # ✅ デバイス検出Hook (124 lines)
├── utils/
│   └── calculations.js      # ✅ スペーシング計算 (114 lines)
├── DinosaurIcons.jsx        # UI要素（恐竜アイコン）
├── App.jsx                  # エントリーポイント
└── main.jsx                 # React初期化
```

#### 依存関係
- **React 19.2.0** - 最新版使用、全Hooksサポート
- **Vite 7.2.4** - ビルドツール
- **テストフレームワーク**: 未導入（package.jsonに記載なし）

### 1.2 既存の実装パターンと規約

#### アーキテクチャパターン
- **単一ファイルコンポーネント**: Gobblet.jsxに全ゲームロジックを集約（1,300行超）
- **Custom Hooks分離**: レスポンシブロジックは`hooks/`ディレクトリに分離済み
- **Utility関数分離**: 計算ロジックは`utils/`ディレクトリに分離済み
- **LocalStorage永続化**: スペーシング設定を`gobblet-spacing-options`キーで保存

#### 命名規則
- Hooks: `use` prefix（例: `useDeviceType`, `useOrientation`）
- 定数: UPPER_SNAKE_CASE（例: `BREAKPOINTS`, `ORIENTATIONS`）
- 計算関数: camelCase（例: `calculateFixedHeight`, `ensureMinTouchSize`）
- コンポーネント: PascalCase（例: `BoardCell`, `StackArea`, `Piece`）

#### 状態管理
- **useState**: ローカル状態（board, stacks, cellSize, spacingOptions等）
- **useEffect**: リサイズイベントリスナー、サイズ計算の副作用
- **useCallback**: ゲームロジック関数のメモ化（getValidMoves, applyMove等）
- **LocalStorage**: スペーシング設定の永続化（loadSpacingOptions, saveSpacingOptions）

#### レスポンシブ実装の既存パターン
```javascript
// Gobblet.jsx内でのHook使用
const deviceType = useDeviceType();
const orientation = useOrientation();

// useEffect内でサイズ計算
useEffect(() => {
  const updateSize = () => {
    const fixedElementsHeight = calculateFixedHeight(
      deviceType,
      orientation,
      spacingOptions
    );
    // cellSize計算...
  };
  updateSize();
  window.addEventListener('resize', updateSize);
  return () => window.removeEventListener('resize', updateSize);
}, [deviceType, orientation, spacingOptions]);
```

### 1.3 統合サーフェス

#### データモデル
- **spacingOptions**: `{ headerSpacing, topSpacing, bottomSpacing, messageSpacing }`
- **deviceType**: `'mobile' | 'tablet' | 'desktop'`
- **orientation**: `'portrait' | 'landscape'`
- **viewportSize**: `{ width: number, height: number }`

#### LocalStorage API
- **キー**: `'gobblet-spacing-options'`
- **形式**: JSON文字列化されたspacingOptions
- **デフォルト値**: `DEFAULT_SPACING`定数で定義

#### CSS統合
- **インラインスタイル優先**: React style propsで全スタイル定義
- **clamp()使用**: フォントサイズに既に使用（例: `fontSize: 'clamp(20px, 6vw, 32px)'`）
- **env()使用**: safe-area-insetを部分的に使用（上部パディングのみ）
- **100vh使用**: 現在は直接使用（モバイルブラウザの問題未対応）

---

## 2. Requirements Feasibility Analysis

### 2.1 要件別の技術的ニーズと既存実装状況

#### Requirement 1: デバイス検出とブレークポイント管理

**必要な技術要素**:
- ✅ **実装済み**: `useDeviceType()`, `useOrientation()`, `useViewportSize()`, `BREAKPOINTS`定数
- ⚠️ **部分実装**: resizeイベントリスナーは直接実装（デバウンスなし）
- ❌ **未実装**: 150ms以内のレイアウト適応保証（パフォーマンス測定なし）

**ギャップ**:
- デバウンス処理が未実装（要件7と関連）
- パフォーマンス測定機構がない

**制約**:
- Reactのstate更新タイミングに依存（同期的な150ms保証は困難）

#### Requirement 2: 動的スペーシングシステム

**必要な技術要素**:
- ✅ **実装済み**: `calculateFixedHeight()`, デバイス別スケール係数、ユーザー設定統合
- ⚠️ **部分実装**: `getSpacingScale()`関数は定義されているが未使用
- ✅ **実装済み**: LocalStorageとの後方互換性

**ギャップ**:
- `getSpacingScale()`の適用が未実装（Requirement 2.5, 2.6）
- デバイス別スケール係数とビューポート幅別スケールの統合ロジックが未明確

**制約**:
- 既存のユーザー設定を破壊しないこと（loadSpacingOptions関数で対応済み）

#### Requirement 3: 横向きモードレイアウト対応

**必要な技術要素**:
- ✅ **実装済み**: `useOrientation()`で横向き検出
- ❌ **未実装**: 横向きレイアウトのUI構造（2カラム、横並び配置）
- ❌ **未実装**: 640px最小幅チェック
- ❌ **未実装**: トランジションアニメーション（300ms以内）

**ギャップ**:
- ゲーム画面の横並びレイアウトコンポーネントが存在しない
- タイトル/オプション画面の2カラムレイアウトが存在しない
- レイアウト切り替えロジックが未実装

**制約**:
- 既存の縦向きレイアウトを破壊しないこと
- ゲームロジック（board, stacks）は変更不要

**複雑性**:
- Medium - 新規レイアウトコンポーネント作成、条件分岐ロジック追加

#### Requirement 4: タブレット専用最適化

**必要な技術要素**:
- ✅ **実装済み**: `getMaxCellSize(deviceType)`, `getStackBoxSizeFactor(deviceType)`
- ⚠️ **部分実装**: `getMaxCellSize()`は使用されているが、`getStackBoxSizeFactor()`は未使用
- ❌ **未実装**: フォントサイズの20%拡大ロジック
- ❌ **未実装**: スライダー最大幅のデバイス別設定（現在300px固定）
- ❌ **未実装**: プレビュー縮小率のデバイス別設定（現在0.5固定）

**ギャップ**:
- StackAreaコンポーネントで`cellSize * 0.85`がハードコード（line 125）
- オプション画面のスライダーとプレビューが固定値

**制約**:
- 既存のStackAreaの視覚的デザインを維持

#### Requirement 5: タッチターゲットサイズ最適化

**必要な技術要素**:
- ✅ **実装済み**: `ensureMinTouchSize()`関数
- ❌ **未実装**: cellSize計算時の44px最小値適用（現在38px最小値 - line 268）
- ❌ **未実装**: ボタン要素の44px保証
- ❌ **未実装**: スライダーコントロールの44px保証
- ❌ **未実装**: Stack内ピース選択領域の44px保証

**ギャップ**:
- `ensureMinTouchSize()`関数は定義されているが使用されていない
- 現在のcellSize最小値は38px（line 268: `Math.max(..., 38)`）

**制約**:
- 44px保証により、小画面でボードサイズが縮小される可能性

#### Requirement 6: ビューポート高さ改善とSafeArea対応

**必要な技術要素**:
- ❌ **未実装**: CSS変数`--vh`の設定（現在100vh直接使用 - lines 883, 1202, 1318）
- ⚠️ **部分実装**: safe-area-inset-topのみ適用済み（lines 891, 1326）
- ❌ **未実装**: safe-area-inset-bottom, left, rightの適用

**ギャップ**:
- ビューポート高さ計算のuseEffectが未実装
- CSS変数設定の仕組みがない
- 全方向のsafe-area対応が未完了

**制約**:
- `document.documentElement.style.setProperty()`を使用する必要がある
- モバイルブラウザのURLバー表示/非表示によるリサイズに対応必要

#### Requirement 7: パフォーマンス最適化

**必要な技術要素**:
- ❌ **未実装**: デバウンス処理（現在は直接リスナー登録 - line 275）
- ⚠️ **部分実装**: 一部ゲームロジックでuseCallback使用済み
- ❌ **未実装**: cellSize, fixedHeightのuseMemo
- ❌ **未実装**: デバウンス関数ユーティリティ

**ギャップ**:
- `utils/debounce.js`ファイルが存在しない
- updateSize関数にデバウンス適用がない
- 計算結果のメモ化が不足

**制約**:
- リサイズイベントの頻度制限が必須（モバイルで特に重要）

**複雑性**:
- Low - デバウンス実装は標準パターン、useMemo追加は容易

#### Requirement 8: レスポンシブフォントサイズとUI要素

**必要な技術要素**:
- ✅ **実装済み**: clamp()関数を既に使用（lines 899, 1225, 1236, 1334, 1346）
- ⚠️ **部分実装**: 一部のフォントサイズはclamp()使用済みだが、全要素ではない
- ❌ **未実装**: 375px未満での最小値固定ロジック
- ❌ **未実装**: オプション画面のレイアウト調整（小画面での重なり防止）

**ギャップ**:
- clamp()の最小値・最大値が要件と一致するか未検証
- 条件付きフォントサイズ固定ロジックがない

**制約**:
- 既存のclamp()値を変更すると視覚的デザインに影響

#### Requirement 9: テスト品質保証

**必要な技術要素**:
- ❌ **未実装**: テストフレームワーク（Jest, React Testing Library等）が未導入
- ❌ **未実装**: 全てのテストコード
- ❌ **未実装**: Lighthouseスコア測定
- ❌ **未実装**: パフォーマンステスト

**ギャップ**:
- package.jsonにテスト関連の依存関係がない
- `__tests__/`ディレクトリが存在しない
- CI/CD設定が未確認

**制約**:
- テスト環境のセットアップが必要（設計フェーズで調査推奨）

**複雑性**:
- Medium - テスト環境構築、テストケース作成には時間が必要

#### Requirement 10: 後方互換性とマイグレーション

**必要な技術要素**:
- ✅ **実装済み**: `loadSpacingOptions()`でLocalStorage読み込み、デフォルト値マージ
- ✅ **実装済み**: DEFAULT_SPACING定数で要件指定のデフォルト値
- ✅ **実装済み**: ゲーム状態はスペーシング変更と独立

**ギャップ**:
- なし（既に要件を満たす実装）

**制約**:
- LocalStorageのキー変更は既存ユーザーに影響

---

## 3. Implementation Approach Options

### Option A: Extend Existing Components（既存コンポーネント拡張）

**適用範囲**:
- Requirement 1, 2, 5, 6, 7, 8の一部
- 既存のGobblet.jsxとHooksの拡張で対応可能な要件

**拡張対象ファイル**:

#### 1. `src/hooks/useResponsive.js`
- **変更内容**: デバウンス処理を各Hookに統合
- **互換性**: 既存のインターフェースを維持、内部実装のみ変更
- **複雑性**: Low - デバウンスロジック追加のみ

#### 2. `src/utils/calculations.js`
- **変更内容**: `getSpacingScale()`の適用ロジック追加、新規関数なし
- **互換性**: 既存関数のシグネチャ変更なし
- **複雑性**: Low - 計算ロジック追加のみ

#### 3. `src/Gobblet.jsx`
- **変更内容**:
  - updateSize関数にuseMemo適用
  - ensureMinTouchSize()の適用（cellSize計算）
  - CSS変数`--vh`設定のuseEffect追加
  - safe-area-inset全方向適用
  - clamp()値の調整
- **互換性**: ゲームロジックに影響なし、視覚的変更最小限
- **複雑性**: Medium - 複数箇所の修正が必要（ファイルサイズ1,300行）

**Trade-offs**:
- ✅ 既存パターンの活用、開発速度が速い
- ✅ ファイル構成の変更最小限
- ✅ 後方互換性を保ちやすい
- ❌ Gobblet.jsxがさらに肥大化（1,300行→1,400行超の可能性）
- ❌ 横向きレイアウトなど大規模変更には不向き

### Option B: Create New Components（新規コンポーネント作成）

**適用範囲**:
- Requirement 3（横向きモードレイアウト）
- Requirement 9（テストインフラ）

**新規作成ファイル**:

#### 1. `src/components/LandscapeGameLayout.jsx`
- **責務**: 横向きモード専用のゲームレイアウト（CPU Stack、Board、YOU Stackを横並び）
- **統合ポイント**: Gobblet.jsxから`orientation`と`deviceType`を受け取り、条件分岐で使用
- **Props**: `{ board, stacks, cellSize, selectedPiece, onCellClick, onStackClick, ... }`

#### 2. `src/components/LandscapeTitleLayout.jsx`
- **責務**: タイトル/オプション画面の2カラムレイアウト
- **統合ポイント**: Gobblet.jsxのタイトル画面セクションを置き換え
- **Props**: `{ onStartGame, showOptions, spacingOptions, ... }`

#### 3. `src/utils/debounce.js`
- **責務**: デバウンス関数ユーティリティ
- **統合ポイント**: useResponsive.js内で使用
- **Export**: `export const debounce = (func, wait) => { ... }`

#### 4. `src/hooks/__tests__/useResponsive.test.js`
- **責務**: デバイス検出Hookのユニットテスト
- **ツール**: Jest + React Testing Library（要導入）

#### 5. `src/utils/__tests__/calculations.test.js`
- **責務**: 計算関数のユニットテスト
- **ツール**: Jest

**Trade-offs**:
- ✅ 関心の分離、各ファイルの責務が明確
- ✅ テストが容易
- ✅ Gobblet.jsxの肥大化を防ぐ
- ✅ 横向きレイアウトを独立して開発・テスト可能
- ❌ ファイル数増加（ナビゲーションの複雑化）
- ❌ インターフェース設計が必要（Props定義）
- ❌ 既存コードからの移行作業

### Option C: Hybrid Approach（ハイブリッドアプローチ）⭐ 推奨

**戦略**:
- **Phase 1（基盤整備）**: Option A - 既存Hooksと計算関数を拡張
  - デバウンス処理追加
  - useMemo/useCallback適用
  - ensureMinTouchSize()適用
  - CSS変数`--vh`実装
  - safe-area-inset全方向対応
- **Phase 2（横向きレイアウト）**: Option B - 新規レイアウトコンポーネント作成
  - LandscapeGameLayout.jsx
  - LandscapeTitleLayout.jsx
  - Gobblet.jsxで条件分岐
- **Phase 3（テスト）**: Option B - テストインフラとテストコード新規作成
  - package.json更新（Jest, Testing Library追加）
  - __tests__/ディレクトリ作成
  - ユニットテスト・統合テスト実装

**段階的実装計画**:

#### Sprint 1: 基盤整備（3-4日）
1. `utils/debounce.js`新規作成
2. `hooks/useResponsive.js`にデバウンス適用
3. `Gobblet.jsx`のupdateSize関数最適化（useMemo追加）
4. `Gobblet.jsx`にCSS変数`--vh`設定追加
5. `Gobblet.jsx`のsafe-area-inset全方向対応
6. cellSize計算に`ensureMinTouchSize()`適用

#### Sprint 2: 横向きモード（4-5日）
1. `components/LandscapeGameLayout.jsx`新規作成
2. `components/LandscapeTitleLayout.jsx`新規作成
3. `Gobblet.jsx`に横向き/縦向き条件分岐ロジック追加
4. トランジションアニメーション実装（300ms以内）
5. 640px最小幅チェック追加

#### Sprint 3: タブレット最適化（1-2日）
1. `StackArea`コンポーネントで`getStackBoxSizeFactor()`使用
2. オプション画面のスライダー幅をデバイス別に調整
3. プレビュー縮小率をデバイス別に調整
4. フォントサイズの20%拡大ロジック追加

#### Sprint 4: テスト（2-3日）
1. package.json更新（Jest, Testing Library, Playwright追加）
2. Hookテスト作成
3. 計算関数テスト作成
4. 統合テスト作成（レイアウト切り替え、スペーシング設定）

**リスク軽減策**:
- **段階的ロールアウト**: 各Sprintごとに動作確認、リグレッション防止
- **Feature Flag**: 横向きモードを環境変数で制御可能に（開発中はオプトイン）
- **Rollback戦略**: git branchでSprint単位管理、問題発生時は前Sprintにrevert

**Trade-offs**:
- ✅ 段階的実装で各フェーズのリスク分散
- ✅ 既存機能を維持しながら新機能追加
- ✅ テストを後回しにせず品質保証
- ✅ 各Sprintで価値提供（インクリメンタルデリバリー）
- ❌ 計画の複雑性増加
- ❌ Sprint間の依存関係管理が必要

---

## 4. Research Needed（設計フェーズでの調査事項）

### 4.1 テストフレームワーク選定
- **調査項目**: Jest vs Vitest（Viteプロジェクトに最適なのは？）
- **決定事項**: テストランナー、アサーションライブラリ、モック戦略
- **理由**: package.jsonにテスト依存関係が未記載、設計フェーズで選定必要

### 4.2 横向きレイアウトのUX検証
- **調査項目**: 640px未満での横向きモード無効化は適切か？
- **決定事項**: 最小幅要件の調整、代替レイアウトの検討
- **理由**: 小型スマホ横向き（例: iPhone SE横向き 667x375px）での体験が未検証

### 4.3 パフォーマンス測定ツール
- **調査項目**: リサイズ時のレンダリング時間計測方法（React DevTools Profiler? Performance API?）
- **決定事項**: 100ms以内の保証をどう検証するか
- **理由**: 要件9.4のパフォーマンステスト手法が未定義

### 4.4 Lighthouseスコア測定の自動化
- **調査項目**: GitHub Actions + Lighthouse CIの設定方法
- **決定事項**: CI/CD統合戦略
- **理由**: 要件9.6の継続的検証に必要

---

## 5. Implementation Complexity & Risk

### 5.1 工数見積もり（Effort）

#### Phase 1: 基盤整備
- **サイズ**: M（Medium: 3-4日）
- **根拠**: デバウンス、useMemo、CSS変数実装は標準パターンだが、Gobblet.jsxの複雑性により慎重な修正が必要

#### Phase 2: 横向きモード
- **サイズ**: M-L（Medium-Large: 4-5日）
- **根拠**: 新規レイアウトコンポーネント作成、条件分岐ロジック、トランジション実装が必要。既存UIの再利用で工数削減可能

#### Phase 3: タブレット最適化
- **サイズ**: S（Small: 1-2日）
- **根拠**: 既存関数の適用とパラメータ調整のみ、新規実装なし

#### Phase 4: テスト
- **サイズ**: M（Medium: 2-3日）
- **根拠**: テスト環境セットアップ、テストケース作成。ユニットテストは容易だが、統合テストは複雑

**合計**: M-L（Medium-Large: 10-14日 = 2週間程度）

### 5.2 リスク評価（Risk）

#### Phase 1: 基盤整備
- **リスク**: Low-Medium
- **根拠**:
  - **Low要素**: デバウンス、useMemo、safe-area-insetは実証済みパターン
  - **Medium要素**: Gobblet.jsxの1,300行超の複雑性、リグレッションリスク
- **緩和策**: 段階的実装、各変更後の動作確認

#### Phase 2: 横向きモード
- **リスク**: Medium
- **根拠**:
  - 新規レイアウトコンポーネントの統合が複雑
  - ゲーム中の向き変更時の状態管理が未検証
  - トランジションアニメーションのパフォーマンス影響が不明
- **緩和策**: Feature Flag導入、段階的ロールアウト、実機テスト

#### Phase 3: タブレット最適化
- **リスク**: Low
- **根拠**: 既存関数適用のみ、影響範囲が限定的
- **緩和策**: タブレット実機での検証

#### Phase 4: テスト
- **リスク**: Low-Medium
- **根拠**:
  - **Low要素**: ユニットテストは既存関数に対して書きやすい
  - **Medium要素**: 統合テストとE2Eテストの環境構築が不確実
- **緩和策**: テストフレームワーク選定の事前調査、段階的テスト追加

**全体リスク**: Medium
- 既存パターンの活用で技術リスクは低いが、Gobblet.jsxの複雑性と横向きモードの統合が不確実要素

---

## 6. Requirement-to-Asset Map

| 要件 | 既存アセット | 状態 | ギャップ/制約 |
|-----|------------|------|-------------|
| **Req 1: デバイス検出** | `useDeviceType()`, `useOrientation()`, `useViewportSize()`, `BREAKPOINTS` | ✅ 80%完了 | デバウンスなし、150ms保証未検証 |
| **Req 2: 動的スペーシング** | `calculateFixedHeight()`, デバイス別スケール係数 | ✅ 70%完了 | `getSpacingScale()`未使用、統合ロジック不明確 |
| **Req 3: 横向きモード** | `useOrientation()` | ❌ 20%完了 | レイアウトコンポーネント未実装、条件分岐なし |
| **Req 4: タブレット最適化** | `getMaxCellSize()`, `getStackBoxSizeFactor()` | ⚠️ 50%完了 | 一部関数未使用、フォント/スライダー/プレビュー未対応 |
| **Req 5: タッチターゲット** | `ensureMinTouchSize()` | ❌ 20%完了 | 関数定義のみ、適用箇所なし |
| **Req 6: ビューポート/SafeArea** | safe-area-inset-top適用済み | ⚠️ 30%完了 | CSS変数`--vh`なし、bottom/left/right未対応 |
| **Req 7: パフォーマンス** | useCallback（一部使用） | ❌ 20%完了 | デバウンスなし、useMemoなし |
| **Req 8: フォントサイズ** | clamp()使用（一部） | ⚠️ 60%完了 | 375px未満の固定ロジックなし、全要素未適用 |
| **Req 9: テスト** | なし | ❌ 0%完了 | テストフレームワーク未導入 |
| **Req 10: 後方互換性** | `loadSpacingOptions()`, `DEFAULT_SPACING` | ✅ 100%完了 | なし |

**凡例**:
- ✅ 実装済み（80%以上）
- ⚠️ 部分実装（30-70%）
- ❌ 未実装（30%未満）

---

## 7. Recommendations for Design Phase

### 7.1 推奨アプローチ

**Option C: Hybrid Approach**を推奨します。

**理由**:
1. **既存実装の活用**: Phase 1では既存のHookと計算関数を拡張し、開発速度を向上
2. **関心の分離**: Phase 2では横向きレイアウトを新規コンポーネント化し、Gobblet.jsxの肥大化を防止
3. **品質保証**: Phase 4でテストインフラを整備し、継続的な品質維持
4. **リスク分散**: 段階的実装により、各フェーズでの検証とリグレッション防止

### 7.2 重要な設計決定事項

#### 1. 横向きレイアウトの責務分離
- **決定**: LandscapeGameLayout.jsxとLandscapeTitleLayout.jsxを新規作成
- **理由**: Gobblet.jsx（1,300行超）のさらなる肥大化を防ぎ、横向きレイアウトを独立してテスト可能に
- **トレードオフ**: ファイル数増加 vs 保守性向上

#### 2. デバウンス処理の実装場所
- **決定**: `utils/debounce.js`を新規作成し、`useResponsive.js`内で使用
- **理由**: 再利用可能なユーティリティとして分離、他のHooksでも使用可能
- **トレードオフ**: ファイル追加 vs 再利用性

#### 3. CSS変数`--vh`の設定タイミング
- **決定**: App.jsxまたはGobblet.jsxのトップレベルuseEffectで設定
- **理由**: グローバルなCSS変数は一度設定すれば全コンポーネントで使用可能
- **トレードオフ**: グローバル副作用 vs パフォーマンス

#### 4. テストフレームワークの選定
- **候補**: Jest vs Vitest
- **調査事項**: Viteプロジェクトとの統合性、React Testing Libraryサポート、実行速度
- **設計フェーズで決定**: package.json更新前に選定

### 7.3 設計フェーズで調査すべき項目

1. **テストフレームワーク選定** (Research Needed 4.1)
   - JestとVitestの比較、React Testing Libraryとの統合
2. **横向きレイアウトのUX検証** (Research Needed 4.2)
   - 640px最小幅要件の妥当性、小型デバイスでの体験
3. **パフォーマンス測定ツール** (Research Needed 4.3)
   - React DevTools Profiler、Performance API、Lighthouse CIの選定
4. **CI/CD統合戦略** (Research Needed 4.4)
   - GitHub Actions + Lighthouse CI、ビジュアルリグレッションテストツール

### 7.4 Phase別の優先順位

**高優先度（Phase 1-2）**:
- Phase 1: 基盤整備（デバウンス、useMemo、CSS変数`--vh`、safe-area-inset）
- Phase 2: 横向きモードレイアウト（新規コンポーネント作成）

**中優先度（Phase 3）**:
- Phase 3: タブレット最適化（既存関数適用）

**低優先度（Phase 4）**:
- Phase 4: テストインフラ整備（ただし、各Phaseでユニットテストを並行実装推奨）

### 7.5 技術スタックの追加検討

現在のpackage.jsonに以下の追加を検討:
- **テスト**: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
- **E2Eテスト**: `@playwright/test`（オプション）
- **Lighthouse CI**: `@lhci/cli`（オプション）

---

## 8. まとめ

### 実装可能性
**結論**: 全要件の実装は技術的に実現可能。既存の基盤（useResponsive.js, calculations.js）を活用し、段階的に機能拡張することで、10-14日程度で完了可能。

### 主要な課題
1. **Gobblet.jsxの複雑性**: 1,300行超の大規模ファイル、慎重な修正が必要
2. **横向きレイアウトの統合**: 新規コンポーネント作成と条件分岐ロジックが必要
3. **テストインフラ未整備**: 要件9を満たすには、テスト環境のセットアップが必須

### 成功のための鍵
1. **段階的実装**: 各Phaseごとに動作確認、リグレッション防止
2. **Feature Flag活用**: 横向きモードを段階的にロールアウト
3. **テストファースト**: 各機能追加時にユニットテストを並行実装
4. **実機検証**: 開発中に複数デバイスで動作確認（特にタブレット、横向きモード）

### 次のステップ
設計フェーズで以下を実施:
1. 横向きレイアウトコンポーネントの詳細設計（Props, State, UI構造）
2. テストフレームワーク選定とテスト戦略策定
3. パフォーマンス測定方法の決定
4. 実装タスクの詳細化（Phase別のタスク分解）
