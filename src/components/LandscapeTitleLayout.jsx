import React from 'react';

/**
 * 横向きタイトル画面レイアウトコンポーネント (Task 9.1, 10.2)
 *
 * 2カラムレイアウト（左: タイトル/説明、右: ボタン/設定）で、
 * タイトル画面とオプション画面の両方をサポート
 * Task 10.2: レイアウト切り替え時の300msトランジションアニメーション対応
 *
 * @param {Object} props - コンポーネントのprops
 * @param {Function} props.onStartGame - ゲーム開始ハンドラ
 * @param {boolean} props.showOptions - オプション画面表示フラグ
 * @param {Function} props.setShowOptions - オプション画面表示切り替え
 * @param {Object} props.spacingOptions - スペーシング設定
 * @param {Function} props.updateSpacingOption - スペーシング設定更新ハンドラ
 * @param {number} props.cellSize - セルサイズ
 * @param {string} props.deviceType - デバイスタイプ
 */
const LandscapeTitleLayout = ({
  onStartGame,
  showOptions,
  setShowOptions,
  spacingOptions,
  updateSpacingOption,
  cellSize,
  deviceType,
  HEADER_SPACING_OFFSET,
  TOP_SPACING_OFFSET,
  BOTTOM_SPACING_OFFSET,
  MESSAGE_SPACING_OFFSET,
}) => {
  // オプション画面の場合
  if (showOptions) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Cinzel", Georgia, serif',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
        boxSizing: 'border-box',
        overflow: 'auto',
        gap: '32px',
        // Task 10.2: レイアウト切り替えトランジション（300ms、ちらつき防止）
        opacity: 1,
        transition: 'opacity 300ms ease-in-out',
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

        {/* 左カラム: タイトル */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 5vw, 36px)',
            color: '#d4a574',
            textShadow: '0 4px 8px rgba(0,0,0,0.5)',
            margin: '0',
            letterSpacing: '4px',
          }}>
            OPTIONS
          </h2>
        </div>

        {/* 右カラム: 設定スライダー */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: deviceType === 'mobile' ? '300px' : '500px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            background: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            border: '2px solid #6d5d47',
          }}>
            {/* Header↔CPU間スペース設定 */}
            <div>
              <label style={{
                display: 'block',
                color: '#d4a574',
                fontSize: '13px',
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                Header↔CPU Spacing
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min={-HEADER_SPACING_OFFSET}
                  max="20"
                  value={spacingOptions.headerSpacing}
                  onChange={(e) => updateSpacingOption('headerSpacing', parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#d4a574',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                />
                <span style={{
                  color: '#f5e6d3',
                  fontSize: '12px',
                  minWidth: '36px',
                  textAlign: 'right',
                }}>
                  {spacingOptions.headerSpacing + HEADER_SPACING_OFFSET}px
                </span>
              </div>
            </div>

            {/* CPU↔Board間スペース設定 */}
            <div>
              <label style={{
                display: 'block',
                color: '#d4a574',
                fontSize: '13px',
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                Top Spacing (CPU↔Board)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min={-TOP_SPACING_OFFSET}
                  max="30"
                  value={spacingOptions.topSpacing}
                  onChange={(e) => updateSpacingOption('topSpacing', parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#d4a574',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                />
                <span style={{
                  color: '#f5e6d3',
                  fontSize: '12px',
                  minWidth: '36px',
                  textAlign: 'right',
                }}>
                  {spacingOptions.topSpacing + TOP_SPACING_OFFSET}px
                </span>
              </div>
            </div>

            {/* Board↔YOU間スペース設定 */}
            <div>
              <label style={{
                display: 'block',
                color: '#d4a574',
                fontSize: '13px',
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                Bottom Spacing (Board↔YOU)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min={-BOTTOM_SPACING_OFFSET}
                  max="20"
                  value={spacingOptions.bottomSpacing}
                  onChange={(e) => updateSpacingOption('bottomSpacing', parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#d4a574',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                />
                <span style={{
                  color: '#f5e6d3',
                  fontSize: '12px',
                  minWidth: '36px',
                  textAlign: 'right',
                }}>
                  {spacingOptions.bottomSpacing + BOTTOM_SPACING_OFFSET}px
                </span>
              </div>
            </div>

            {/* YOU↔Message間スペース設定 */}
            <div>
              <label style={{
                display: 'block',
                color: '#d4a574',
                fontSize: '13px',
                marginBottom: '8px',
                letterSpacing: '1px',
              }}>
                Message Spacing (YOU↔Message)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min={-MESSAGE_SPACING_OFFSET}
                  max="30"
                  value={spacingOptions.messageSpacing}
                  onChange={(e) => updateSpacingOption('messageSpacing', parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: '#d4a574',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                />
                <span style={{
                  color: '#f5e6d3',
                  fontSize: '12px',
                  minWidth: '36px',
                  textAlign: 'right',
                }}>
                  {spacingOptions.messageSpacing + MESSAGE_SPACING_OFFSET}px
                </span>
              </div>
            </div>

            {/* Backボタン */}
            <button
              onClick={() => setShowOptions(false)}
              style={{
                marginTop: '12px',
                marginBottom: '8px',
                padding: '10px 28px',
                fontSize: '13px',
                fontFamily: '"Cinzel", serif',
                background: 'linear-gradient(180deg, #8b7355 0%, #6d5d47 100%)',
                border: '2px solid #a89070',
                borderRadius: '10px',
                color: '#f5e6d3',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // タイトル画面
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Cinzel", Georgia, serif',
      paddingTop: 'max(16px, env(safe-area-inset-top))',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      paddingLeft: 'max(16px, env(safe-area-inset-left))',
      paddingRight: 'max(16px, env(safe-area-inset-right))',
      boxSizing: 'border-box',
      overflow: 'auto',
      gap: '32px',
      // Task 10.2: レイアウト切り替えトランジション（300ms、ちらつき防止）
      opacity: 1,
      transition: 'opacity 300ms ease-in-out',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* 左カラム: タイトルと説明 */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{
          fontSize: deviceType === 'tablet' ? 'clamp(28px, 6vw, 57.6px)' : 'clamp(28px, 6vw, 48px)',
          color: '#d4a574',
          textShadow: '0 4px 8px rgba(0,0,0,0.5), 0 0 40px rgba(212,165,116,0.3)',
          margin: '0 0 12px 0',
          letterSpacing: '6px',
        }}>
          GOBBLET
        </h1>

        <p style={{
          color: '#a89070',
          fontSize: 'clamp(11px, 2vw, 14px)',
          margin: '0',
          textAlign: 'center',
          maxWidth: '300px',
          lineHeight: '1.6',
        }}>
          4-in-a-row on 4×4 board. Cover with bigger pieces
        </p>
      </div>

      {/* 右カラム: ボタン */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        maxWidth: '280px',
      }}>
        {[
          { key: 'easy', label: 'Easy' },
          { key: 'normal', label: 'Normal' },
          { key: 'hard', label: 'Hard' },
          { key: 'ultrahard', label: 'Ultra Hard' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onStartGame(key)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: deviceType === 'tablet' ? '18px' : '15px',
              fontFamily: '"Cinzel", serif',
              background: 'linear-gradient(180deg, #8b7355 0%, #6d5d47 100%)',
              border: '2px solid #a89070',
              borderRadius: '10px',
              color: '#f5e6d3',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              minHeight: '44px',
              minWidth: '44px',
            }}
          >
            {label}
          </button>
        ))}

        <button
          onClick={() => setShowOptions(true)}
          style={{
            width: '100%',
            padding: '10px 24px',
            fontSize: deviceType === 'tablet' ? '14.4px' : '12px',
            fontFamily: '"Cinzel", serif',
            background: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)',
            border: '2px solid #6d5d47',
            borderRadius: '8px',
            color: '#a89070',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            minHeight: '44px',
            minWidth: '44px',
          }}
        >
          ⚙ Options
        </button>

        <div style={{
          color: '#6d5d47',
          fontSize: '9px',
          fontFamily: 'monospace',
          marginTop: '8px',
        }}>
          v1.9.0
        </div>
      </div>
    </div>
  );
};

export default LandscapeTitleLayout;
