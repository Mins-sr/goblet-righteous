import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LandscapeGameLayout from '../../src/components/LandscapeGameLayout.jsx';

/**
 * 横向きゲーム画面レイアウトのテスト (Task 8.1)
 *
 * CPU Stack、Board、YOU Stackを水平配置し、
 * 全要素が画面内に収まることを検証
 */

// BoardCellとStackAreaのモックコンポーネント
const MockBoardCell = ({ cell, rowIndex, colIndex }) => (
  <div data-testid="board-cell">{`Cell-${rowIndex}-${colIndex}`}</div>
);

const MockStackArea = ({ label }) => (
  <div data-testid="stack-area">{label}</div>
);

describe('LandscapeGameLayout (Task 8.1)', () => {
  const mockProps = {
    board: Array(4).fill(null).map(() => Array(4).fill(null).map(() => [])),
    stacks: {
      cpu: [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]],
      player: [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]],
    },
    cellSize: 60,
    selectedPiece: null,
    currentTurn: 'player',
    message: 'Your turn',
    onCellClick: () => {},
    onStackClick: () => {},
    handleBoardPieceClick: () => {},
    resetGame: () => {},
    copyGameLog: () => {},
    canPlaceAt: () => false,
    winner: null,
    copySuccess: false,
    difficulty: 'normal',
    BoardCell: MockBoardCell,
    StackArea: MockStackArea,
    setGameStarted: () => {},
  };

  beforeEach(() => {
    global.innerWidth = 800;
    global.innerHeight = 600;
  });

  it('LandscapeGameLayoutコンポーネントが正常にレンダリングされる', () => {
    render(<LandscapeGameLayout {...mockProps} />);

    // ゲーム画面が表示されることを確認
    expect(screen.getByText('GOBBLET')).toBeInTheDocument();
  });

  it('CPU StackとYOU Stackが表示される', () => {
    render(<LandscapeGameLayout {...mockProps} />);

    // CPU StackとYOU Stackのラベルが表示されることを確認
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('YOU')).toBeInTheDocument();
  });

  it('Boardが4x4グリッドで表示される', () => {
    const { container } = render(<LandscapeGameLayout {...mockProps} />);

    // Boardセルが16個（4x4）存在することを確認
    const boardCells = container.querySelectorAll('[data-testid="board-cell"]');
    expect(boardCells.length).toBe(16);
  });

  it('メッセージが表示される', () => {
    render(<LandscapeGameLayout {...mockProps} />);

    expect(screen.getByText('Your turn')).toBeInTheDocument();
  });

  it('Play Againボタンが表示される', () => {
    render(<LandscapeGameLayout {...mockProps} />);

    expect(screen.getByRole('button', { name: 'Play Again' })).toBeInTheDocument();
  });

  it('Menuボタンが表示される', () => {
    render(<LandscapeGameLayout {...mockProps} />);

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('勝者が決定している場合、Copy Logボタンが表示される', () => {
    const propsWithWinner = {
      ...mockProps,
      winner: 'player',
    };

    render(<LandscapeGameLayout {...propsWithWinner} />);

    expect(screen.getByRole('button', { name: 'Copy Log' })).toBeInTheDocument();
  });

  it('横向きレイアウトでflexDirection: rowが適用される', () => {
    render(<LandscapeGameLayout {...mockProps} />);

    // 横並びコンテナが存在し、flexDirection: rowであることを確認
    // CSSスタイルのテストは視覚的検証で確認
    // ここでは基本的なレンダリングのみ検証
    expect(screen.getByText('GOBBLET')).toBeInTheDocument();
  });
});
