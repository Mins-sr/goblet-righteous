import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../../src/utils/debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('150ms待機後に関数が実行される', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 150);

    debouncedFunc('test');

    // 150ms経過前は実行されない
    expect(mockFunc).not.toHaveBeenCalled();

    // 150ms経過後に実行される
    vi.advanceTimersByTime(150);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith('test');
  });

  it('連続呼び出し時に最新呼び出しのみ実行される', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 150);

    // 3回連続で呼び出し
    debouncedFunc('first');
    vi.advanceTimersByTime(50);
    debouncedFunc('second');
    vi.advanceTimersByTime(50);
    debouncedFunc('third');

    // 150ms経過
    vi.advanceTimersByTime(150);

    // 最新の呼び出しのみ実行される
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith('third');
  });

  it('クリーンアップ時のclearTimeout実行を検証', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 150);

    debouncedFunc('test');

    // タイムアウト実行前に新しい呼び出し
    vi.advanceTimersByTime(100);
    debouncedFunc('test2');

    // 最初のタイムアウトはクリアされ、2回目のタイムアウトのみ実行される
    vi.advanceTimersByTime(150);
    expect(mockFunc).toHaveBeenCalledTimes(1);
    expect(mockFunc).toHaveBeenCalledWith('test2');
  });

  it('複数の引数を正しく渡す', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 150);

    debouncedFunc('arg1', 'arg2', 123);
    vi.advanceTimersByTime(150);

    expect(mockFunc).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('異なる待機時間で正しく動作する', () => {
    const mockFunc = vi.fn();
    const debouncedFunc = debounce(mockFunc, 300);

    debouncedFunc('test');

    // 150ms経過では実行されない
    vi.advanceTimersByTime(150);
    expect(mockFunc).not.toHaveBeenCalled();

    // 300ms経過で実行される
    vi.advanceTimersByTime(150);
    expect(mockFunc).toHaveBeenCalledTimes(1);
  });
});
