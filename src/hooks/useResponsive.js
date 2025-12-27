import { useState, useEffect } from 'react';

/**
 * ブレークポイント定義
 * レスポンシブデザインの基準となる画面幅
 */
export const BREAKPOINTS = {
  mobile_s: 320,    // 小型スマホ（縦）
  mobile_m: 375,    // 中型スマホ（縦）
  mobile_l: 425,    // 大型スマホ（縦）
  tablet: 768,      // タブレット
  laptop: 1024,     // ノートPC
  desktop: 1440,    // デスクトップ
};

/**
 * 画面の向き定義
 */
export const ORIENTATIONS = {
  portrait: 'portrait',
  landscape: 'landscape'
};

/**
 * デバイスタイプを検出するカスタムフック
 * @returns {'mobile' | 'tablet' | 'desktop'} 現在のデバイスタイプ
 */
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('mobile');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < BREAKPOINTS.tablet) {
        setDeviceType('mobile');
      } else if (width < BREAKPOINTS.laptop) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};

/**
 * 画面の向きを検出するカスタムフック
 * @returns {'portrait' | 'landscape'} 現在の画面の向き
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState(
    window.innerWidth > window.innerHeight * 1.2
      ? ORIENTATIONS.landscape
      : ORIENTATIONS.portrait
  );

  useEffect(() => {
    const updateOrientation = () => {
      // 横向きの判定: 幅が高さの1.2倍以上の場合
      const isLandscape = window.innerWidth > window.innerHeight * 1.2;
      setOrientation(isLandscape ? ORIENTATIONS.landscape : ORIENTATIONS.portrait);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
};

/**
 * ビューポートサイズを取得するカスタムフック
 * @returns {{ width: number, height: number }} 現在のビューポートサイズ
 */
export const useViewportSize = () => {
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  return viewportSize;
};

/**
 * レスポンシブ情報をまとめて取得するカスタムフック
 * @returns {{
 *   deviceType: 'mobile' | 'tablet' | 'desktop',
 *   orientation: 'portrait' | 'landscape',
 *   viewportSize: { width: number, height: number },
 *   breakpoints: typeof BREAKPOINTS
 * }}
 */
export const useResponsive = () => {
  const deviceType = useDeviceType();
  const orientation = useOrientation();
  const viewportSize = useViewportSize();

  return {
    deviceType,
    orientation,
    viewportSize,
    breakpoints: BREAKPOINTS
  };
};
