import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Gobblet from '../../src/Gobblet';

describe('Gobblet - Viewport Height CSS Variable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // windowオブジェクトのモック
    global.innerWidth = 375;
    global.innerHeight = 667;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // CSS変数をクリーンアップ
    document.documentElement.style.removeProperty('--vh');
  });

  it('コンポーネントマウント時にCSS変数--vhを設定する', () => {
    render(<Gobblet />);

    const vhValue = document.documentElement.style.getPropertyValue('--vh');
    const expectedValue = `${667 * 0.01}px`;

    expect(vhValue).toBe(expectedValue);
  });

  it('ビューポート高さが変わったときにCSS変数--vhを更新する', () => {
    render(<Gobblet />);

    // 初期値を確認
    expect(document.documentElement.style.getPropertyValue('--vh')).toBe('6.67px');

    // ウィンドウサイズを変更
    global.innerHeight = 800;
    window.dispatchEvent(new Event('resize'));

    // デバウンスなしで即座に更新されることを確認
    const newVhValue = document.documentElement.style.getPropertyValue('--vh');
    expect(newVhValue).toBe('8px');
  });

  it('アンマウント時にリサイズイベントリスナーをクリーンアップする', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Gobblet />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('CSS変数--vhが正しいフォーマットで設定される', () => {
    global.innerHeight = 1000;
    render(<Gobblet />);

    const vhValue = document.documentElement.style.getPropertyValue('--vh');

    // 値が数値+pxの形式であることを確認
    expect(vhValue).toMatch(/^\d+(\.\d+)?px$/);
    expect(vhValue).toBe('10px');
  });

  it('複数回リサイズが発生しても正しく更新される', () => {
    render(<Gobblet />);

    // 1回目のリサイズ
    global.innerHeight = 700;
    window.dispatchEvent(new Event('resize'));
    expect(document.documentElement.style.getPropertyValue('--vh')).toBe('7px');

    // 2回目のリサイズ
    global.innerHeight = 900;
    window.dispatchEvent(new Event('resize'));
    expect(document.documentElement.style.getPropertyValue('--vh')).toBe('9px');

    // 3回目のリサイズ
    global.innerHeight = 600;
    window.dispatchEvent(new Event('resize'));
    expect(document.documentElement.style.getPropertyValue('--vh')).toBe('6px');
  });
});
