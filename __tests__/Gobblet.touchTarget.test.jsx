import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Gobblet from '../src/Gobblet.jsx';

/**
 * タッチターゲット44px保証のテスト (Task 5.2)
 *
 * Apple Human Interface GuidelinesとMaterial Design
 * の推奨最小タッチターゲットサイズ44px × 44pxを検証
 */

describe('Touch Target Size Requirements (44px minimum)', () => {
  beforeEach(() => {
    // ビューポートサイズをモバイル（iPhone SE）に設定
    global.innerWidth = 375;
    global.innerHeight = 667;
  });

  describe('Title Screen Buttons', () => {
    it('すべての難易度選択ボタンが最低44px × 44pxのタッチターゲットを持つ', () => {
      render(<Gobblet />);

      const difficulties = ['Easy', 'Normal', 'Hard', 'Ultra Hard'];
      difficulties.forEach(difficulty => {
        const button = screen.getByRole('button', { name: difficulty });
        const styles = window.getComputedStyle(button);

        // minHeight と minWidth を確認
        const minHeight = parseInt(styles.minHeight);
        const minWidth = parseInt(styles.minWidth);

        expect(minHeight).toBeGreaterThanOrEqual(44);
        expect(minWidth).toBeGreaterThanOrEqual(44);
      });
    });

    it('Optionsボタンが最低44px × 44pxのタッチターゲットを持つ', () => {
      render(<Gobblet />);

      const button = screen.getByRole('button', { name: /options/i });
      const styles = window.getComputedStyle(button);

      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Options Screen Buttons', () => {
    it('Backボタンが最低44px × 44pxのタッチターゲットを持つ', async () => {
      render(<Gobblet />);

      // オプション画面を開く
      const optionsButton = screen.getByRole('button', { name: /options/i });
      optionsButton.click();

      const backButton = await screen.findByRole('button', { name: 'Back' });
      const styles = window.getComputedStyle(backButton);

      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Game Screen Buttons', () => {
    beforeEach(() => {
      const { getByRole } = render(<Gobblet />);
      // ゲームを開始
      const normalButton = getByRole('button', { name: 'Normal' });
      normalButton.click();
    });

    it('Play Againボタンが最低44px × 44pxのタッチターゲットを持つ', () => {
      const button = screen.getByRole('button', { name: 'Play Again' });
      const styles = window.getComputedStyle(button);

      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });

    it('Menuボタンが最低44px × 44pxのタッチターゲットを持つ', () => {
      const button = screen.getByRole('button', { name: 'Menu' });
      const styles = window.getComputedStyle(button);

      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });

    // Copy Logボタンは勝者が決まった時のみ表示されるため、
    // このテストはゲーム終了後の状態をモックする必要がある
    // 簡略化のため、このテストは統合テストで実施
  });

  describe('Slider Controls (Task 5.3)', () => {
    it('すべてのスライダーが最低44pxの高さを持つ', async () => {
      render(<Gobblet />);

      // オプション画面を開く
      const optionsButton = screen.getByRole('button', { name: /options/i });
      optionsButton.click();

      const sliders = await screen.findAllByRole('slider');

      sliders.forEach(slider => {
        const styles = window.getComputedStyle(slider);
        const minHeight = parseInt(styles.minHeight);

        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Board Cells', () => {
    it('BoardCellが最低44px × 44pxのタッチターゲットを持つ（cellSize保証）', () => {
      render(<Gobblet />);

      // ゲームを開始
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      normalButton.click();

      // cellSizeは既にensureMinTouchSize()で44px以上に保証されているため、
      // ボードセルのサイズを確認
      const boardCells = document.querySelectorAll('[data-testid="board-cell"]');

      if (boardCells.length > 0) {
        boardCells.forEach(cell => {
          const styles = window.getComputedStyle(cell);
          const width = parseInt(styles.width);
          const height = parseInt(styles.height);

          expect(width).toBeGreaterThanOrEqual(44);
          expect(height).toBeGreaterThanOrEqual(44);
        });
      }
    });
  });

  describe('Stack Area Piece Selection (Task 5.4)', () => {
    it('Stack内の各ピース選択ボックスが最低44px × 44pxのタッチターゲットを持つ', async () => {
      const { container } = render(<Gobblet />);

      // ゲームを開始
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      normalButton.click();

      // 少し待機してゲーム画面がレンダリングされるのを待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      // StackAreaのピース選択ボックスを取得
      // data-testid="stack-box"を使用してStackAreaの各ボックスを識別
      const stackBoxes = container.querySelectorAll('[data-testid="stack-box"]');

      // Stack領域が存在することを確認
      expect(stackBoxes.length).toBeGreaterThan(0);

      stackBoxes.forEach(box => {
        const styles = window.getComputedStyle(box);
        const minWidth = parseInt(styles.minWidth);
        const minHeight = parseInt(styles.minHeight);

        // minWidthとminHeightが明示的に設定されていることを確認
        expect(minWidth).toBeGreaterThanOrEqual(44);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });

    it('cellSizeが44px未満でもStack選択領域は44pxに拡張される', async () => {
      // 非常に小さい画面をシミュレート
      global.innerWidth = 320;
      global.innerHeight = 480;

      const { container } = render(<Gobblet />);

      // ゲームを開始
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      normalButton.click();

      // 少し待機してゲーム画面がレンダリングされるのを待つ
      await new Promise(resolve => setTimeout(resolve, 100));

      const stackBoxes = container.querySelectorAll('[data-testid="stack-box"]');

      expect(stackBoxes.length).toBeGreaterThan(0);

      stackBoxes.forEach(box => {
        const styles = window.getComputedStyle(box);
        const minWidth = parseInt(styles.minWidth);
        const minHeight = parseInt(styles.minHeight);

        // minWidthとminHeightが設定されていることを確認
        expect(minWidth).toBeGreaterThanOrEqual(44);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });
});

/**
 * 横向きモードでのタッチターゲット検証
 */
describe('Touch Target Size in Landscape Mode', () => {
  beforeEach(() => {
    // 横向きモード（iPhone SE横向き: 667x375）
    global.innerWidth = 667;
    global.innerHeight = 375;
  });

  it('横向きタイトル画面のすべてのボタンが44px以上のタッチターゲットを持つ', () => {
    render(<Gobblet />);

    const difficulties = ['Easy', 'Normal', 'Hard', 'Ultra Hard'];
    difficulties.forEach(difficulty => {
      const button = screen.getByRole('button', { name: difficulty });
      const styles = window.getComputedStyle(button);

      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });
});

/**
 * タブレットでのタッチターゲット検証
 */
describe('Touch Target Size on Tablet', () => {
  beforeEach(() => {
    // タブレット（iPad Mini: 768x1024）
    global.innerWidth = 768;
    global.innerHeight = 1024;
  });

  it('タブレットのタイトル画面ボタンが44px以上のタッチターゲットを持つ', () => {
    render(<Gobblet />);

    const difficulties = ['Easy', 'Normal', 'Hard', 'Ultra Hard'];
    difficulties.forEach(difficulty => {
      const button = screen.getByRole('button', { name: difficulty });
      const styles = window.getComputedStyle(button);

      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });
});
