/**
 * レスポンシブデザインのための計算ユーティリティ
 */

// スペーシングのオフセット（基準値）
export const HEADER_SPACING_OFFSET = 6;  // Header↔CPU間の基準値
export const TOP_SPACING_OFFSET = 10;    // CPU↔Board間の基準値
export const BOTTOM_SPACING_OFFSET = 20; // Board↔YOU間の基準値
export const MESSAGE_SPACING_OFFSET = 6; // YOU↔Message間の基準値

/**
 * 固定要素の高さを動的に計算
 * @param {string} deviceType - デバイスタイプ ('mobile' | 'tablet' | 'desktop')
 * @param {string} orientation - 画面の向き ('portrait' | 'landscape')
 * @param {Object} spacingOptions - ユーザーのスペーシング設定
 * @param {number} spacingOptions.headerSpacing - Header↔CPU間の調整値
 * @param {number} spacingOptions.topSpacing - CPU↔Board間の調整値
 * @param {number} spacingOptions.bottomSpacing - Board↔YOU間の調整値
 * @param {number} spacingOptions.messageSpacing - YOU↔Message間の調整値
 * @returns {number} 固定要素の合計高さ（px）
 */
export const calculateFixedHeight = (deviceType, orientation, spacingOptions) => {
  // 基本の固定要素サイズ
  const baseSpacing = {
    header: 24,        // Headerの高さ
    stackArea: 70,     // 各StackAreaの高さ
    messageBar: 30,    // MessageBarの高さ
    buttons: 36,       // Buttonsの高さ
    gaps: 36,          // その他のギャップ
    padding: 16,       // パディング
  };

  // デバイス別のスケール係数
  const scaleFactors = {
    mobile: orientation === 'landscape' ? 0.7 : 1.0,
    tablet: 1.1,
    desktop: 1.2,
  };

  const scale = scaleFactors[deviceType] || 1.0;

  // ユーザーのスペーシング設定を計算
  const userSpacing =
    (spacingOptions.headerSpacing + HEADER_SPACING_OFFSET) +
    (spacingOptions.topSpacing + TOP_SPACING_OFFSET) +
    (spacingOptions.bottomSpacing + BOTTOM_SPACING_OFFSET) +
    (spacingOptions.messageSpacing + MESSAGE_SPACING_OFFSET);

  // 基本要素の合計
  const baseTotal =
    baseSpacing.header +
    baseSpacing.stackArea * 2 +
    baseSpacing.messageBar +
    baseSpacing.buttons +
    baseSpacing.gaps +
    baseSpacing.padding;

  // スケールを適用（ユーザースペーシングには適用しない）
  return baseTotal * scale + userSpacing;
};

/**
 * ビューポート幅に応じたスペーシングスケールを取得
 * @param {number} viewportWidth - ビューポート幅（px）
 * @returns {number} スケール係数
 */
export const getSpacingScale = (viewportWidth) => {
  if (viewportWidth < 375) {
    return 0.8;  // 小画面：スペーシングを縮小
  } else if (viewportWidth < 768) {
    return 1.0;  // 中画面：標準スペーシング
  } else {
    return 1.2;  // 大画面：スペーシングを拡大
  }
};

/**
 * タッチターゲットの最小サイズを保証
 * @param {number} calculatedSize - 計算されたサイズ（px）
 * @param {number} minSize - 最小サイズ（デフォルト: 44px - Apple HIG / Material Design 基準）
 * @returns {number} 最小サイズ以上のサイズ
 */
export const ensureMinTouchSize = (calculatedSize, minSize = 44) => {
  return Math.max(calculatedSize, minSize);
};

/**
 * デバイスタイプに応じた最大cellSizeを取得
 * @param {string} deviceType - デバイスタイプ ('mobile' | 'tablet' | 'desktop')
 * @returns {number} 最大cellSize（px）
 */
export const getMaxCellSize = (deviceType) => {
  const maxSizes = {
    mobile: 70,
    tablet: 90,
    desktop: 90,
  };
  return maxSizes[deviceType] || 70;
};

/**
 * デバイスタイプに応じたStackBoxサイズの係数を取得
 * @param {string} deviceType - デバイスタイプ ('mobile' | 'tablet' | 'desktop')
 * @returns {number} StackBoxサイズの係数
 */
export const getStackBoxSizeFactor = (deviceType) => {
  const factors = {
    mobile: 0.85,
    tablet: 1.0,
    desktop: 1.0,
  };
  return factors[deviceType] || 0.85;
};
