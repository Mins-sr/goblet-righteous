import React from 'react';

// ブラキオサウルス（サイズ4 - 最大）
export const Brachiosaurus = ({ mainColor, bellyColor, size }) => (
  <svg viewBox="0 0 30 30" width={size} height={size}>
    <g stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={mainColor}>
      {/* 体 */}
      <ellipse cx="18" cy="21" rx="10" ry="6" />
      {/* 首（根元は左側から、カーブして右上へ） */}
      <path d="M10 18 Q6 12 10 6 Q16 1 24 3" fill="none" stroke={mainColor} strokeWidth="5" />
      <path d="M10 18 Q6 12 10 6 Q16 1 24 3" fill="none" stroke="#2c2c2c" strokeWidth="1.5" />
      {/* 頭（右上） */}
      <ellipse cx="26" cy="4" rx="3" ry="2.5" />
      {/* お腹 */}
      <ellipse cx="19" cy="23" rx="6" ry="3" fill={bellyColor} stroke="none" />
      {/* 目 */}
      <circle cx="27" cy="3.5" r="1" fill="#2c2c2c" stroke="none" />
      {/* 足 */}
      <line x1="12" y1="26" x2="11" y2="29" strokeWidth="2" />
      <line x1="24" y1="26" x2="25" y2="29" strokeWidth="2" />
      {/* 尻尾 */}
      <path d="M28 21 Q30 22 29 25" fill="none" />
    </g>
  </svg>
);

// ティラノサウルス（サイズ3 - 大）
export const TRex = ({ mainColor, bellyColor, size }) => (
  <svg viewBox="0 0 30 30" width={size} height={size}>
    <g stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={mainColor}>
      {/* 体 */}
      <ellipse cx="10" cy="18" rx="7" ry="5" />
      {/* 頭（大きめ、横長） */}
      <ellipse cx="22" cy="10" rx="6" ry="4.5" />
      {/* 顎（下顎を強調、大きく開いた口） */}
      <path d="M18 13 Q22 17 28 15" fill={mainColor} stroke="#2c2c2c" strokeWidth="1.5" />
      {/* 上顎のライン */}
      <path d="M26 8 L29 9" fill="none" />
      {/* 牙（上顎） */}
      <line x1="20" y1="12" x2="20" y2="14.5" stroke="#2c2c2c" strokeWidth="1.2" />
      <line x1="23" y1="11.5" x2="23.5" y2="14" stroke="#2c2c2c" strokeWidth="1.2" />
      <line x1="26" y1="11" x2="27" y2="13.5" stroke="#2c2c2c" strokeWidth="1.2" />
      {/* 首 */}
      <path d="M15 15 Q17 12 18 11" fill="none" stroke={mainColor} strokeWidth="4" />
      {/* お腹 */}
      <ellipse cx="10" cy="20" rx="4" ry="2.5" fill={bellyColor} stroke="none" />
      {/* 目（小さく鋭い） */}
      <circle cx="20" cy="8" r="1.2" fill="white" stroke="none" />
      <circle cx="20.3" cy="8" r="0.6" fill="#2c2c2c" stroke="none" />
      {/* 小さい腕＋鉤爪 */}
      <line x1="15" y1="16" x2="17" y2="18" />
      <path d="M17 18 L18 17.5 M17 18 L18 19" stroke="#2c2c2c" strokeWidth="1" />
      {/* 足（太く） */}
      <line x1="6" y1="22" x2="4" y2="28" strokeWidth="2.5" />
      <line x1="13" y1="22" x2="15" y2="28" strokeWidth="2.5" />
      {/* 尻尾 */}
      <path d="M3 18 Q1 17 1 19" fill="none" strokeWidth="2" />
    </g>
  </svg>
);

// ステゴサウルス（サイズ2 - 中）
export const Stegosaurus = ({ mainColor, bellyColor, size }) => (
  <svg viewBox="0 0 30 30" width={size} height={size}>
    <g stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={mainColor}>
      {/* 体 */}
      <ellipse cx="15" cy="19" rx="8" ry="4" />
      {/* 頭 */}
      <ellipse cx="25" cy="18" rx="3" ry="2.5" />
      {/* お腹 */}
      <ellipse cx="15" cy="20" rx="5" ry="2" fill={bellyColor} stroke="none" />
      {/* 背中のプレート */}
      <path d="M8 15 L9 11 L10 15" />
      <path d="M12 14 L13 9 L14 14" />
      <path d="M16 14 L17 10 L18 14" />
      <path d="M20 15 L21 12 L22 15" />
      {/* 目 */}
      <circle cx="26" cy="17" r="0.8" fill="#2c2c2c" stroke="none" />
      {/* 足 */}
      <line x1="11" y1="22" x2="11" y2="26" />
      <line x1="19" y1="22" x2="19" y2="26" />
      {/* 尻尾のスパイク */}
      <path d="M7 19 L4 17 M6 20 L3 20" fill="none" />
    </g>
  </svg>
);

// 恐竜の卵（サイズ1 - 小）
export const DinoEgg = ({ mainColor, bellyColor, size }) => (
  <svg viewBox="0 0 30 30" width={size} height={size}>
    <g stroke="#2c2c2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* 卵本体 */}
      <ellipse cx="15" cy="15" rx="4" ry="5" fill={mainColor} />
      {/* 卵の模様（斑点） */}
      <circle cx="13.5" cy="13" r="0.8" fill={bellyColor} stroke="none" />
      <circle cx="16.5" cy="15" r="1" fill={bellyColor} stroke="none" />
      <circle cx="14" cy="17.5" r="0.7" fill={bellyColor} stroke="none" />
      {/* ハイライト */}
      <ellipse cx="13.5" cy="12.5" rx="0.6" ry="1.2" fill="white" fillOpacity="0.5" stroke="none" />
    </g>
  </svg>
);

// サイズに応じた恐竜コンポーネントを返す
export const getDinosaurComponent = (size) => {
  switch (size) {
    case 4: return Brachiosaurus;
    case 3: return TRex;
    case 2: return Stegosaurus;
    case 1: return DinoEgg;
    default: return DinoEgg;
  }
};
