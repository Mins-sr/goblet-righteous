import { describe, it, expect } from 'vitest';
import {
  calculateFixedHeight,
  ensureMinTouchSize,
  getMaxCellSize,
  getStackBoxSizeFactor,
  getSpacingScale,
  HEADER_SPACING_OFFSET,
  TOP_SPACING_OFFSET,
  BOTTOM_SPACING_OFFSET,
  MESSAGE_SPACING_OFFSET,
} from '../../src/utils/calculations';

describe('calculateFixedHeight', () => {
  const defaultSpacingOptions = {
    headerSpacing: 7,
    topSpacing: 13,
    bottomSpacing: 2,
    messageSpacing: 15,
  };

  it('mobileデバイス（縦向き）でスケール1.0を適用する', () => {
    const result = calculateFixedHeight('mobile', 'portrait', defaultSpacingOptions);

    // 基本要素: 24 + 70*2 + 30 + 36 + 36 + 16 = 282
    // ユーザースペーシング: (7+6) + (13+10) + (2+20) + (15+6) = 79
    // 合計: 282 * 1.0 + 79 = 361
    expect(result).toBe(361);
  });

  it('mobileデバイス（横向き）でスケール0.7を適用する', () => {
    const result = calculateFixedHeight('mobile', 'landscape', defaultSpacingOptions);

    // 基本要素: 282 * 0.7 = 197.4
    // ユーザースペーシング: 79
    // 合計: 197.4 + 79 = 276.4
    expect(result).toBe(276.4);
  });

  it('tabletデバイスでスケール1.1を適用する', () => {
    const result = calculateFixedHeight('tablet', 'portrait', defaultSpacingOptions);

    // 基本要素: 282 * 1.1 = 310.2
    // ユーザースペーシング: 79
    // 合計: 310.2 + 79 = 389.2
    expect(result).toBeCloseTo(389.2, 1);
  });

  it('desktopデバイスでスケール1.2を適用する', () => {
    const result = calculateFixedHeight('desktop', 'portrait', defaultSpacingOptions);

    // 基本要素: 282 * 1.2 = 338.4
    // ユーザースペーシング: 79
    // 合計: 338.4 + 79 = 417.4
    expect(result).toBe(417.4);
  });

  it('カスタムスペーシングオプションを正しく計算する', () => {
    const customSpacing = {
      headerSpacing: 10,
      topSpacing: 20,
      bottomSpacing: 5,
      messageSpacing: 20,
    };

    const result = calculateFixedHeight('mobile', 'portrait', customSpacing);

    // ユーザースペーシング: (10+6) + (20+10) + (5+20) + (20+6) = 97
    // 合計: 282 * 1.0 + 97 = 379
    expect(result).toBe(379);
  });
});

describe('ensureMinTouchSize', () => {
  it('30pxを44pxに補正する', () => {
    expect(ensureMinTouchSize(30)).toBe(44);
  });

  it('50pxはそのまま返す', () => {
    expect(ensureMinTouchSize(50)).toBe(50);
  });

  it('44pxちょうどはそのまま返す', () => {
    expect(ensureMinTouchSize(44)).toBe(44);
  });

  it('カスタム最小サイズを指定できる', () => {
    expect(ensureMinTouchSize(30, 48)).toBe(48);
    expect(ensureMinTouchSize(50, 48)).toBe(50);
  });

  it('0以下の値でも最小サイズを保証する', () => {
    expect(ensureMinTouchSize(0)).toBe(44);
    expect(ensureMinTouchSize(-10)).toBe(44);
  });
});

describe('getMaxCellSize', () => {
  it('mobileで70pxを返す', () => {
    expect(getMaxCellSize('mobile')).toBe(70);
  });

  it('tabletで90pxを返す', () => {
    expect(getMaxCellSize('tablet')).toBe(90);
  });

  it('desktopで90pxを返す', () => {
    expect(getMaxCellSize('desktop')).toBe(90);
  });

  it('不明なデバイスタイプでデフォルト70pxを返す', () => {
    expect(getMaxCellSize('unknown')).toBe(70);
  });
});

describe('getStackBoxSizeFactor', () => {
  it('mobileで0.85を返す', () => {
    expect(getStackBoxSizeFactor('mobile')).toBe(0.85);
  });

  it('tabletで1.0を返す', () => {
    expect(getStackBoxSizeFactor('tablet')).toBe(1.0);
  });

  it('desktopで1.0を返す', () => {
    expect(getStackBoxSizeFactor('desktop')).toBe(1.0);
  });

  it('不明なデバイスタイプでデフォルト0.85を返す', () => {
    expect(getStackBoxSizeFactor('unknown')).toBe(0.85);
  });
});

describe('getSpacingScale', () => {
  it('ビューポート幅375px未満で0.8を返す', () => {
    expect(getSpacingScale(320)).toBe(0.8);
    expect(getSpacingScale(374)).toBe(0.8);
  });

  it('ビューポート幅375px以上768px未満で1.0を返す', () => {
    expect(getSpacingScale(375)).toBe(1.0);
    expect(getSpacingScale(500)).toBe(1.0);
    expect(getSpacingScale(767)).toBe(1.0);
  });

  it('ビューポート幅768px以上で1.2を返す', () => {
    expect(getSpacingScale(768)).toBe(1.2);
    expect(getSpacingScale(1024)).toBe(1.2);
    expect(getSpacingScale(1920)).toBe(1.2);
  });
});

describe('スペーシングオフセット定数', () => {
  it('正しい値が定義されている', () => {
    expect(HEADER_SPACING_OFFSET).toBe(6);
    expect(TOP_SPACING_OFFSET).toBe(10);
    expect(BOTTOM_SPACING_OFFSET).toBe(20);
    expect(MESSAGE_SPACING_OFFSET).toBe(6);
  });
});
