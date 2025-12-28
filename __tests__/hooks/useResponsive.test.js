import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeviceType, useOrientation, useViewportSize, BREAKPOINTS } from '../../src/hooks/useResponsive';

describe('useDeviceType', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('ビューポート幅767pxでmobileを返す', () => {
    global.innerWidth = 767;
    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe('mobile');
  });

  it('ビューポート幅768pxでtabletを返す', () => {
    global.innerWidth = 768;
    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe('tablet');
  });

  it('ビューポート幅1023pxでtabletを返す', () => {
    global.innerWidth = 1023;
    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe('tablet');
  });

  it('ビューポート幅1024px以上でdesktopを返す', () => {
    global.innerWidth = 1024;
    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe('desktop');
  });

  it('リサイズイベント発火時のデバウンス動作を検証', () => {
    global.innerWidth = 500;
    const { result } = renderHook(() => useDeviceType());

    expect(result.current).toBe('mobile');

    // ウィンドウサイズを変更
    act(() => {
      global.innerWidth = 800;
      window.dispatchEvent(new Event('resize'));
    });

    // デバウンス待機中（150ms未満）はmobileのまま
    expect(result.current).toBe('mobile');

    // 150ms経過後にtabletに更新される
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe('tablet');
  });
});

describe('useOrientation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('幅 <= 高さ × 1.2 の場合にportraitを返す', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('portrait');
  });

  it('幅 > 高さ × 1.2 の場合にlandscapeを返す', () => {
    global.innerWidth = 667;
    global.innerHeight = 375;
    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('landscape');
  });

  it('アスペクト比1.2倍の境界値をテスト', () => {
    global.innerWidth = 800;
    global.innerHeight = 666; // 800 / 666 ≈ 1.2012
    const { result } = renderHook(() => useOrientation());
    expect(result.current).toBe('landscape');

    global.innerWidth = 800;
    global.innerHeight = 667; // 800 / 667 ≈ 1.1994
    const { result: result2 } = renderHook(() => useOrientation());
    expect(result2.current).toBe('portrait');
  });

  it('リサイズイベント発火時のデバウンス動作を検証', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('portrait');

    // 画面を回転
    act(() => {
      global.innerWidth = 667;
      global.innerHeight = 375;
      window.dispatchEvent(new Event('resize'));
    });

    // デバウンス待機中（150ms未満）はportraitのまま
    expect(result.current).toBe('portrait');

    // 150ms経過後にlandscapeに更新される
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe('landscape');
  });
});

describe('useViewportSize', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('初期ビューポートサイズを正しく取得する', () => {
    global.innerWidth = 1024;
    global.innerHeight = 768;
    const { result } = renderHook(() => useViewportSize());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('リサイズイベント発火時のデバウンス動作を検証', () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    const { result } = renderHook(() => useViewportSize());

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);

    // ウィンドウサイズを変更
    act(() => {
      global.innerWidth = 768;
      global.innerHeight = 1024;
      window.dispatchEvent(new Event('resize'));
    });

    // デバウンス待機中（150ms未満）は元のサイズのまま
    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);

    // 150ms経過後に新しいサイズに更新される
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.width).toBe(768);
    expect(result.current.height).toBe(1024);
  });
});
