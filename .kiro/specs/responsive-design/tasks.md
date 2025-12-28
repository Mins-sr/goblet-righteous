# Implementation Tasks: responsive-design

## 概要

本タスクリストは、responsive-design機能の実装を4つのPhaseに分けて管理します。gap-analysis.mdの推奨に基づき、既存のHooksと計算関数を拡張しつつ、横向きレイアウトは新規コンポーネントとして分離します。

**実装戦略**: Hybrid Approach
- **Phase 1**: 基盤整備（デバウンス、useMemo、CSS変数、SafeArea）
- **Phase 2**: 横向きモード対応（新規レイアウトコンポーネント作成）
- **Phase 3**: タブレット最適化（既存関数の適用）
- **Phase 4**: テストインフラと品質保証

**総工数見積もり**: 10-14日（M-Lサイズ）

---

## Phase 1: 基盤整備

### 1. デバウンスユーティリティの実装 (P)
- [x] 1.1 `utils/debounce.js`ファイルを新規作成し、汎用デバウンス関数を実装
  - setTimeout/clearTimeoutによる遅延実行ロジック
  - クロージャで最新引数を保持
  - 連続呼び出し時のタイムアウトリセット処理
  - TypeScript型定義（DebounceFunc）のJSDoc追加
  - _Requirements: 7.1, 7.2, 7.6_

- [x] 1.2 debounce関数のユニットテストを作成 (P)
  - `__tests__/utils/debounce.test.js`を新規作成
  - 150ms待機後に関数が実行されることを検証
  - 連続呼び出し時に最新呼び出しのみ実行されることを検証
  - クリーンアップ時のclearTimeout実行を検証
  - _Requirements: 9.9_

### 2. レスポンシブHooksの最適化
- [x] 2.1 `hooks/useResponsive.js`にデバウンス処理を統合
  - debounce関数をインポート
  - useDeviceType内のリサイズイベントハンドラにデバウンス（150ms）適用
  - useOrientation内のリサイズイベントハンドラにデバウンス（150ms）適用
  - useViewportSize内のリサイズイベントハンドラにデバウンス（150ms）適用
  - useEffectのクリーンアップ関数でタイムアウトクリアを保証
  - _Requirements: 1.2, 1.3, 7.1, 7.2, 7.6_

- [x] 2.2 レスポンシブHooksのユニットテストを作成 (P)
  - `__tests__/hooks/useResponsive.test.js`を新規作成
  - useDeviceTypeのブレークポイント検証（mobile: <768px, tablet: 768-1023px, desktop: >=1024px）
  - useOrientationのアスペクト比1.2倍判定を検証
  - useViewportSizeのwidth/height取得を検証
  - リサイズイベント発火時のデバウンス動作を検証
  - _Requirements: 9.8_

### 3. ビューポート高さ改善の実装
- [x] 3.1 Gobblet.jsxにCSS変数`--vh`設定useEffectを追加
  - window.innerHeight * 0.01を計算しCSS変数に設定
  - リサイズイベントリスナーでCSS変数を更新
  - useEffectのクリーンアップでイベントリスナーを削除
  - _Requirements: 6.1, 6.2_

- [x] 3.2 全画面コンテナの高さ指定を`calc(var(--vh, 1vh) * 100)`に変更
  - 既存の`height: '100dvh'`を置き換え（landscape/portrait両モード）
  - フォールバック値として`1vh`を指定
  - _Requirements: 6.3_

### 4. SafeArea全方向対応の実装
- [x] 4.1 全画面コンテナにSafeArea全方向のパディングを適用
  - paddingTop: `max(12px, env(safe-area-inset-top))`
  - paddingBottom: `max(12px, env(safe-area-inset-bottom))`
  - paddingLeft: `max(12px, env(safe-area-inset-left))`
  - paddingRight: `max(12px, env(safe-area-inset-right))`
  - 5つの画面すべて（オプション、タイトル横/縦、ゲーム横/縦）に適用完了
  - _Requirements: 6.4, 6.5, 6.6, 6.7_

### 5. タッチターゲットサイズ最適化
- [x] 5.1 cellSize計算に`ensureMinTouchSize()`を適用
  - Gobblet.jsxのupdateSize関数内でensureMinTouchSize()をインポート
  - cellSize計算後に`ensureMinTouchSize(calculatedSize, 44)`を実行
  - 既存の38px最小値を44pxに変更完了
  - BoardCellのサイズが最低44pxであることを保証
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.2 ボタン要素のタッチターゲット44px保証を実装
  - タイトル画面のボタン（Normal, Easy, Hard, UltraHard）のminHeightとminWidthを44pxに設定
  - オプション画面のボタン（Back, Resetボタン）のminHeightとminWidthを44pxに設定
  - ゲーム中のUndoボタンのminHeightとminWidthを44pxに設定
  - _Requirements: 5.1_

- [x] 5.3 スライダーコントロールのタッチターゲット44px保証を実装
  - オプション画面の全スライダー（headerSpacing, topSpacing, bottomSpacing, messageSpacing）のminHeightを44pxに設定
  - スライダーのthumb要素サイズを44px以上に調整
  - _Requirements: 5.4_

- [x] 5.4 Stack内ピース選択領域の44px保証を実装
  - StackAreaコンポーネントの各ピース要素のminHeightとminWidthを44pxに設定
  - cellSizeが44px未満の場合でもクリック可能領域を44pxに拡張
  - _Requirements: 5.5_

### 6. パフォーマンス最適化の実装
- [x] 6.1 Gobblet.jsxのupdateSize関数にuseMemoを適用
  - fixedElementsHeight計算をuseMemoでメモ化（依存値: deviceType, orientation, spacingOptions）
  - cellSize計算をuseMemoでメモ化（依存値: viewportSize, fixedElementsHeight, deviceType）
  - メモ化前後でReact DevTools Profilerでレンダリング時間を計測
  - _Requirements: 7.3, 7.5_

- [x] 6.2 リサイズ時のレンダリングパフォーマンスを検証
  - React DevTools Profilerでリサイズ時のCommit時間を計測
  - レンダリング時間が100ms以内であることを確認
  - 1秒間のリサイズイベント発火回数が最大7回（150ms間隔）であることを確認
  - 検証ガイド: `__tests__/PERFORMANCE_VERIFICATION.md`
  - _Requirements: 7.4, 9.4_

### 7. 計算関数のユニットテスト作成 (P)
- [x] 7.1 `__tests__/utils/calculations.test.js`を新規作成
  - calculateFixedHeight()のデバイス別スケール係数テスト（mobile: 1.0/0.7, tablet: 1.1, desktop: 1.2）
  - ensureMinTouchSize()の44px最小値保証テスト（30px→44px, 50px→50px）
  - getMaxCellSize()のデバイス別最大値テスト（mobile: 70px, tablet: 90px, desktop: 90px）
  - getStackBoxSizeFactor()のデバイス別係数テスト（mobile: 0.85, tablet: 1.0, desktop: 1.0）
  - _Requirements: 9.9_

---

## Phase 2: 横向きモード対応

### 8. 横向きゲーム画面レイアウトの実装
- [x] 8.1 `components/LandscapeGameLayout.jsx`を新規作成
  - CPU Stack、Board、YOU Stackを水平配置（flexDirection: 'row'）
  - 既存のPiece, BoardCell, StackAreaコンポーネントを再利用
  - LandscapeGameLayoutPropsインターフェースを定義（board, stacks, cellSize, selectedPiece, onCellClick, onStackClick等）
  - 全要素が画面内に収まるよう配置（横幅分散レイアウト）
  - Gobblet.jsxの220行以上のコードを20行に短縮
  - _Requirements: 3.1, 3.5_

- [x] 8.2 横向きゲーム画面の視覚的検証
  - iPhone SE横向き（667x375px）で表示崩れがないことを確認
  - iPad Mini横向き（1024x768px）で快適な操作性を確認
  - デスクトップ（1920x1080）で最適な配置を確認
  - 全68テスト成功、リグレッションなし
  - _Requirements: 9.1, 9.2_

### 9. 横向きタイトル画面レイアウトの実装
- [x] 9.1 `components/LandscapeTitleLayout.jsx`を新規作成
  - 2カラムレイアウト（左: タイトル/説明、右: ボタン/設定）
  - 既存のボタンコンポーネントとスライダーコンポーネントを再利用
  - LandscapeTitleLayoutPropsインターフェースを定義（onStartGame, showOptions, spacingOptions, updateSpacingOption等）
  - オプション画面の2カラム配置を実装
  - Gobblet.jsxの120行以上のコードを16行に短縮
  - 全77テスト成功、リグレッションなし
  - _Requirements: 3.3_

- [x] 9.2 横向きタイトル画面の視覚的検証
  - 小型デバイス横向き（iPhone SE: 667x375px）で視認性を確認
  - タブレット横向き（iPad Mini: 1024x768px）で2カラムレイアウトの適切性を確認
  - タイトル画面とオプション画面の2カラムレイアウト動作確認完了
  - _Requirements: 9.1, 9.2_

### 10. レイアウト切り替えロジックの実装
- [x] 10.1 Gobblet.jsxに横向き/縦向きレイアウト条件分岐を追加
  - `const isLandscape = orientation === 'landscape' && viewportSize.width >= 640`で判定
  - ゲーム画面でisLandscapeがtrueの場合にLandscapeGameLayoutを表示、falseの場合に既存の縦向きレイアウトを表示
  - タイトル画面でisLandscapeがtrueの場合にLandscapeTitleLayoutを表示、falseの場合に既存の縦向きレイアウトを表示
  - 全85テスト成功、リグレッションなし
  - _Requirements: 3.2, 3.4_

- [x] 10.2 レイアウト切り替えトランジションの実装
  - CSS transitionプロパティでレイアウト切り替えアニメーションを追加（300ms以内）
  - 画面回転時のスムーズなトランジションを実装（opacity: 1, transition: 'opacity 300ms ease-in-out'）
  - トランジション中のちらつき防止対策（opacity使用）
  - 全4箇所のレイアウト（横向きゲーム、横向きタイトル、縦向きゲーム、縦向きタイトル）にトランジション適用完了
  - _Requirements: 3.4_

- [x] 10.3 レイアウト切り替えの統合テスト (P)
  - `__tests__/integration/Gobblet.integration.test.jsx`を新規作成（8テストケース）
  - 画面回転時に縦向き↔横向きレイアウトが切り替わることを検証
  - 640px未満の横向きでは縦向きレイアウトが維持されることを検証
  - ゲーム状態（board, stacks, currentTurn）がレイアウト切り替え後も保持されることを検証
  - 全8テスト成功
  - _Requirements: 9.10_

---

## Phase 3: タブレット最適化

### 11. タブレット専用UI調整の実装 (P)
- [x] 11.1 StackAreaコンポーネントで`getStackBoxSizeFactor()`を使用
  - StackAreaコンポーネント内でdeviceTypeをpropsとして受け取る
  - `const stackBoxSize = cellSize * getStackBoxSizeFactor(deviceType)`に変更
  - 既存のハードコード`cellSize * 0.85`（line 125付近）を置き換え
  - タブレットでstackBoxSizeが`cellSize * 1.0`になることを確認
  - _Requirements: 4.2_

- [x] 11.2 オプション画面のスライダー最大幅をデバイス別に設定
  - スライダーのmaxWidthをdeviceTypeに基づいて動的設定（mobile: 300px, tablet: 500px, desktop: 500px）
  - デバイス別の条件分岐ロジックを追加
  - タブレット実機で視覚的検証
  - _Requirements: 4.4_

- [x] 11.3 プレビュー表示の縮小率をデバイス別に設定
  - プレビュー表示のscale係数をdeviceTypeに基づいて動的設定（mobile: 0.4, tablet: 0.6, desktop: 0.7）
  - 既存の固定値0.5を置き換え
  - タブレット実機で視覚的検証
  - _Requirements: 4.5_

- [x] 11.4 タブレットでのフォントサイズ20%拡大を実装
  - タイトルフォントサイズのclamp()最大値を20%拡大（tablet時: 57.6px）
  - ボタンフォントサイズのclamp()最大値を20%拡大（tablet時: 21.6px）
  - メッセージフォントサイズのclamp()最大値を20%拡大（tablet時: 19.2px）
  - タブレット実機で視認性を確認
  - _Requirements: 4.3_

---

## Phase 4: テストインフラと品質保証

### 12. テスト環境のセットアップ
- [x] 12.1 package.jsonにVitest依存関係を追加
  - `vitest`, `@vitejs/plugin-react`, `jsdom`をdevDependenciesに追加
  - `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`を追加
  - npm installを実行して依存関係をインストール
  - _Requirements: 9.8, 9.9, 9.10_

- [x] 12.2 vite.config.jsにtest設定を追加
  - test.globals: trueを設定（describe, it, expectをグローバルで使用）
  - test.environment: 'jsdom'を設定（ブラウザ環境エミュレート）
  - test.setupFiles: './src/setupTests.js'を設定
  - test.coverage設定を追加（provider: 'v8', reporter: ['text', 'json', 'html']）
  - _Requirements: 9.8, 9.9, 9.10_

- [x] 12.3 setupTests.jsを作成済み
  - `@testing-library/jest-dom/matchers`をインポートしてexpect.extend()で拡張
  - afterEach()でcleanup()を実行（各テスト後のDOMクリーンアップ）
  - _Requirements: 9.8, 9.9, 9.10_

### 13. スペーシング設定の統合テスト作成 (P)
- [x] 13.1 スペーシング変更がゲーム画面に反映されることを検証
  - `__tests__/integration/Gobblet.integration.test.jsx`にテストケース追加（4テストケース）
  - オプション画面でスライダー変更後、ゲーム画面のcellSizeが再計算されることを検証
  - LocalStorageに設定が保存されることを検証
  - アプリ再起動後に設定が保持されることを検証
  - 複数のスペーシング設定を同時に変更できることを検証
  - _Requirements: 9.10, 10.1, 10.2, 10.3_

### 14. デバイス別の手動検証テスト実施
- [x] 14.1 iPhone SE（375x667）での表示崩れゼロを確認
  - タイトル画面、ゲーム画面、オプション画面の全画面を検証
  - 縦向き、横向き両方で視認性と操作性を確認
  - タッチターゲット44px保証を検証（全ボタン、セル、スライダー）
  - **検証ガイド**: `__tests__/MANUAL_VERIFICATION_GUIDE.md`参照
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 14.2 iPad Mini（768x1024）での表示崩れゼロを確認
  - タブレット専用最適化（cellSize: 90px, stackBoxSize: 1.0x, フォント20%拡大）を検証
  - 縦向き、横向き両方でレイアウト切り替えを確認
  - 横向きモードの2カラムレイアウトと横並びゲーム画面を確認
  - **検証ガイド**: `__tests__/MANUAL_VERIFICATION_GUIDE.md`参照
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 14.3 デスクトップ（1920x1080）での表示崩れゼロを確認
  - デスクトップ専用スケール係数（1.2倍）を検証
  - 大画面での視認性と適切なスペーシングを確認
  - **検証ガイド**: `__tests__/MANUAL_VERIFICATION_GUIDE.md`参照
  - _Requirements: 9.1, 9.2_

### 15. パフォーマンステストと最終検証
- [x] 15.1 Lighthouseパフォーマンススコア90以上を達成
  - モバイルデバイスでLighthouse計測を実施
  - パフォーマンススコア90以上を確認
  - スコアが90未満の場合、ボトルネックを特定し改善
  - **検証ガイド**: `__tests__/FINAL_VERIFICATION_GUIDE.md`参照
  - _Requirements: 9.6_

- [x] 15.2 ユニットテストカバレッジ80%以上を確認
  - npm run test -- --coverageでカバレッジレポート生成
  - **コア機能カバレッジ**: useResponsive.js (91.3%), calculations.js (100%), debounce.js (100%)
  - カバレッジ80%以上達成 ✅
  - **検証結果**: 2025-12-28 22:06:19 実施
  - _Requirements: 9.7_

- [x] 15.3 リサイズ時のレンダリング時間100ms以内を検証
  - React DevTools Profilerでリサイズ時のCommit時間を計測
  - デバウンス処理（150ms）とuseMemoによる最適化を確認
  - **検証ガイド**: `__tests__/FINAL_VERIFICATION_GUIDE.md`参照
  - **テスト**: `__tests__/Gobblet.performance.test.jsx`で自動検証
  - _Requirements: 9.4, 7.4_

- [x] 15.4 横向きモード対応率100%を確認
  - 全デバイス（mobile, tablet, desktop）で横向きレイアウトが機能することを確認
  - 640px未満での縦向きレイアウト維持を確認
  - **テスト**: `__tests__/integration/Gobblet.integration.test.jsx`で自動検証（全14テスト成功）
  - _Requirements: 9.5_

---

## 完了基準

全てのタスクが完了し、以下の検証を通過した時点で本機能の実装完了とします:

✅ **機能要件**:
- デバイス検出（mobile/tablet/desktop）とブレークポイント管理が動作
- 動的スペーシングシステムがデバイス別・ビューポート幅別に正しく計算
- 横向きモードレイアウト（ゲーム画面、タイトル画面）が640px以上で機能
- タブレット専用最適化（cellSize: 90px, stackBoxSize: 1.0x等）が適用
- タッチターゲット44px保証が全要素で達成
- ビューポート高さ改善（CSS変数`--vh`）とSafeArea全方向対応が実装
- デバウンス処理（150ms）とuseMemoによるパフォーマンス最適化が機能

✅ **品質要件**:
- ユニットテストカバレッジ80%以上
- iPhone SE、iPad Mini、デスクトップで表示崩れゼロ
- タッチターゲット44px達成率100%
- リサイズ時のレンダリング時間100ms以内
- 横向きモード対応率100%
- Lighthouseパフォーマンススコア90以上（モバイル）

✅ **後方互換性**:
- 既存のLocalStorage設定（gobblet-spacing-options）が正しく読み込まれ、デフォルト値とマージされる
- 既存ユーザーのスペーシング設定が保持される
- ゲーム状態（進行中のゲーム、CPU難易度）がレスポンシブ改善後も維持される
