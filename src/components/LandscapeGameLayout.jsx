import React from 'react';

/**
 * 横向きゲーム画面レイアウトコンポーネント (Task 8.1, 10.2)
 *
 * CPU Stack、Board、YOU Stackを水平配置し、
 * 全要素が画面内に収まるよう最適化されたレイアウトを提供
 * Task 10.2: レイアウト切り替え時の300msトランジションアニメーション対応
 *
 * @param {Object} props - コンポーネントのprops
 * @param {Array} props.board - 4x4のゲームボード配列
 * @param {Object} props.stacks - プレイヤーとCPUのスタック
 * @param {number} props.cellSize - セルのサイズ（px）
 * @param {Object|null} props.selectedPiece - 選択中のピース情報
 * @param {string} props.currentTurn - 現在のターン（'player' | 'cpu'）
 * @param {string} props.message - メッセージテキスト
 * @param {Function} props.onCellClick - セルクリック時のハンドラ
 * @param {Function} props.onStackClick - スタッククリック時のハンドラ
 * @param {Function} props.handleBoardPieceClick - ボード上のピースクリック時のハンドラ
 * @param {Function} props.resetGame - ゲームリセットのハンドラ
 * @param {Function} props.copyGameLog - ゲームログコピーのハンドラ
 * @param {Function} props.canPlaceAt - セルへの配置可否判定関数
 * @param {string|null} props.winner - 勝者（'player' | 'cpu' | null）
 * @param {boolean} props.copySuccess - ログコピー成功フラグ
 * @param {string} props.difficulty - 難易度（'easy' | 'normal' | 'hard' | 'ultrahard'）
 * @param {React.Component} props.BoardCell - BoardCellコンポーネント
 * @param {React.Component} props.StackArea - StackAreaコンポーネント
 */
const LandscapeGameLayout = ({
  board,
  stacks,
  cellSize,
  selectedPiece,
  currentTurn,
  message,
  onCellClick,
  onStackClick,
  handleBoardPieceClick,
  resetGame,
  copyGameLog,
  canPlaceAt,
  winner,
  copySuccess,
  difficulty,
  BoardCell,
  StackArea,
  setGameStarted,
  deviceType,
}) => {
  return (
    <div style={{
      height: 'calc(var(--vh, 1vh) * 100)',
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(135deg, #2c1810 0%, #4a3728 50%, #2c1810 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 'max(8px, env(safe-area-inset-top))',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      paddingLeft: 'max(8px, env(safe-area-inset-left))',
      paddingRight: 'max(8px, env(safe-area-inset-right))',
      fontFamily: '"Cinzel", Georgia, serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
      // Task 10.2: レイアウト切り替えトランジション（300ms、ちらつき防止）
      opacity: 1,
      transition: 'opacity 300ms ease-in-out',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <h1 style={{
          fontSize: '16px',
          color: '#d4a574',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '2px',
          margin: 0,
        }}>
          GOBBLET
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            color: '#a89070',
            fontSize: '11px',
          }}>
            {difficulty === 'easy' ? '★' : difficulty === 'normal' ? '★★' : difficulty === 'hard' ? '★★★' : '★★★★'}
          </span>
          <span style={{
            color: '#6d5d47',
            fontSize: '8px',
            fontFamily: 'monospace',
          }}>
            v1.9.0
          </span>
        </div>
      </div>

      {/* 横並びコンテナ */}
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '900px',
      }}>
        {/* 左カラム: Board */}
        <div style={{ flex: '0 0 auto' }}>
          <div style={{
            padding: '8px',
            background: 'linear-gradient(145deg, #6d5d47, #5d4e37)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)',
            border: '3px solid #8b7355',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(4, ${cellSize}px)`,
              gap: '5px',
            }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <BoardCell
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    rowIndex={rowIndex}
                    colIndex={colIndex}
                    onCellClick={(r, c) => {
                      if (cell.length > 0 && cell[cell.length - 1].owner === 'player' && !selectedPiece) {
                        handleBoardPieceClick(r, c);
                      } else {
                        onCellClick(r, c);
                      }
                    }}
                    canPlace={canPlaceAt(rowIndex, colIndex)}
                    cellSize={cellSize}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右カラム: CPU Stack, Message, YOU Stack, Buttons */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: '200px',
        }}>
          {/* CPU Stack */}
          <StackArea
            stacks={stacks.cpu}
            owner="cpu"
            onStackClick={() => {}}
            selectedPiece={null}
            isPlayerTurn={false}
            label="CPU"
            cellSize={cellSize}
            deviceType={deviceType}
          />

          {/* Message */}
          <div style={{
            width: '100%',
            padding: '6px 14px',
            background: winner
              ? (winner === 'player' ? 'linear-gradient(180deg, #27ae60, #1e8449)' : 'linear-gradient(180deg, #e74c3c, #c0392b)')
              : 'linear-gradient(180deg, #5d4e37, #4a3f2f)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <p style={{
              color: '#f5e6d3',
              fontSize: deviceType === 'tablet' ? '13.2px' : '11px',
              textAlign: 'center',
              margin: 0,
            }}>
              {message}
            </p>
          </div>

          {/* YOU Stack */}
          <StackArea
            stacks={stacks.player}
            owner="player"
            onStackClick={onStackClick}
            selectedPiece={selectedPiece}
            isPlayerTurn={currentTurn === 'player'}
            label="YOU"
            cellSize={cellSize}
            deviceType={deviceType}
          />

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <button
              onClick={resetGame}
              style={{
                padding: '6px 12px',
                fontSize: '10px',
                fontFamily: '"Cinzel", serif',
                background: 'linear-gradient(180deg, #8b7355 0%, #6d5d47 100%)',
                border: '2px solid #a89070',
                borderRadius: '6px',
                color: '#f5e6d3',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              Play Again
            </button>

            {winner && (
              <button
                onClick={copyGameLog}
                style={{
                  padding: '6px 12px',
                  fontSize: '10px',
                  fontFamily: '"Cinzel", serif',
                  background: copySuccess
                    ? 'linear-gradient(180deg, #27ae60 0%, #1e8449 100%)'
                    : 'linear-gradient(180deg, #2471a3 0%, #1a5276 100%)',
                  border: '2px solid #5dade2',
                  borderRadius: '6px',
                  color: '#f5e6d3',
                  cursor: 'pointer',
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                {copySuccess ? 'Copied!' : 'Copy Log'}
              </button>
            )}

            <button
              onClick={() => setGameStarted(false)}
              style={{
                padding: '6px 12px',
                fontSize: '10px',
                fontFamily: '"Cinzel", serif',
                background: 'linear-gradient(180deg, #5d4e37 0%, #4a3f2f 100%)',
                border: '2px solid #6d5d47',
                borderRadius: '6px',
                color: '#a89070',
                cursor: 'pointer',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscapeGameLayout;
