# パフォーマンス検証ガイド (Task 6.2)

## 目的
Task 6.1で実装したuseMemoによる最適化とデバウンス処理の効果を検証します。

## 検証項目

### 1. リサイズ時のレンダリング時間（目標: 100ms以内）

#### 検証方法: React DevTools Profiler

1. **React DevTools拡張機能をインストール**
   - Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

2. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

3. **React DevTools Profilerを開く**
   - ブラウザでアプリケーションを開く
   - F12で開発者ツールを開く
   - "Profiler"タブを選択
   - 🔴 Record ボタンをクリック

4. **ウィンドウリサイズを実行**
   - ウィンドウをドラッグしてリサイズ（10回程度）
   - ⏹ Stop ボタンをクリック

5. **Commit時間を確認**
   - Flamegraph viewで各コミットの時間を確認
   - Gobbletコンポーネントの "Commit duration" を確認
   - **期待値**: 100ms以内（平均）

#### 結果記録例
```
Commit #1: 45ms
Commit #2: 52ms
Commit #3: 48ms
...
Average: 48.5ms ✅ (< 100ms)
```

---

### 2. デバウンス効果（目標: 1秒あたり最大7回）

#### 検証方法: コンソールログ

1. **カスタムロギングを追加（一時的）**

   `src/hooks/useResponsive.js`のuseViewportSize内に以下を追加:
   ```javascript
   const updateViewportSize = () => {
     console.log('[Resize] Viewport update triggered at', Date.now());
     setViewportSize({
       width: window.innerWidth,
       height: window.innerHeight
     });
   };
   ```

2. **リサイズテストを実行**
   - ブラウザコンソールを開く
   - 1秒間に連続でウィンドウをリサイズ
   - コンソールログの回数をカウント

3. **期待値**
   - 1秒あたりのログ出力回数が最大7回
   - 150ms間隔のデバウンスが機能していることを確認

#### 結果記録例
```
[Resize] Viewport update triggered at 1609459200000
[Resize] Viewport update triggered at 1609459200150
[Resize] Viewport update triggered at 1609459200300
...
Total in 1 second: 6 updates ✅ (≤ 7)
```

---

### 3. useMemoの効果（計算回数削減）

#### 検証方法: コンソールログ

1. **カスタムロギングを追加（一時的）**

   `src/Gobblet.jsx`のuseMemo内に以下を追加:
   ```javascript
   // fixedElementsHeightのuseMemo内
   const fixedElementsHeight = useMemo(() => {
     console.log('[Memo] fixedElementsHeight recalculated');
     return calculateFixedHeight(
       deviceType,
       orientation,
       spacingOptions
     );
   }, [deviceType, orientation, spacingOptions]);

   // calculatedCellSizeのuseMemo内
   const calculatedCellSize = useMemo(() => {
     console.log('[Memo] calculatedCellSize recalculated');
     const vh = viewportSize.height;
     // ... rest of the code
   }, [viewportSize, fixedElementsHeight, deviceType]);
   ```

2. **リサイズテストを実行**
   - ブラウザコンソールを開く
   - デバイスタイプやスペーシング設定を変更せずにウィンドウをリサイズ
   - ログ出力を確認

3. **期待値**
   - `fixedElementsHeight`は依存値が変わらない限り再計算されない
   - `calculatedCellSize`はviewportSizeまたはdeviceType変更時のみ再計算される
   - 不要な再計算が削減されている

#### 結果記録例
```
[Memo] fixedElementsHeight recalculated (初回のみ)
[Memo] calculatedCellSize recalculated (viewportSize変更時)
[Memo] calculatedCellSize recalculated (viewportSize変更時)
...
✅ fixedElementsHeightは1回のみ計算（依存値変更なし）
✅ calculatedCellSizeはviewportSize変更時のみ再計算
```

---

## 検証完了基準

以下の全ての条件を満たすこと:

- ✅ リサイズ時の平均レンダリング時間が100ms以内
- ✅ デバウンス処理により1秒あたりのイベント実行回数が最大7回
- ✅ useMemoにより不要な再計算が削減されている
- ✅ 全60テストが成功（リグレッションなし）

---

## 計測結果記録

### 計測日時: _____________

### リサイズ時のレンダリング時間
- Commit #1: ____ ms
- Commit #2: ____ ms
- Commit #3: ____ ms
- 平均: ____ ms
- **結果**: ✅ / ❌

### デバウンス効果
- 1秒間のイベント発火回数: ____ 回
- **結果**: ✅ / ❌

### useMemo効果
- fixedElementsHeight再計算回数（10回リサイズ中）: ____ 回
- calculatedCellSize再計算回数（10回リサイズ中）: ____ 回
- **結果**: ✅ / ❌

---

## 注意事項

- 計測用のconsole.logは検証後に必ず削除すること
- React DevTools Profilerは開発モードでのみ使用可能
- 本番ビルド（npm run build）では最適化がさらに強化される
- 低スペックデバイスでの計測も推奨（実機テスト）
