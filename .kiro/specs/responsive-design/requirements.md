# Requirements Document

## Project Description (Input)
GOBBLETゲームアプリケーションのレスポンシブデザイン改善。スマートフォン（縦・横）、タブレット（縦・横）、デスクトップでの最適な表示とUXを実現するため、動的スペーシングシステム、横向きモード対応、タブレット最適化、タッチターゲット最適化、ビューポート高さ改善、パフォーマンス最適化を段階的に実装する。

## Introduction
本要件定義書は、GOBBLETゲームアプリケーションのマルチデバイス対応を実現するためのレスポンシブデザイン改善要件を定義します。現状、スペーシング計算が固定値ベースで画面サイズに適応せず、横向きモード未対応、デバイス別最適化不足、タッチターゲットサイズの課題、ビューポート高さの硬直性といった問題が存在します。本仕様により、全デバイスで快適なゲーム体験を提供します。

## Requirements

### Requirement 1: デバイス検出とブレークポイント管理
**Objective:** As a ゲーム利用者, I want アプリが自動的に端末タイプと画面サイズを検出する, so that 各デバイスに最適化されたレイアウトで快適にゲームをプレイできる

#### Acceptance Criteria
1. When アプリケーションが初期化される, the GOBBLETアプリ shall 現在のビューポートサイズとデバイスタイプ（mobile/tablet/desktop）を検出する
2. When ウィンドウサイズが変更される, the GOBBLETアプリ shall デバイスタイプを再評価し、ブレークポイント（320px, 375px, 425px, 768px, 1024px, 1440px）に基づいて更新する
3. When 画面の向きが変更される（縦↔横）, the GOBBLETアプリ shall 画面の向き（portrait/landscape）を検出し、150ms以内にレイアウトを適応させる
4. The GOBBLETアプリ shall ビューポート幅が768px未満の場合にデバイスタイプを「mobile」として認識する
5. The GOBBLETアプリ shall ビューポート幅が768px以上1024px未満の場合にデバイスタイプを「tablet」として認識する
6. The GOBBLETアプリ shall ビューポート幅が1024px以上の場合にデバイスタイプを「desktop」として認識する
7. The GOBBLETアプリ shall 画面アスペクト比が1.2倍以上（幅 > 高さ × 1.2）の場合に横向きモードとして検出する

### Requirement 2: 動的スペーシングシステム
**Objective:** As a ゲーム利用者, I want スペーシングが画面サイズとデバイスタイプに応じて自動調整される, so that 小画面でも大画面でも適切な余白でゲーム要素が配置される

#### Acceptance Criteria
1. The GOBBLETアプリ shall 固定高さ計算を動的に行い、デバイスタイプ（mobile/tablet/desktop）とユーザーのスペーシング設定を反映する
2. When デバイスタイプが「mobile」かつ横向きの場合, the GOBBLETアプリ shall スペーシングに0.7倍のスケール係数を適用する
3. When デバイスタイプが「tablet」の場合, the GOBBLETアプリ shall スペーシングに1.1倍のスケール係数を適用する
4. When デバイスタイプが「desktop」の場合, the GOBBLETアプリ shall スペーシングに1.2倍のスケール係数を適用する
5. When ビューポート幅が375px未満の場合, the GOBBLETアプリ shall スペーシングを自動的に0.8倍に縮小する
6. When ビューポート幅が768pxを超える場合, the GOBBLETアプリ shall スペーシングを1.2倍に拡大する
7. The GOBBLETアプリ shall ユーザーが設定したスペーシングオプション（headerSpacing, topSpacing, bottomSpacing, messageSpacing）を動的計算に反映する
8. The GOBBLETアプリ shall 既存のLocalStorageスペーシング設定との後方互換性を維持する

### Requirement 3: 横向きモードレイアウト対応
**Objective:** As a ゲーム利用者, I want 端末を横向きにした際に最適化されたレイアウトでゲームをプレイできる, so that 横向きでも視認性と操作性が損なわれない

#### Acceptance Criteria
1. When 画面が横向きモード（幅 > 高さ × 1.2）の場合, the GOBBLETアプリ shall ゲーム画面のレイアウトを横並び配置（CPU Stack、Board、YOU Stackを水平配置）に変更する
2. When 横向きモードかつビューポート幅が640px未満の場合, the GOBBLETアプリ shall 縦向きレイアウトを維持し、横向きレイアウトを適用しない
3. When タイトル画面またはオプション画面が横向きモードで表示される場合, the GOBBLETアプリ shall 2カラムレイアウト（左：タイトル/説明、右：ボタン/設定）に変更する
4. When 画面の向きが縦↔横に切り替わる場合, the GOBBLETアプリ shall スムーズなトランジション（アニメーション時間300ms以内）でレイアウトを切り替える
5. The GOBBLETアプリ shall 横向きモードでもゲームの全要素（Header, Stack, Board, Message, Buttons）が画面内に収まるよう配置する

### Requirement 4: タブレット専用最適化
**Objective:** As a タブレット利用者, I want タブレットの画面サイズに最適化されたUIでゲームをプレイできる, so that タブレットの大画面を活かした快適な操作が可能になる

#### Acceptance Criteria
1. When デバイスタイプが「tablet」の場合, the GOBBLETアプリ shall cellSizeの最大値を90pxに設定する（mobileとdesktopは70px）
2. When デバイスタイプが「tablet」の場合, the GOBBLETアプリ shall StackAreaのサイズをcellSize × 1.0に設定する（他デバイスはcellSize × 0.85）
3. When デバイスタイプが「tablet」の場合, the GOBBLETアプリ shall フォントサイズの最大値をモバイルより20%拡大する
4. When デバイスタイプが「tablet」の場合, the GOBBLETアプリ shall オプション画面のスライダー最大幅を500pxに設定する（mobileは300px）
5. When デバイスタイプが「tablet」の場合, the GOBBLETアプリ shall プレビュー表示の縮小率を0.6に設定する（mobileは0.4、desktopは0.7）

### Requirement 5: タッチターゲットサイズ最適化
**Objective:** As a モバイル/タブレット利用者, I want すべてのタッチ可能な要素が指で正確にタップできるサイズである, so that 誤タップなく快適に操作できる

#### Acceptance Criteria
1. The GOBBLETアプリ shall すべてのボタン要素のタッチターゲットサイズを最低44px × 44pxに保証する
2. The GOBBLETアプリ shall ゲームボードのセル（BoardCell）のサイズを最低44px × 44pxに保証する
3. When 動的計算されたcellSizeが44px未満の場合, the GOBBLETアプリ shall cellSizeを44pxに補正する
4. The GOBBLETアプリ shall スライダーコントロールのタッチ可能領域を最低44px × 44pxに保証する
5. The GOBBLETアプリ shall Stack内のピース選択領域を最低44px × 44pxに保証する

### Requirement 6: ビューポート高さ改善とSafeArea対応
**Objective:** As a モバイルブラウザ利用者, I want モバイルブラウザのURLバーやノッチを考慮した正確な画面サイズでアプリが表示される, so that 画面の切れや要素の隠れがない

#### Acceptance Criteria
1. When アプリケーションが初期化される, the GOBBLETアプリ shall 実際のビューポート高さ（window.innerHeight）を計算し、CSS変数`--vh`に1vhあたりのpx値を設定する
2. When ウィンドウサイズが変更される, the GOBBLETアプリ shall CSS変数`--vh`を更新する
3. The GOBBLETアプリ shall 全画面コンテナの高さ指定に`calc(var(--vh, 1vh) * 100)`を使用し、`100vh`の直接指定を使用しない
4. The GOBBLETアプリ shall コンテナの上部パディングに`max(12px, env(safe-area-inset-top))`を適用する
5. The GOBBLETアプリ shall コンテナの下部パディングに`max(12px, env(safe-area-inset-bottom))`を適用する
6. The GOBBLETアプリ shall コンテナの左右パディングに`max(12px, env(safe-area-inset-left))`および`max(12px, env(safe-area-inset-right))`を適用する
7. The GOBBLETアプリ shall ノッチ付きデバイス（iPhone X以降等）でゲーム要素がノッチ領域に重ならないよう配置する

### Requirement 7: パフォーマンス最適化
**Objective:** As a ゲーム利用者, I want ウィンドウサイズ変更時にアプリがスムーズに応答する, so that リサイズ操作中もストレスなく快適に利用できる

#### Acceptance Criteria
1. When ウィンドウサイズ変更イベントが連続発生する場合, the GOBBLETアプリ shall リサイズハンドラを150msのデバウンス処理で最適化する
2. The GOBBLETアプリ shall リサイズ処理の実行回数を1秒あたり最大7回に制限する
3. The GOBBLETアプリ shall cellSize、fixedHeight等の計算結果をメモ化（useMemo）し、依存値変更時のみ再計算する
4. When リサイズイベントが発生した場合, the GOBBLETアプリ shall レンダリング処理を100ms以内に完了する
5. The GOBBLETアプリ shall 不要な再レンダリングを防ぐため、useCallbackとuseMemoを適切に使用する
6. When デバウンス処理中にコンポーネントがアンマウントされる場合, the GOBBLETアプリ shall タイムアウトをクリアし、メモリリークを防止する

### Requirement 8: レスポンシブフォントサイズとUI要素
**Objective:** As a ゲーム利用者, I want 画面サイズに応じてフォントサイズとUI要素が適切にスケールされる, so that どの画面サイズでも読みやすく操作しやすい

#### Acceptance Criteria
1. The GOBBLETアプリ shall タイトルフォントサイズにclamp()関数を使用し、最小値、推奨値、最大値を設定する
2. The GOBBLETアプリ shall ボタンフォントサイズにclamp()関数を使用し、モバイルで14px以上、デスクトップで18px以下の範囲でスケールする
3. The GOBBLETアプリ shall メッセージテキストフォントサイズにclamp()関数を使用し、最小12px、最大16pxの範囲でスケールする
4. When ビューポート幅が375px未満の場合, the GOBBLETアプリ shall すべてのフォントサイズを最小値に固定する
5. The GOBBLETアプリ shall オプション画面のラベルとコントロールが小画面でも重ならず、適切に配置される

### Requirement 9: テスト品質保証
**Objective:** As a 開発チーム, I want レスポンシブデザインの品質を継続的に検証できる, so that デグレーションを防ぎ、全デバイスでの動作を保証できる

#### Acceptance Criteria
1. The 開発チーム shall iPhone SE（375x667）、iPad Mini（768x1024）、デスクトップ（1920x1080）の必須デバイスで手動検証テストを実施する
2. The 開発チーム shall 全ターゲットデバイスで表示崩れが0件であることを確認する
3. The 開発チーム shall タッチターゲット最小サイズ44px達成率が100%であることを検証する
4. The 開発チーム shall リサイズ時のレンダリング時間が100ms未満であることをパフォーマンステストで確認する
5. The 開発チーム shall 横向きモード対応率が100%（全画面で横向きレイアウトが機能）であることを確認する
6. The 開発チーム shall モバイルでのLighthouseパフォーマンススコアが90以上であることを検証する
7. The 開発チーム shall ユニットテストカバレッジが80%以上であることを確認する
8. The 開発チーム shall デバイス検出Hook（useDeviceType, useOrientation, useViewportSize）のユニットテストを実装する
9. The 開発チーム shall 計算関数（calculateFixedHeight, ensureMinTouchSize）のユニットテストを実装する
10. The 開発チーム shall レイアウト切り替えとスペーシング設定の統合テストを実装する

### Requirement 10: 後方互換性とマイグレーション
**Objective:** As a 既存ユーザー, I want アップデート後も以前の設定が保持される, so that 設定を再調整する手間なく引き続きゲームをプレイできる

#### Acceptance Criteria
1. The GOBBLETアプリ shall 既存のLocalStorageスペーシング設定（headerSpacing, topSpacing, bottomSpacing, messageSpacing）を読み込み、新しい動的計算に適用する
2. When 既存の固定値ベーススペーシング設定が存在する場合, the GOBBLETアプリ shall 新しいデバイス別スケール係数に自動変換する
3. If LocalStorageにスペーシング設定が存在しない場合, then the GOBBLETアプリ shall デフォルトスペーシング値（headerSpacing: 7, topSpacing: 13, bottomSpacing: 2, messageSpacing: 15）を適用する
4. The GOBBLETアプリ shall アップデート前の固定値282pxとほぼ同等のスペーシングをモバイル縦向きで再現する
5. The GOBBLETアプリ shall 既存のゲーム状態（進行中のゲーム、CPU難易度設定等）をレスポンシブ改善後も維持する
