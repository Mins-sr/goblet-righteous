# レスポンシブデザイン改善計画書
**GOBBLET ゲームアプリケーション**

---

## 📊 現状分析

### 現在の実装状況
| 要素 | 実装状況 | 評価 |
|------|---------|------|
| ゲーム画面のcellSize | 動的計算（vh/vw基準） | ✓ 良好 |
| タイトル/オプション画面 | 最近修正、clamp()使用 | △ 改善余地あり |
| フォントサイズ | clamp()でレスポンシブ | ✓ 良好 |
| スペーシング設定 | 固定値＋ユーザー調整 | △ 画面サイズ非対応 |
| 横向きモード | 未対応 | ✗ 要対応 |
| タブレット最適化 | 未対応 | ✗ 要対応 |

### 主な問題点
1. **スペーシング計算の硬直性**：固定値（282px）ベースで画面サイズに適応しない
2. **横向きモード未対応**：縦長前提のレイアウト
3. **デバイス別最適化不足**：スマホ/タブレット/デスクトップの区別なし
4. **タッチターゲットサイズ**：小画面で最小タッチサイズ（44px）未達の可能性
5. **ビューポート高さの硬直性**：100vhがモバイルブラウザで問題を起こす可能性

---

## 🎯 改善目標

### 1. マルチデバイス対応
- スマートフォン（縦・横）
- タブレット（縦・横）
- デスクトップ（小・中・大）

### 2. パフォーマンス
- リサイズ時のジャンク削減
- スムーズなトランジション

### 3. UX向上
- タッチ操作の快適性
- 視認性の向上
- 全画面での最適表示

---

## 📋 改善計画

### **Phase 1: ブレークポイント戦略の策定** 🔵 優先度：高

#### 1.1 ブレークポイント定義
```javascript
const BREAKPOINTS = {
  mobile_s: 320,    // 小型スマホ（縦）
  mobile_m: 375,    // 中型スマホ（縦）
  mobile_l: 425,    // 大型スマホ（縦）
  tablet: 768,      // タブレット
  laptop: 1024,     // ノートPC
  desktop: 1440,    // デスクトップ
}

const ORIENTATIONS = {
  portrait: 'portrait',
  landscape: 'landscape'
}
```

#### 1.2 デバイス検出Hook作成
- `useDeviceType()` - 現在のデバイスタイプを返す
- `useOrientation()` - 画面の向きを返す
- `useViewportSize()` - ビューポートサイズを返す

**実装ファイル**: `src/hooks/useResponsive.js`（新規作成）

**実装例**:
```javascript
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('mobile');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};
```

---

### **Phase 2: 動的スペーシングシステム** 🔵 優先度：高

#### 2.1 スペーシング計算の動的化
**現在の問題**:
```javascript
const fixedElementsHeight = 282; // ハードコード
```

**改善案**:
```javascript
// デバイスとスペーシング設定に基づいて動的計算
const calculateFixedHeight = (deviceType, orientation, spacingOptions) => {
  const baseSpacing = {
    header: 24,
    stackArea: 70,
    messageBar: 30,
    buttons: 36,
    gaps: 36,
    padding: 16,
  };

  // デバイス別のスケール係数
  const scaleFactors = {
    mobile: orientation === 'landscape' ? 0.7 : 1.0,
    tablet: 1.1,
    desktop: 1.2,
  };

  const scale = scaleFactors[deviceType] || 1.0;

  // ユーザーのスペーシング設定を加算
  const userSpacing =
    spacingOptions.headerSpacing + HEADER_SPACING_OFFSET +
    spacingOptions.topSpacing + TOP_SPACING_OFFSET +
    spacingOptions.bottomSpacing + BOTTOM_SPACING_OFFSET +
    spacingOptions.messageSpacing + MESSAGE_SPACING_OFFSET;

  return (
    baseSpacing.header +
    baseSpacing.stackArea * 2 +
    baseSpacing.messageBar +
    baseSpacing.buttons +
    baseSpacing.gaps +
    baseSpacing.padding +
    userSpacing
  ) * scale;
};
```

#### 2.2 スペーシングのビューポート対応
- 小画面（<375px）：スペーシングを自動縮小（0.8倍）
- 中画面（375-768px）：標準スペーシング
- 大画面（>768px）：スペーシングを拡大（1.2倍）

**実装ファイル**: `src/Gobblet.jsx` - updateSize関数の拡張

---

### **Phase 3: 横向きモード対応** 🟡 優先度：中

#### 3.1 横向きレイアウト設計

**ゲーム画面（横向き）**:
```
┌─────────────────────────────────────────┐
│ Header          [CPU Stack]             │
│                                         │
│  [Board]        [Message]              │
│                                         │
│                 [YOU Stack]  [Buttons] │
└─────────────────────────────────────────┘
```

**変更点**:
- CPU Stack、Board、YOU Stack を横並びに再配置
- 最小幅要件：640px
- アスペクト比検出: `window.innerWidth > window.innerHeight * 1.2`

#### 3.2 タイトル/オプション画面（横向き）
- 2カラムレイアウトに変更
- 左：タイトル/説明、右：ボタン/設定

**実装例**:
```javascript
const isLandscape = window.innerWidth > window.innerHeight * 1.2;

return isLandscape ? (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div style={{ flex: 1 }}>{/* 左カラム */}</div>
    <div style={{ flex: 1 }}>{/* 右カラム */}</div>
  </div>
) : (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    {/* 縦レイアウト */}
  </div>
);
```

**実装ファイル**: `src/Gobblet.jsx` - 新規コンポーネント分岐

---

### **Phase 4: タブレット最適化** 🟡 優先度：中

#### 4.1 タブレット専用サイズ調整
- cellSize上限を70px → 90pxに拡大
- StackAreaを拡大（cellSize * 0.85 → 1.0）
- フォントサイズの最大値を拡大

**実装例**:
```javascript
const maxCellSize = deviceType === 'tablet' ? 90 : 70;
const stackBoxSize = deviceType === 'tablet' ? cellSize * 1.0 : cellSize * 0.85;
```

#### 4.2 タッチターゲット最適化
**現在の最小サイズ**:
- ボタン：padding 10px → 最低44px確保
- BoardCell：動的だが小画面で38px → 最低44px確保

**改善**:
```javascript
const MIN_TOUCH_TARGET = 44; // Apple HIG / Material Design 基準
const ensureMinTouchSize = (calculatedSize) =>
  Math.max(calculatedSize, MIN_TOUCH_TARGET);

// 使用例
const finalCellSize = ensureMinTouchSize(newCellSize);
```

**実装ファイル**: `src/Gobblet.jsx` - cellSize計算、ボタンスタイル

---

### **Phase 5: ビューポート高さの改善** 🟢 優先度：低

#### 5.1 100vh問題の解決
**現在の問題**:
- `minHeight: '100vh'` がモバイルブラウザのURL バー分ずれる

**改善案**:
```javascript
// App初期化時
useEffect(() => {
  const updateVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  updateVh();
  window.addEventListener('resize', updateVh);
  return () => window.removeEventListener('resize', updateVh);
}, []);

// スタイルで使用
minHeight: 'calc(var(--vh, 1vh) * 100)'
```

#### 5.2 SafeArea対応の強化
- 現在：`paddingTop: 'max(16px, env(safe-area-inset-top))'`
- 追加：bottom, left, right のsafe-area対応

```javascript
padding: '12px',
paddingTop: 'max(12px, env(safe-area-inset-top))',
paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
paddingLeft: 'max(12px, env(safe-area-inset-left))',
paddingRight: 'max(12px, env(safe-area-inset-right))',
```

**実装ファイル**: `src/Gobblet.jsx` - 全画面コンテナ

---

### **Phase 6: オプション画面のレスポンシブ強化** 🟢 優先度：低

#### 6.1 スライダーの改善
- 小画面：スライダー幅100%活用
- 大画面：maxWidth 300px → 500px

```javascript
maxWidth: deviceType === 'desktop' ? '500px' : '300px'
```

#### 6.2 プレビューの改善
- 小画面：縮小率 0.5 → 0.4
- 大画面：縮小率 0.5 → 0.7（見やすく）

```javascript
const previewScale = deviceType === 'mobile' ? 0.4 :
                     deviceType === 'tablet' ? 0.6 : 0.7;
```

**実装ファイル**: `src/Gobblet.jsx` - オプション画面セクション

---

### **Phase 7: パフォーマンス最適化** 🟢 優先度：低

#### 7.1 リサイズイベントのデバウンス
**現在の問題**:
```javascript
window.addEventListener('resize', updateSize);
// リサイズ毎に即実行 → パフォーマンス問題
```

**改善案**:
```javascript
// src/utils/debounce.js
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 使用例
const debouncedUpdateSize = debounce(updateSize, 150);
window.addEventListener('resize', debouncedUpdateSize);
```

#### 7.2 メモ化の活用
- 計算結果のキャッシュ
- 不要な再レンダリング防止

```javascript
const memoizedCellSize = useMemo(() => {
  return calculateCellSize(vh, vw, spacingOptions);
}, [vh, vw, spacingOptions]);
```

**実装ファイル**: `src/utils/debounce.js`（新規作成）

---

## 📐 具体的な実装ロードマップ

### **Sprint 1（1-2日）**: 基盤整備
- [ ] `useResponsive.js` Hook作成
- [ ] ブレークポイント定数定義
- [ ] デバイス検出ロジック実装
- [ ] テストケース作成

### **Sprint 2（2-3日）**: 動的スペーシング
- [ ] `calculateFixedHeight()` 関数実装
- [ ] スペーシングの自動スケーリング
- [ ] ゲーム画面のcellSize計算改善
- [ ] 小画面での表示確認

### **Sprint 3（3-4日）**: 横向きモード
- [ ] 横向き検出ロジック
- [ ] 横向きレイアウトコンポーネント作成
- [ ] 縦横切り替え時のスムーズなトランジション
- [ ] 各デバイスでの表示確認

### **Sprint 4（2-3日）**: タブレット最適化
- [ ] タブレット用サイズ調整
- [ ] タッチターゲット最小サイズ保証
- [ ] iPad / Android タブレットでの検証

### **Sprint 5（1-2日）**: 細部調整
- [ ] 100vh問題の解決
- [ ] SafeArea対応強化
- [ ] オプション画面の改善
- [ ] パフォーマンス最適化

### **Sprint 6（1日）**: 総合テスト
- [ ] 全デバイスでの動作確認
- [ ] 回帰テスト
- [ ] ドキュメント更新

---

## 🧪 テスト手法

### 1. ユニットテスト

#### 1.1 Hookのテスト
**ツール**: Jest + React Testing Library

```javascript
// src/hooks/__tests__/useResponsive.test.js
import { renderHook } from '@testing-library/react-hooks';
import { useDeviceType } from '../useResponsive';

describe('useDeviceType', () => {
  it('モバイルデバイスを正しく検出する', () => {
    global.innerWidth = 375;
    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe('mobile');
  });

  it('タブレットデバイスを正しく検出する', () => {
    global.innerWidth = 768;
    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe('tablet');
  });

  it('デスクトップデバイスを正しく検出する', () => {
    global.innerWidth = 1440;
    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe('desktop');
  });
});
```

#### 1.2 計算関数のテスト

```javascript
// src/utils/__tests__/calculations.test.js
import { calculateFixedHeight, ensureMinTouchSize } from '../calculations';

describe('calculateFixedHeight', () => {
  it('モバイル縦向きで正しい高さを計算する', () => {
    const result = calculateFixedHeight('mobile', 'portrait', {
      headerSpacing: 7,
      topSpacing: 13,
      bottomSpacing: 2,
      messageSpacing: 15,
    });
    expect(result).toBeCloseTo(282, 0);
  });

  it('タブレットで拡大された高さを返す', () => {
    const mobileHeight = calculateFixedHeight('mobile', 'portrait', {});
    const tabletHeight = calculateFixedHeight('tablet', 'portrait', {});
    expect(tabletHeight).toBeGreaterThan(mobileHeight);
  });
});

describe('ensureMinTouchSize', () => {
  it('最小サイズ未満の値を44pxに補正する', () => {
    expect(ensureMinTouchSize(30)).toBe(44);
  });

  it('最小サイズ以上の値はそのまま返す', () => {
    expect(ensureMinTouchSize(50)).toBe(50);
  });
});
```

### 2. 統合テスト

#### 2.1 レイアウト切り替えテスト

```javascript
// src/__tests__/Gobblet.integration.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Gobblet from '../Gobblet';

describe('Gobblet レイアウト統合テスト', () => {
  beforeEach(() => {
    // ビューポートサイズをリセット
    global.innerWidth = 375;
    global.innerHeight = 667;
  });

  it('モバイル縦向きで正しくレンダリングされる', () => {
    render(<Gobblet />);
    expect(screen.getByText('GOBBLET')).toBeInTheDocument();
  });

  it('画面回転時にレイアウトが切り替わる', () => {
    const { rerender } = render(<Gobblet />);

    // 横向きに変更
    global.innerWidth = 667;
    global.innerHeight = 375;
    fireEvent(window, new Event('resize'));

    rerender(<Gobblet />);
    // 横向きレイアウトの検証
  });
});
```

#### 2.2 スペーシング設定の統合テスト

```javascript
it('スペーシング変更がゲーム画面に反映される', async () => {
  render(<Gobblet />);

  // オプション画面を開く
  fireEvent.click(screen.getByText('⚙ Options'));

  // スペーシングを変更
  const slider = screen.getByRole('slider', { name: /header.*cpu/i });
  fireEvent.change(slider, { target: { value: '10' } });

  // 戻る
  fireEvent.click(screen.getByText('Back'));

  // ゲームを開始
  fireEvent.click(screen.getByText('Normal'));

  // スペーシングが適用されていることを確認
  // (DOM要素のmarginBottomなどをチェック)
});
```

### 3. ビジュアルリグレッションテスト

#### 3.1 Storybookスナップショット

**ツール**: Storybook + Chromatic / Percy

```javascript
// src/Gobblet.stories.js
import Gobblet from './Gobblet';

export default {
  title: 'Gobblet',
  component: Gobblet,
};

export const MobilePortrait = () => <Gobblet />;
MobilePortrait.parameters = {
  viewport: { defaultViewport: 'mobile1' },
};

export const MobileLandscape = () => <Gobblet />;
MobileLandscape.parameters = {
  viewport: { defaultViewport: 'mobile1' },
  chromatic: { viewports: [667] }, // 横向き
};

export const Tablet = () => <Gobblet />;
Tablet.parameters = {
  viewport: { defaultViewport: 'tablet' },
};

export const Desktop = () => <Gobblet />;
Desktop.parameters = {
  viewport: { defaultViewport: 'desktop' },
};
```

#### 3.2 Puppeteerスクリーンショット比較

```javascript
// tests/visual/screenshot.test.js
const puppeteer = require('puppeteer');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');

describe('ビジュアルリグレッションテスト', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('モバイル画面が前回と一致する', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/goblet-righteous/');

    const screenshot = await page.screenshot();
    const baseline = fs.readFileSync('./baselines/mobile.png');

    const diff = pixelmatch(
      PNG.sync.read(baseline).data,
      PNG.sync.read(screenshot).data,
      null,
      375,
      667,
      { threshold: 0.1 }
    );

    expect(diff).toBeLessThan(100); // 100px未満の差異
  });
});
```

### 4. E2Eテスト

#### 4.1 Playwrightによるマルチデバイステスト

```javascript
// tests/e2e/responsive.spec.js
import { test, expect, devices } from '@playwright/test';

test.describe('レスポンシブデザイン E2E', () => {
  test('iPhone 12でゲームがプレイ可能', async ({ page }) => {
    await page.goto('http://localhost:5173/goblet-righteous/');

    // ゲーム開始
    await page.click('text=Normal');

    // ボードが表示されることを確認
    await expect(page.locator('[style*="gridTemplateColumns"]')).toBeVisible();

    // タッチ操作のシミュレーション
    await page.click('[data-testid="stack-0"]');
    await page.click('[data-testid="cell-0-0"]');
  });

  test('iPad Proで横向きレイアウトが機能する', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro landscape']
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5173/goblet-righteous/');
    await page.click('text=Normal');

    // 横向きレイアウトの検証
    const layout = await page.evaluate(() => {
      return window.innerWidth > window.innerHeight * 1.2;
    });
    expect(layout).toBe(true);
  });
});
```

#### 4.2 実機テスト自動化（BrowserStack）

```javascript
// tests/e2e/browserstack.spec.js
const { remote } = require('webdriverio');

const capabilities = {
  'bstack:options': {
    os: 'iOS',
    osVersion: '15',
    deviceName: 'iPhone 13',
    realMobile: 'true',
  },
  browserName: 'safari',
};

describe('実機レスポンシブテスト', () => {
  let browser;

  beforeAll(async () => {
    browser = await remote({
      protocol: 'https',
      hostname: 'hub.browserstack.com',
      path: '/wd/hub',
      capabilities,
    });
  });

  afterAll(async () => {
    await browser.deleteSession();
  });

  it('iPhone 13実機でゲームが動作する', async () => {
    await browser.url('https://mins-sr.github.io/goblet-righteous/');

    const title = await browser.$('h1');
    await expect(title).toHaveText('GOBBLET');

    // ゲームプレイのフロー
    const normalButton = await browser.$('button=Normal');
    await normalButton.click();

    // 画面回転テスト
    await browser.setOrientation('landscape');
    await browser.pause(500);

    // レイアウトが横向きに切り替わったことを確認
  });
});
```

### 5. パフォーマンステスト

#### 5.1 Lighthouseスコア測定

```javascript
// tests/performance/lighthouse.test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

describe('パフォーマンステスト', () => {
  it('モバイルでLighthouseスコア90以上', async () => {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      formFactor: 'mobile',
    };

    const runnerResult = await lighthouse(
      'http://localhost:5173/goblet-righteous/',
      options
    );

    await chrome.kill();

    const score = runnerResult.lhr.categories.performance.score * 100;
    expect(score).toBeGreaterThanOrEqual(90);
  });
});
```

#### 5.2 リサイズパフォーマンス測定

```javascript
// tests/performance/resize.test.js
import { render } from '@testing-library/react';
import Gobblet from '../Gobblet';

describe('リサイズパフォーマンス', () => {
  it('1秒間に60回のリサイズでもスムーズ', async () => {
    const { container } = render(<Gobblet />);

    const startTime = performance.now();
    const resizeCount = 60;

    for (let i = 0; i < resizeCount; i++) {
      global.innerWidth = 375 + i * 5;
      global.innerHeight = 667 + i * 5;
      global.dispatchEvent(new Event('resize'));
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // 1秒以内に完了することを確認
    expect(duration).toBeLessThan(1000);
  });
});
```

### 6. アクセシビリティテスト

#### 6.1 axe-coreによる自動検証

```javascript
// tests/a11y/accessibility.test.js
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Gobblet from '../Gobblet';

expect.extend(toHaveNoViolations);

describe('アクセシビリティ', () => {
  it('タイトル画面にA11Y違反がない', async () => {
    const { container } = render(<Gobblet />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('タッチターゲットサイズが44px以上', () => {
    const { container } = render(<Gobblet />);
    const buttons = container.querySelectorAll('button');

    buttons.forEach(button => {
      const rect = button.getBoundingClientRect();
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    });
  });
});
```

### 7. マニュアルテスト

#### 7.1 デバイステストマトリクス

| デバイス | OS/Browser | 解像度 | 縦 | 横 | 担当者 | 結果 |
|---------|-----------|-------|---|---|--------|-----|
| iPhone SE | iOS 16/Safari | 375x667 | ✓ | ✓ | TBD | - |
| iPhone 14 Pro | iOS 17/Safari | 393x852 | ✓ | ✓ | TBD | - |
| iPhone 14 Pro Max | iOS 17/Safari | 430x932 | ✓ | ✓ | TBD | - |
| iPad Mini | iPadOS 16/Safari | 768x1024 | ✓ | ✓ | TBD | - |
| iPad Pro 11" | iPadOS 17/Safari | 834x1194 | ✓ | ✓ | TBD | - |
| iPad Pro 12.9" | iPadOS 17/Safari | 1024x1366 | ✓ | ✓ | TBD | - |
| Galaxy S21 | Android 13/Chrome | 360x800 | ✓ | ✓ | TBD | - |
| Pixel 7 | Android 14/Chrome | 412x915 | ✓ | ✓ | TBD | - |
| Desktop Chrome | Windows 11 | 1920x1080 | - | ✓ | TBD | - |
| Desktop Firefox | macOS | 1440x900 | - | ✓ | TBD | - |

#### 7.2 テストシナリオ

**シナリオ1: ゲームプレイフロー**
1. タイトル画面を確認（全要素が見える）
2. オプション画面を開く（スクロール可能、全要素が見える）
3. スペーシングを変更
4. ゲームを開始
5. コマを選択・配置
6. 画面を回転（横向き↔縦向き）
7. ゲームを最後までプレイ

**シナリオ2: レスポンシブ確認**
1. ブラウザウィンドウを最小サイズに
2. 徐々にウィンドウを拡大
3. 各ブレークポイントでレイアウトが適切に変化することを確認
4. オーバーフロー、要素の重なり、読めないテキストがないことを確認

**シナリオ3: タッチ操作**
1. 全てのボタンが指で押しやすいか
2. スライダーが操作しやすいか
3. ゲームボードのセルが正確にタップできるか
4. 誤タップが発生しないか

### 8. 継続的インテグレーション

#### 8.1 GitHub Actions設定

```yaml
# .github/workflows/responsive-test.yml
name: Responsive Design Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Run E2E tests
        run: npx playwright test

      - name: Run Lighthouse CI
        run: |
          npm run build
          npm install -g @lhci/cli
          lhci autorun

      - name: Visual regression tests
        run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
```

---

## テスト対象デバイス

### 必須テストデバイス（優先度：高）
| デバイス | 解像度 | 向き | 理由 |
|---------|-------|-----|------|
| iPhone SE | 375x667 | 縦・横 | 最小画面サイズの代表 |
| iPhone 14 Pro | 393x852 | 縦・横 | 一般的なモダンiPhone |
| iPad Mini | 768x1024 | 縦・横 | タブレット最小サイズ |

### 推奨テストデバイス（優先度：中）
| デバイス | 解像度 | 向き | 理由 |
|---------|-------|-----|------|
| iPhone 14 Pro Max | 430x932 | 縦・横 | 大型iPhone |
| iPad Pro 12.9" | 1024x1366 | 縦・横 | 最大タブレット |
| Galaxy S21 | 360x800 | 縦・横 | Android代表 |

### オプションテストデバイス（優先度：低）
| デバイス | 解像度 | 向き | 理由 |
|---------|-------|-----|------|
| Desktop | 1920x1080 | - | デスクトップユーザー |
| Pixel 7 | 412x915 | 縦・横 | 最新Android |

---

## 成功指標（KPI）

### 定量的指標
- [ ] 全ターゲットデバイスで表示崩れ 0件
- [ ] タッチターゲット最小サイズ 44px 達成率 100%
- [ ] リサイズ時のレンダリング時間 < 100ms
- [ ] 横向きモード対応率 100%
- [ ] Lighthouseスコア（モバイル） ≥ 90
- [ ] ユニットテストカバレッジ ≥ 80%

### 定性的指標
- [ ] ユーザーテストでの満足度 > 4.5/5.0
- [ ] 「画面が小さい」「見づらい」等のフィードバック削減
- [ ] 横向きモードでのプレイ快適性評価 > 4.0/5.0

---

## リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| 既存スペーシング設定との互換性 | 高 | 移行ロジック実装、デフォルト値調整 |
| パフォーマンス劣化 | 中 | デバウンス、メモ化、パフォーマンス計測 |
| 横向きモードのUX低下 | 中 | ユーザーテスト、A/Bテスト実施 |
| ブラウザ互換性問題 | 低 | Polyfill、代替実装準備 |
| テスト環境構築の複雑化 | 中 | Docker化、CI/CD自動化 |

---

## 実装時の注意事項

1. **後方互換性**: 既存のLocalStorage設定を壊さない
2. **段階的リリース**: フィーチャーフラグで段階的に有効化
3. **ドキュメント**: 各改善の理由と実装詳細を記録
4. **コードレビュー**: レスポンシブ関連の変更は慎重にレビュー
5. **ユーザーフィードバック**: ベータテスターからの意見収集
6. **テスト駆動**: 実装前にテストケースを作成

---

## 📅 想定スケジュール

**総所要期間**: 2-3週間

- **Week 1**: Sprint 1-2（基盤＋動的スペーシング）
  - Day 1-2: Hook作成とテスト
  - Day 3-5: スペーシング計算改善とテスト

- **Week 2**: Sprint 3-4（横向き＋タブレット）
  - Day 1-3: 横向きレイアウト実装
  - Day 4-5: タブレット最適化

- **Week 3**: Sprint 5-6（細部調整＋テスト）
  - Day 1-2: 細部調整とパフォーマンス最適化
  - Day 3-5: 総合テストとバグフィックス

---

## 📌 今後の拡張性

この計画完了後の発展的改善案：

1. **ダークモード対応**: システム設定に連動
2. **アニメーション強化**: Framer Motion導入
3. **PWA対応**: オフラインプレイ、ホーム画面追加
4. **マルチプレイヤー**: 画面分割での2人プレイ
5. **アクセシビリティ**: スクリーンリーダー対応、キーボード操作
6. **国際化**: 多言語対応
7. **テーマ機能**: カスタムカラースキーム

---

## 📚 参考資料

### デザインガイドライン
- [Apple Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design - Responsive layout grid](https://m3.material.io/foundations/layout/applying-layout/window-size-classes)
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### 技術ドキュメント
- [CSS clamp() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [CSS env() - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [Viewport concepts - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Viewport_concepts)

### テストツール
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Chromatic](https://www.chromatic.com/)
- [axe-core](https://github.com/dequelabs/axe-core)

---

**計画書作成日**: 2025-12-27
**現在のバージョン**: 1.9.0
**対象バージョン**: 2.0.0
**作成者**: Claude (AI UI Engineer)
**レビュアー**: TBD
