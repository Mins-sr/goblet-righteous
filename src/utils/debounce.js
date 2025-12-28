/**
 * 関数実行を指定時間遅延し、連続呼び出しを抑制するデバウンス関数
 *
 * @template T
 * @param {T} func - デバウンスする関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {(...args: Parameters<T>) => void} デバウンスされた関数
 *
 * @example
 * const debouncedResize = debounce((event) => {
 *   console.log('Resize event:', event);
 * }, 150);
 *
 * window.addEventListener('resize', debouncedResize);
 */
export const debounce = (func, wait) => {
  let timeout = null;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
};
