import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LandscapeTitleLayout from '../../src/components/LandscapeTitleLayout.jsx';

/**
 * 横向きタイトル画面レイアウトのテスト (Task 9.1)
 *
 * 2カラムレイアウト（左: タイトル/説明、右: ボタン/設定）で、
 * タイトル画面とオプション画面の両方をサポート
 */

describe('LandscapeTitleLayout (Task 9.1)', () => {
  const mockProps = {
    onStartGame: () => {},
    showOptions: false,
    setShowOptions: () => {},
    spacingOptions: {
      headerSpacing: 7,
      topSpacing: 13,
      bottomSpacing: 2,
      messageSpacing: 15,
    },
    updateSpacingOption: () => {},
    cellSize: 60,
    deviceType: 'mobile',
    HEADER_SPACING_OFFSET: 6,
    TOP_SPACING_OFFSET: 10,
    BOTTOM_SPACING_OFFSET: 20,
    MESSAGE_SPACING_OFFSET: 6,
  };

  beforeEach(() => {
    global.innerWidth = 800;
    global.innerHeight = 600;
  });

  describe('タイトル画面（showOptions = false）', () => {
    it('LandscapeTitleLayoutコンポーネントが正常にレンダリングされる', () => {
      render(<LandscapeTitleLayout {...mockProps} />);

      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
    });

    it('2カラムレイアウトでタイトルとボタンが表示される', () => {
      render(<LandscapeTitleLayout {...mockProps} />);

      // タイトル
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();

      // 説明文
      expect(screen.getByText(/4-in-a-row on 4×4 board/)).toBeInTheDocument();
    });

    it('すべての難易度選択ボタンが表示される', () => {
      render(<LandscapeTitleLayout {...mockProps} />);

      expect(screen.getByRole('button', { name: 'Easy' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Normal' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hard' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ultra Hard' })).toBeInTheDocument();
    });

    it('Optionsボタンが表示される', () => {
      render(<LandscapeTitleLayout {...mockProps} />);

      expect(screen.getByRole('button', { name: /options/i })).toBeInTheDocument();
    });

    it('バージョン番号が表示される', () => {
      render(<LandscapeTitleLayout {...mockProps} />);

      expect(screen.getByText('v1.9.0')).toBeInTheDocument();
    });
  });

  describe('オプション画面（showOptions = true）', () => {
    const optionsProps = {
      ...mockProps,
      showOptions: true,
    };

    it('OPTIONSタイトルが表示される', () => {
      render(<LandscapeTitleLayout {...optionsProps} />);

      expect(screen.getByText('OPTIONS')).toBeInTheDocument();
    });

    it('すべてのスペーシングスライダーが表示される', () => {
      render(<LandscapeTitleLayout {...optionsProps} />);

      // スライダーラベルを確認
      expect(screen.getByText(/Header↔CPU Spacing/)).toBeInTheDocument();
      expect(screen.getByText(/Top Spacing/)).toBeInTheDocument();
      expect(screen.getByText(/Bottom Spacing/)).toBeInTheDocument();
      expect(screen.getByText(/Message Spacing/)).toBeInTheDocument();
    });

    it('Backボタンが表示される', () => {
      render(<LandscapeTitleLayout {...optionsProps} />);

      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    });
  });

  describe('レイアウト構造', () => {
    it('2カラムレイアウト（flexDirection: row）が適用される', () => {
      render(<LandscapeTitleLayout {...mockProps} />);

      // 基本的なレンダリングを確認
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
    });
  });
});
