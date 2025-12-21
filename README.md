# 🎮 Gobblet

倧きな駒で盞手の駒を「食べる」こずができる戊略的な4目䞊べボヌドゲヌムです。ReactずGitHub Pagesで構築されおいたす。

**[🕹️ 今すぐプレむ](https://Mins-sr.github.io/goblet-righteous/)**

![Version](https://img.shields.io/badge/version-1.2.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 プレむダヌ向け

### 遊び方

**目的:** 自分の駒を瞊、暪、たたは斜めに4぀䞊べお勝利

**ナニヌクな芁玠:** 倧きな駒で小さな駒を芆うこずができ、ボヌドの状態が動的に倉化したす。

### ゲヌムルヌル

1. **セットアップ**
   - 4×4のゲヌムボヌド
   - 各プレむダヌは、サむズ1、2、3、4の駒が入った3぀のスタックを持぀
   - あなたは赀、CPUは青

2. **あなたの手番**
   - 自分のスタック䞋郚の駒をクリック たたは ボヌド䞊の自分の駒をクリック
   - 空のマスをクリック たたは 自分より小さい駒のマスをクリックしお配眮・移動
   - 自分より小さい駒だけを芆うこずができたす

3. **勝利条件**
   - 自分の色の駒を4぀䞊べる
   - 泚意: 駒を移動するず、その䞋に隠れおいた盞手の駒が珟れるこずがありたす

4. **難易床レベル**
   - **かんたん (★):** ランダムな手
   - **ふ぀う (★★):** 戊略的評䟡
   - **むずかしい (★★★):** ミニマックスアルゎリズムを䜿甚した高床なAI

### 操䜜方法

- **タップ/クリック** - スタックから駒を遞択
- **タップ/クリック** - ボヌド䞊の駒を移動
- **タップ/クリック** - 有効なマスに遞択した駒を配眮
- **Play Again** - 同じ難易床で再スタヌト
- **Menu** - 難易床遞択画面に戻る

---

## 🛠️ 開発者向け

### クむックスタヌト

```bash
# リポゞトリをクロヌン
git clone https://github.com/Mins-sr/goblet-righteous.git
cd goblet-righteous

# 䟝存関係をむンストヌル
npm install

# 開発サヌバヌを起動
npm run dev

# 本番ビルド
npm run build

# 本番ビルドのプレビュヌ
npm run preview
```

### 技術スタック

- **フレヌムワヌク:** React 18
- **ビルドツヌル:** Vite 7
- **スタむリング:** Inline CSS-in-JS
- **デプロむ:** GitHub Pages
- **CI/CD:** GitHub Actions

### プロゞェクト構造

```
goblet-righteous/
├── src/
│   ├── Gobblet.jsx       # メむンゲヌムコンポヌネント
│   ├── App.jsx           # Appラッパヌ
│   ├── index.css         # グロヌバルスタむル
│   └── main.jsx          # ゚ントリヌポむント
├── public/               # 静的アセット
├── .github/
│   └── workflows/
│       └── deploy.yml    # 自動デプロむ蚭定
├── vite.config.js        # Vite蚭定
└── README.md             # このファむル
```

### 䞻芁なコンポヌネント

#### `Gobblet.jsx`
以䞋を含むメむンゲヌムロゞック:
- **Pieceコンポヌネント:** サむズに基づいたスタむリングのゲヌム駒
- **BoardCellコンポヌネント:** 駒を重ねられる個別のボヌドマス
- **StackAreaコンポヌネント:** プレむダヌ/CPUの駒の保管゚リア
- **ゲヌム状態管理:** タヌン管理のためのReact Hooks
- **AIロゞック:** CPU手のためのミニマックスアルゎリズム

#### レスポンシブデザむン

レむアりトは動的蚈算を䜿甚しお、すべおの芁玠を画面に収めたす:

```javascript
// 高さ蚈算 (v1.2.1)
const totalFixedHeight =
  containerPadding + headerHeight + cpuStackHeight +
  playerStackHeight + messageHeight + buttonsHeight + gaps;

const availableForBoard = vh - totalFixedHeight;
const cellSize = (availableForBoard - 37) / 4;
```

- **最小cellSize:** 40px (iPhone SE互換性)
- **最倧cellSize:** 72px (最適なデスクトップ䜓隓)

### 開発スクリプト

```bash
# ホットリロヌド付き開発サヌバヌを起動
npm run dev

# 本番甚にビルド
npm run build

# 本番ビルドをロヌカルでプレビュヌ
npm run preview

# コヌドをリント (蚭定されおいる堎合)
npm run lint
```

### デプロむメント

**自動デプロむ:**
- `claude/deploy-gobblet-github-pages-SkeFm`ブランチにプッシュ
- GitHub Actionsが自動的にビルドしおGitHub Pagesにデプロむ
- 公開URL: https://Mins-sr.github.io/goblet-righteous/

**手動デプロむ:**

```bash
# プロゞェクトをビルド
npm run build

# GitHub Pagesにデプロむ (gh-pagesパッケヌゞを䜿甚する堎合)
npm run deploy
```

### 蚭定

**Vite蚭定 (`vite.config.js`):**
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/goblet-righteous/',  // GitHub Pagesのベヌスパス
})
```

**GitHub Actions (`deploy.yml`):**
- デプロむブランチぞのプッシュでトリガヌ
- `npm ci`ず`npm run build`でプロゞェクトをビルド
- アヌティファクトをGitHub Pagesにアップロヌド
- Pagesの自動有効化

### ブラりザサポヌト

- ✅ Chrome/Edge (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ モバむルブラりザ (iOS Safari, Chrome Mobile)

**レスポンシブブレヌクポむント:**
- iPhone SE (375×667) - 最小サポヌト
- 暙準モバむル (最倧430×932)
- タブレットずデスクトップ (自動スケヌル)

### ゲヌムロゞック

**AI実装:**

1. **かんたんモヌド:** ランダムな有効手の遞択
2. **ふ぀うモヌド:** ボヌド評䟡ヒュヌリスティック
3. **むずかしいモヌド:** アルファベヌタ枝刈り付きミニマックスアルゎリズム
   - 深さ: 3レベル
   - レベルごずに最倧20の最良手を評䟡
   - 勝利怜出ずブロック

**勝利条件チェック:**
```javascript
// すべおの行、列、察角線をチェック
// 同じ所有者の駒が4぀ (最䞊郚の駒のみ)
const checkWinner = (board) => {
  // 行、列、察角線をチェック
  // 'player'、'cpu'、たたはnullを返す
}
```

### 既知の問題

レスポンシブデザむンの詳现なドキュメントに぀いおは[RESPONSIVE_DESIGN_ISSUE.md](./RESPONSIVE_DESIGN_ISSUE.md)を参照しおください。

**v1.2.1ステヌタス:**
- ✅ モバむルでスクロヌル䞍芁
- ✅ すべおのUI芁玠が衚瀺される
- ✅ iPhone SE以䞊に最適化

### コントリビュヌト

1. リポゞトリをフォヌク
2. 機胜ブランチを䜜成 (`git checkout -b feature/amazing-feature`)
3. 倉曎をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリク゚ストを開く

### バヌゞョニング

**珟圚のバヌゞョン:** v1.2.1

**最近の曎新:**
- v1.2.1 - モバむルデバむス甚レスポンシブレむアりト修正
- v1.2.0 - バヌゞョン衚瀺ずレスポンシブデザむン远加
- v1.1.0 - 英語ロヌカラむれヌションずモバむル最適化
- v1.0.0 - AI実装を含む初回リリヌス

### テスト

**手動テストチェックリスト:**
- [ ] すべおの難易床でゲヌムが正しく開始される
- [ ] 駒を遞択しお配眮できる
- [ ] 倧きな駒が小さな駒を正しく芆う
- [ ] 勝利条件が適切に怜出される
- [ ] CPUが有効な手を打぀
- [ ] モバむルでのレスポンシブレむアりト (スクロヌルなし)
- [ ] "Play Again"ず"Menu"ボタンが機胜する
- [ ] バヌゞョン番号が正しく衚瀺される

**テストデバむス:**
- iPhone SE (375×667)
- iPhone 12/13 (390×844)
- iPhone 14 Pro Max (430×932)
- デスクトップ (1920×1080以䞊)

### パフォヌマンス

- **バンドルサむズ:** 玄206KB (gzip圧瞮: 玄65KB)
- **初回ロヌド:** 3Gで1秒未満
- **CPUタヌン遅延:** 800ms (より良いUXのため)
- **AI蚈算:** むずかしいモヌドで500ms未満

### ラむセンス

MITラむセンス - 孊習や個人䜿甚のために自由に䜿甚しおください。

### クレゞット

**ゲヌムデザむン:** クラシックなGobbletボヌドゲヌムに基づく
**開発者:** Claude (Anthropic AI) ず人間のコラボレヌション
**フォント:** Cinzel (Google Fonts)

---

## 🐛 バグレポヌトず機胜リク゚スト

バグを発芋したした アむデアはありたすか

こちらでIssueを開いおください: [GitHub Issues](https://github.com/Mins-sr/goblet-righteous/issues)

---

## 📱 スクリヌンショット

*以䞋を瀺すスクリヌンショットを远加:*
- 難易床遞択のあるタむトル画面
- プレむ䞭のゲヌムボヌド
- 勝利状態の衚瀺
- モバむルレスポンシブレむアりト

---

**React + Viteで❀を蟌めお䜜成**

*最終曎新: v1.2.1*
