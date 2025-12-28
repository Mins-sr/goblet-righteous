# デバイス別手動検証ガイド (Task 14)

本ドキュメントは、responsive-design機能のデバイス別手動検証テスト（タスク14）を実施するためのガイドです。

## 検証環境のセットアップ

### 方法1: ブラウザ開発者ツール（推奨）

1. アプリケーションをローカルで起動:
```bash
npm run dev
```

2. ブラウザでアプリケーションを開く: `http://localhost:5173/goblet-righteous/`

3. 開発者ツールを開く:
   - Chrome/Edge: `F12` または `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: `F12` または `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Safari: `Cmd+Option+I` (Mac)

4. デバイスエミュレーションモードを有効化:
   - Chrome/Edge: `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
   - Firefox: `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)

### 方法2: 実機テスト

- iOS: iPhone SE、iPad Mini実機を使用
- Android: 類似サイズのAndroid端末を使用

---

## 14.1 iPhone SE（375x667）での検証

### デバイス設定
- **ビューポートサイズ**: 375 × 667 px
- **デバイス名**: iPhone SE (第2世代)
- **DPR**: 2

### 検証項目

#### 1. 縦向きモード（Portrait: 375×667）

**タイトル画面**:
- [ ] GOBBLETタイトルが画面上部に表示される
- [ ] 難易度選択ボタン（Normal, Easy, Hard, UltraHard）が表示される
- [ ] 各ボタンのminHeight/minWidthが44px以上である（開発者ツールで確認）
- [ ] ⚙ Optionsボタンが表示され、44px以上のタッチターゲットを持つ
- [ ] フォントサイズが読みやすいサイズである（clamp適用確認）
- [ ] SafeAreaパディングが適用されている（env(safe-area-inset-*)確認）

**オプション画面**:
- [ ] 4つのスライダー（Header↔CPU, CPU↔Board, Board↔YOU, YOU↔Message）が表示される
- [ ] 各スライダーのminHeightが44px以上である
- [ ] スライダーの最大幅が300pxである（mobile設定）
- [ ] Backボタンが44px以上のタッチターゲットを持つ
- [ ] スライダー変更時にプレビューが更新される
- [ ] LocalStorageに設定が保存される（開発者ツールのApplication/Storageタブで確認）

**ゲーム画面（縦向き）**:
- [ ] GOBBLETヘッダーが表示される
- [ ] CPU Stack（上部）、Board（中央）、YOU Stack（下部）が縦配置される
- [ ] BoardCellのサイズが最低44px × 44pxである
- [ ] Stack内のピース選択領域が44px以上である
- [ ] UndoボタンとMenuボタンが44px以上のタッチターゲットを持つ
- [ ] メッセージバーが表示される
- [ ] 全要素が画面内に収まり、スクロール不要である
- [ ] SafeAreaパディングが全方向に適用されている

**開発者ツールでの確認方法**:
```javascript
// コンソールで実行: BoardCellサイズ確認
document.querySelectorAll('[data-testid="board-cell"]').forEach(cell => {
  const rect = cell.getBoundingClientRect();
  console.log(`Cell size: ${rect.width}px × ${rect.height}px`);
});

// ボタンサイズ確認
document.querySelectorAll('button').forEach(btn => {
  const rect = btn.getBoundingClientRect();
  const text = btn.textContent.trim();
  console.log(`Button "${text}": ${rect.width}px × ${rect.height}px`);
});

// CSS変数--vhの確認
const vh = getComputedStyle(document.documentElement).getPropertyValue('--vh');
console.log(`--vh value: ${vh}`);
```

#### 2. 横向きモード（Landscape: 667×375）

**注意**: iPhone SEの横向き（667×375）は640px以上のため、横向きレイアウトが適用されます。

**タイトル画面（横向き）**:
- [ ] 2カラムレイアウト（左: タイトル/説明、右: ボタン/設定）が表示される
- [ ] LandscapeTitleLayoutコンポーネントが使用されている（React DevToolsで確認）
- [ ] 全要素が画面内に収まる
- [ ] ボタンのタッチターゲットが44px以上である

**ゲーム画面（横向き）**:
- [ ] CPU Stack、Board、YOU Stackが横並び配置される
- [ ] LandscapeGameLayoutコンポーネントが使用されている
- [ ] BoardCellのサイズが44px以上である
- [ ] 全要素が画面内に収まる
- [ ] SafeAreaパディングが全方向に適用されている

**レイアウト切り替えテスト**:
- [ ] 縦向き→横向き回転時にスムーズにレイアウトが切り替わる（300ms以内）
- [ ] 横向き→縦向き回転時にスムーズにレイアウトが切り替わる
- [ ] ゲーム状態（board, stacks, currentTurn）が保持される

---

## 14.2 iPad Mini（768x1024）での検証

### デバイス設定
- **ビューポートサイズ**: 768 × 1024 px
- **デバイス名**: iPad Mini
- **DPR**: 2

### 検証項目

#### 1. 縦向きモード（Portrait: 768×1024）

**タイトル画面**:
- [ ] タブレット向けフォントサイズ（20%拡大）が適用されている
- [ ] スライダー最大幅が500pxである（tablet設定）
- [ ] プレビュー縮小率が0.6である（tablet設定）
- [ ] ボタンのタッチターゲットが44px以上である

**ゲーム画面（縦向き）**:
- [ ] cellSizeの最大値が90pxである（tablet設定）
- [ ] StackAreaのstackBoxSizeが`cellSize * 1.0`である（tablet設定）
- [ ] BoardCellのサイズが最大90pxである
- [ ] 全要素が適切なスペーシングで配置されている

**開発者ツールでの確認方法**:
```javascript
// タブレット設定の確認
const deviceType = 'tablet'; // useDeviceType()の返り値を想定

// cellSize最大値確認（90pxであるべき）
document.querySelectorAll('[data-testid="board-cell"]').forEach(cell => {
  const rect = cell.getBoundingClientRect();
  console.log(`Cell size: ${rect.width}px (max 90px for tablet)`);
});

// StackBoxサイズ確認（cellSize * 1.0であるべき）
document.querySelectorAll('[data-testid="stack-box"]').forEach(box => {
  const rect = box.getBoundingClientRect();
  console.log(`StackBox size: ${rect.width}px`);
});

// スライダー最大幅確認（500pxであるべき）
document.querySelectorAll('input[type="range"]').forEach(slider => {
  const maxWidth = getComputedStyle(slider).maxWidth;
  console.log(`Slider maxWidth: ${maxWidth}`);
});
```

#### 2. 横向きモード（Landscape: 1024×768）

**タイトル画面（横向き）**:
- [ ] 2カラムレイアウトが適用される
- [ ] タブレット向けフォントサイズが維持される
- [ ] スライダー最大幅が500pxである

**ゲーム画面（横向き）**:
- [ ] CPU Stack、Board、YOU Stackが横並び配置される
- [ ] cellSizeが最大90pxである
- [ ] stackBoxSizeが`cellSize * 1.0`である
- [ ] 全要素が画面内に収まる

**レイアウト切り替えテスト**:
- [ ] 縦向き↔横向き回転時にスムーズにレイアウトが切り替わる
- [ ] ゲーム状態が保持される
- [ ] タブレット専用最適化が維持される

---

## 14.3 デスクトップ（1920x1080）での検証

### デバイス設定
- **ビューポートサイズ**: 1920 × 1080 px
- **デバイス名**: Desktop (Full HD)
- **DPR**: 1

### 検証項目

**タイトル画面**:
- [ ] デスクトップ向けスケール係数（1.2倍）が適用されている
- [ ] フォントサイズが大画面に適したサイズである
- [ ] スライダー最大幅が500pxである（desktop設定）
- [ ] プレビュー縮小率が0.7である（desktop設定）
- [ ] ボタンのタッチターゲットが44px以上である

**ゲーム画面**:
- [ ] cellSizeの最大値が90pxである（desktop設定）
- [ ] StackAreaのstackBoxSizeが`cellSize * 1.0`である（desktop設定）
- [ ] 大画面での視認性が良好である
- [ ] 適切なスペーシングが適用されている
- [ ] 全要素が中央に配置され、両端に余白がある

**開発者ツールでの確認方法**:
```javascript
// デスクトップ設定の確認
const deviceType = 'desktop'; // useDeviceType()の返り値を想定

// スケール係数確認（1.2倍であるべき）
const fixedHeight = 282; // 基準値
const scaleFactor = 1.2; // desktop
console.log(`Expected fixed height: ${fixedHeight * scaleFactor}px`);

// cellSize最大値確認（90pxであるべき）
document.querySelectorAll('[data-testid="board-cell"]').forEach(cell => {
  const rect = cell.getBoundingClientRect();
  console.log(`Cell size: ${rect.width}px (max 90px for desktop)`);
});
```

**ウィンドウリサイズテスト**:
- [ ] ウィンドウを1024px未満にリサイズした場合、tabletに切り替わる
- [ ] ウィンドウを768px未満にリサイズした場合、mobileに切り替わる
- [ ] リサイズ時のレンダリングがスムーズである（デバウンス150ms適用確認）
- [ ] ゲーム状態が保持される

---

## 共通検証項目

### パフォーマンス

**リサイズパフォーマンス**:
```javascript
// リサイズイベント頻度の計測
let resizeCount = 0;
const startTime = performance.now();

window.addEventListener('resize', () => {
  resizeCount++;
  const elapsedTime = performance.now() - startTime;
  if (elapsedTime >= 1000) {
    console.log(`Resize events in 1 second: ${resizeCount}`);
    console.log(`Expected: ~7 events (150ms debounce)`);
    resizeCount = 0;
  }
});
```

**レンダリング時間**:
- [ ] React DevTools Profilerでリサイズ時のCommit時間を計測
- [ ] Commit時間が100ms以内である

### LocalStorage後方互換性

**既存設定の読み込み**:
```javascript
// LocalStorageに既存設定を手動で保存
localStorage.setItem('gobblet-spacing-options', JSON.stringify({
  headerSpacing: 7,
  topSpacing: 13,
  bottomSpacing: 2,
  messageSpacing: 15
}));

// ページをリロード
location.reload();

// オプション画面を開いてスライダー値を確認
// 期待値: headerSpacing=7, topSpacing=13, bottomSpacing=2, messageSpacing=15
```

### CSS変数とSafeArea

**CSS変数`--vh`の確認**:
```javascript
const vh = getComputedStyle(document.documentElement).getPropertyValue('--vh');
const expectedVh = window.innerHeight * 0.01;
console.log(`--vh: ${vh}, Expected: ${expectedVh}px`);
```

**SafeAreaパディングの確認**:
```javascript
const container = document.querySelector('[data-testid="game-container"]') || document.querySelector('div');
const style = getComputedStyle(container);
console.log('SafeArea Padding:');
console.log(`  Top: ${style.paddingTop}`);
console.log(`  Bottom: ${style.paddingBottom}`);
console.log(`  Left: ${style.paddingLeft}`);
console.log(`  Right: ${style.paddingRight}`);
// 期待値: max(12px, env(safe-area-inset-*))
```

---

## 検証結果の記録

各デバイスでの検証結果を以下のフォーマットで記録してください:

### 14.1 iPhone SE（375x667）
- **縦向きモード**: ✅ / ❌
  - 問題点（あれば）:
- **横向きモード**: ✅ / ❌
  - 問題点（あれば）:

### 14.2 iPad Mini（768x1024）
- **縦向きモード**: ✅ / ❌
  - 問題点（あれば）:
- **横向きモード**: ✅ / ❌
  - 問題点（あれば）:

### 14.3 デスクトップ（1920x1080）
- **表示確認**: ✅ / ❌
  - 問題点（あれば）:

---

## トラブルシューティング

### 問題: 横向きレイアウトが適用されない

**原因**: ビューポート幅が640px未満
**解決**: ビューポート幅を640px以上に設定

### 問題: cellSizeが44px未満になる

**原因**: ensureMinTouchSize()が正しく適用されていない
**確認**: Gobblet.jsxのupdateSize関数を確認

### 問題: LocalStorageが保存されない

**原因**: QuotaExceededError
**確認**: ブラウザのストレージ使用状況を確認

### 問題: CSS変数`--vh`が設定されない

**原因**: useEffectが実行されていない
**確認**: Gobblet.jsxのCSS変数設定useEffectを確認

---

## 補足: 自動検証スクリプト

以下のスクリプトをブラウザコンソールで実行すると、主要な検証項目を自動でチェックできます:

```javascript
// 自動検証スクリプト
(function() {
  console.log('=== Responsive Design Verification ===');

  // 1. デバイスタイプ検出
  const width = window.innerWidth;
  let expectedDeviceType;
  if (width < 768) expectedDeviceType = 'mobile';
  else if (width < 1024) expectedDeviceType = 'tablet';
  else expectedDeviceType = 'desktop';
  console.log(`Device Type: ${expectedDeviceType} (width: ${width}px)`);

  // 2. 画面向き検出
  const height = window.innerHeight;
  const aspectRatio = width / height;
  const expectedOrientation = width > height * 1.2 ? 'landscape' : 'portrait';
  console.log(`Orientation: ${expectedOrientation} (aspect ratio: ${aspectRatio.toFixed(2)})`);

  // 3. CSS変数--vhの確認
  const vh = getComputedStyle(document.documentElement).getPropertyValue('--vh');
  console.log(`--vh: ${vh} (expected: ${(window.innerHeight * 0.01).toFixed(2)}px)`);

  // 4. BoardCellサイズ確認
  const cells = document.querySelectorAll('[data-testid="board-cell"]');
  if (cells.length > 0) {
    const cellRect = cells[0].getBoundingClientRect();
    const cellSize = cellRect.width;
    console.log(`Cell Size: ${cellSize}px (min: 44px, max: ${expectedDeviceType === 'mobile' ? 70 : 90}px)`);
    console.log(`Cell Size OK: ${cellSize >= 44 && cellSize <= (expectedDeviceType === 'mobile' ? 70 : 90)}`);
  }

  // 5. ボタンタッチターゲット確認
  const buttons = document.querySelectorAll('button');
  let allButtonsOK = true;
  buttons.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      console.warn(`Button "${btn.textContent.trim()}" is too small: ${rect.width}px × ${rect.height}px`);
      allButtonsOK = false;
    }
  });
  console.log(`All Buttons >= 44px: ${allButtonsOK}`);

  // 6. LocalStorage設定確認
  const spacingOptions = localStorage.getItem('gobblet-spacing-options');
  console.log(`LocalStorage spacing options: ${spacingOptions || 'Not set'}`);

  // 7. レイアウトコンポーネント確認（React DevToolsが必要）
  const isLandscape = expectedOrientation === 'landscape' && width >= 640;
  console.log(`Expected Layout: ${isLandscape ? 'Landscape' : 'Portrait'}`);

  console.log('=== Verification Complete ===');
})();
```

このスクリプトを実行すると、主要な検証項目が自動的にチェックされ、結果がコンソールに出力されます。
