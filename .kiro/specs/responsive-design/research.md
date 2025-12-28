# Research & Design Decisions

---
**Purpose**: responsive-design機能の設計を裏付ける調査結果とアーキテクチャ上の意思決定を記録します。

**Usage**:
- 設計フェーズで実施した調査活動と成果を記録
- design.mdに記載するには詳細すぎる設計上のトレードオフを文書化
- 将来の監査や再利用のための参照資料を提供
---

## Summary
- **Feature**: `responsive-design`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - Vitest + React Testing Libraryが2025年のVite+Reactプロジェクトに最適（Jest比10-20倍高速）
  - CSS safe-area-insetのブラウザサポートは96.78%（iOS Safari 11.1+で完全サポート）
  - React 19.2.0ではuseMemo/useCallbackの適用は慎重に行うべき（React Compilerが自動最適化）
  - 既存の`useResponsive.js`と`calculations.js`が80%完成しており、拡張ベースで実装可能

## Research Log

### テストフレームワーク選定: Vitest vs Jest

**Context**: package.jsonにテストフレームワークが未導入。Viteベースのプロジェクトに最適なテストツールを選定する必要がある。

**Sources Consulted**:
- Vitest vs Jest 2025比較記事（Medium, Speakeasy, Better Stack）
- Vitest公式ドキュメント（https://vitest.dev/guide/comparisons.html）
- React Testing Library公式ガイド（https://testing-library.com）

**Findings**:
- **Vitest推奨**: 2025年の新規Vite+ReactプロジェクトではVitestがほぼ全ての面でJestを上回る
- **パフォーマンス**: Vitestは独立テストでJestの10-20倍高速（特にwatch modeとTypeScript）
- **セットアップ**: Vitestは最小限の設定で済み、ViteとネイティブESM/TypeScriptサポート
- **エコシステム**: VoidZero社が$4.6Mの資金調達（Vite, Vitest, Rolldown統合）
- **移行コスト**: JestからVitestはAPIがほぼ互換（globals: true設定でdescribe, it, expectが使える）
- **React Testing Library統合**: `@testing-library/react`と完全互換、jsdom環境設定のみで動作

**Implications**:
- Vitestを採用し、テスト環境セットアップの複雑性を最小化
- package.json依存関係: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`
- vite.config.jsに`test.globals: true`, `test.environment: 'jsdom'`, `test.setupFiles`設定を追加

### CSS safe-area-insetブラウザサポート

**Context**: Requirement 6でビューポート高さ改善とSafeArea対応を実装。モバイルSafariでの互換性を確認する必要がある。

**Sources Consulted**:
- Can I Use（https://caniuse.com/?search=safe-area-inset）
- WebKit公式ブログ（https://webkit.org/blog/7929/designing-websites-for-iphone-x/）
- MDN env()ドキュメント（https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env）

**Findings**:
- **ブラウザサポート**: 96.78%（2025年時点）
- **Safari**: iOS Safari 11.1-26.2で完全サポート、11で部分サポート、10.1以前は非サポート
- **他ブラウザ**: Chrome 69+、Firefox 65+、Edge 79+で完全サポート
- **env()変数**: `env(safe-area-inset-top/bottom/left/right)`が利用可能
- **viewport-fit必須**: `<meta name="viewport" content="viewport-fit=cover">`の指定が必要（iOSのノッチ対応）

**Implications**:
- safe-area-insetは本番環境で安全に使用可能（97%サポート）
- index.htmlのviewportメタタグに`viewport-fit=cover`を追加
- env()値は`max()`と組み合わせてフォールバック指定（例: `max(12px, env(safe-area-inset-top))`）
- safe-area-inset非サポートブラウザでは12pxの固定値が適用される

### useMemo/useCallback パフォーマンス最適化戦略

**Context**: Requirement 7でパフォーマンス最適化を要求。React 19.2.0でのベストプラクティスを確認。

**Sources Consulted**:
- React Performance Optimization 2025（Growin blog）
- Josh W. Comeau useMemo/useCallback解説（https://www.joshwcomeau.com/react/usememo-and-usecallback/）
- Kent C. Dodds パフォーマンス最適化記事

**Findings**:
- **React Compiler**: React 19では実験的なCompilerが自動メモ化を提供（本プロジェクトでは未使用）
- **適用基準**: プロファイリングで計測可能な遅延（1ms以上）がある場合のみ適用
- **useMemo**: 高コスト計算（例: cellSize計算、fixedHeight計算）のメモ化に使用
- **useCallback**: 子コンポーネントにpropsとして渡す関数のメモ化に使用
- **過剰使用の弊害**: コード複雑性増加、かえってパフォーマンス低下の可能性
- **推奨アプローチ**: React DevTools Profilerで計測 → 10-20%以上の改善が見込める場合のみ適用

**Implications**:
- updateSize関数でのcellSize/fixedHeight計算にuseMemoを適用（計算コストが高い）
- リサイズイベントハンドラはデバウンスを優先（useMemoより効果的）
- 既存のゲームロジック関数（getValidMoves, applyMove）のuseCallbackは維持
- 新規コンポーネント（LandscapeGameLayout等）では慎重に適用判断

### デバウンス実装パターン

**Context**: Requirement 7でリサイズイベントのデバウンス処理（150ms）を要求。

**Sources Consulted**:
- Lodashデバウンス実装（参考）
- React Hooksパターン（カスタムフック内でのデバウンス）

**Findings**:
- **標準パターン**: setTimeout/clearTimeoutを使用したクロージャベース実装
- **Hookでの使用**: useEffect内でデバウンス関数を作成し、cleanup関数でclearTimeout
- **メモリリーク防止**: コンポーネントアンマウント時のタイムアウトクリアが必須
- **待機時間**: 150msが一般的（リサイズ体感とパフォーマンスのバランス）

**Implications**:
- `utils/debounce.js`を新規作成し、汎用デバウンス関数を提供
- `useResponsive.js`の各Hook内でデバウンス適用
- アンマウント時のcleanupをuseEffect return関数で確実に実行

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Extend Existing (Option A) | 既存のGobblet.jsx, useResponsive.js, calculations.jsを拡張 | 開発速度が速い、ファイル構成変更最小 | Gobblet.jsx肥大化（1,300行→1,400行超）、横向きレイアウト実装に不適 | 基盤整備（Phase 1）に適用 |
| Create New Components (Option B) | 横向きレイアウト用の新規コンポーネント作成 | 関心の分離、テスト容易、Gobblet.jsx肥大化防止 | ファイル数増加、Props設計が必要 | 横向きモード（Phase 2）に適用 |
| Hybrid Approach (Option C) | Phase別に最適アプローチを選択 | 段階的実装、リスク分散、各Phaseで価値提供 | 計画複雑性増加、Phase間依存管理 | **採用アプローチ** - gap-analysis.mdの推奨に基づく |

## Design Decisions

### Decision: Vitestをテストフレームワークとして採用

**Context**: package.jsonにテストフレームワークが未導入。Requirement 9でテスト品質保証を要求。

**Alternatives Considered**:
1. **Jest** — 最も人気のあるReactテストフレームワーク、エコシステム成熟度が高い
2. **Vitest** — Viteネイティブ、高速、TypeScript/ESMサポート、2025年推奨

**Selected Approach**: Vitest + React Testing Library

**Rationale**:
- Viteプロジェクトとの統合が容易（設定ファイル共有、プラグイン再利用）
- 10-20倍の実行速度向上（特にwatch mode）
- TypeScript, ESM, JSXがデフォルトサポート（追加設定不要）
- JestからのAPI移行コストが低い（globals: true設定）
- VoidZero社の投資により継続的な開発保証

**Trade-offs**:
- ✅ セットアップ簡易、実行速度大幅向上、Vite統合性
- ❌ Jestと比較してStack Overflowのリソースが少ない（ただし公式ドキュメントが充実）

**Follow-up**:
- vite.config.jsにtest設定追加
- package.jsonに依存関係追加: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- setupTests.tsで@testing-library/jest-dom拡張を読み込み

### Decision: 横向きレイアウトを新規コンポーネント化

**Context**: Requirement 3で横向きモードレイアウト対応を要求。Gobblet.jsxは既に1,300行超。

**Alternatives Considered**:
1. **Gobblet.jsx内で条件分岐** — 全てのロジックを既存ファイルに追加
2. **新規コンポーネント作成** — LandscapeGameLayout.jsxとLandscapeTitleLayout.jsxを分離
3. **カスタムHookで抽象化** — useGameLayoutHookを作成し、レイアウトロジックをHookに集約

**Selected Approach**: 新規コンポーネント作成（Option B）

**Rationale**:
- Gobblet.jsxのさらなる肥大化を防止（保守性向上）
- 横向きレイアウトを独立してテスト可能（テストカバレッジ向上）
- 縦向きと横向きの責務を明確に分離（Single Responsibility Principle）
- 既存の縦向きレイアウトに影響を与えない（リグレッションリスク低減）

**Trade-offs**:
- ✅ 保守性、テスト容易性、責務分離
- ❌ ファイル数増加（+2ファイル）、Props設計が必要

**Follow-up**:
- LandscapeGameLayout.jsxとLandscapeTitleLayout.jsxのPropsインターフェース定義
- Gobblet.jsx内でorientation状態に基づく条件分岐ロジック追加
- 640px最小幅チェックを条件分岐に統合

### Decision: CSS変数`--vh`をGobblet.jsxトップレベルで設定

**Context**: Requirement 6でビューポート高さ改善を要求。100vh問題をCSS変数で解決。

**Alternatives Considered**:
1. **App.jsxで設定** — アプリケーション全体で一度だけ設定
2. **Gobblet.jsxで設定** — ゲームコンポーネント内で設定
3. **カスタムHook作成** — useViewportHeightHookを作成し、CSS変数設定を抽象化

**Selected Approach**: Gobblet.jsxトップレベルuseEffectで設定（Option 2）

**Rationale**:
- Gobblet.jsxが全画面コンポーネントであり、ビューポート高さを直接使用
- App.jsxは薄いラッパーであり、ロジック追加には不適切
- CSS変数はグローバルスコープのため、一度設定すれば全コンポーネントで使用可能
- カスタムHook作成は過剰抽象化（このユースケースでは不要）

**Trade-offs**:
- ✅ シンプルな実装、既存アーキテクチャとの整合性
- ❌ Gobblet.jsxへのロジック追加（ただし10行程度のuseEffectのみ）

**Follow-up**:
- useEffect内でwindow.innerHeight計算し、CSS変数`--vh`を設定
- リサイズイベントでCSS変数を更新
- 全画面コンテナのminHeightを`calc(var(--vh, 1vh) * 100)`に変更

### Decision: デバウンス処理を`utils/debounce.js`に分離

**Context**: Requirement 7でリサイズイベントのデバウンス処理を要求。再利用可能なユーティリティとして実装。

**Alternatives Considered**:
1. **useResponsive.js内でインライン実装** — 各Hook内にデバウンスロジックを埋め込み
2. **utils/debounce.jsとして分離** — 汎用デバウンス関数を提供
3. **Lodashデバウンスをインストール** — 外部ライブラリ依存

**Selected Approach**: utils/debounce.jsとして分離（Option 2）

**Rationale**:
- 再利用可能なユーティリティとして他のHooksでも使用可能
- 依存関係追加なし（軽量実装、20行程度）
- テストが容易（単一責任の純粋関数）
- Lodashデバウンスは過剰（プロジェクト全体で1機能のみ使用）

**Trade-offs**:
- ✅ 再利用性、依存関係ゼロ、テスト容易性
- ❌ ファイル追加（+1ファイル）

**Follow-up**:
- `utils/debounce.js`を新規作成し、debounce関数をexport
- `useResponsive.js`の各HookでインポートしてuseEffect内で使用
- ユニットテスト（`__tests__/debounce.test.js`）を作成

## Risks & Mitigations

- **Risk 1: Gobblet.jsxの複雑性によるリグレッション** — 緩和策: 段階的実装、各変更後の手動検証、ユニットテスト並行作成
- **Risk 2: 横向きモードの状態管理が未検証** — 緩和策: Feature Flag導入、段階的ロールアウト、実機テスト（iPhone SE横向き、iPad Pro横向き）
- **Risk 3: タッチターゲット44px保証により小画面でボードサイズ縮小** — 緩和策: ensureMinTouchSize適用後の視覚的検証、必要に応じて最小幅要件の調整
- **Risk 4: テスト環境構築の失敗** — 緩和策: Vitest公式ドキュメントに従ったセットアップ、段階的なテスト追加（Hook → 計算関数 → 統合テスト）

## References
- [Vitest公式ドキュメント](https://vitest.dev/) — Viteネイティブテストフレームワーク
- [React Testing Library公式ガイド](https://testing-library.com/docs/react-testing-library/intro/) — React コンポーネントテストライブラリ
- [WebKit: Designing Websites for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) — SafeArea対応公式ガイド
- [Can I Use: safe-area-inset](https://caniuse.com/?search=safe-area-inset) — ブラウザサポート表
- [Josh W. Comeau: useMemo and useCallback](https://www.joshwcomeau.com/react/usememo-and-usecallback/) — パフォーマンス最適化ベストプラクティス
