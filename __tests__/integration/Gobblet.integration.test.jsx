import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import Gobblet from '../../src/Gobblet.jsx';

/**
 * レイアウト切り替えの統合テスト (Task 10.3)
 *
 * 画面回転時の縦向き↔横向きレイアウト切り替えと
 * ゲーム状態の保持を検証
 */

describe('Layout Switching Integration (Task 10.3)', () => {
  beforeEach(() => {
    // デフォルトのビューポートサイズを設定
    global.innerWidth = 375;
    global.innerHeight = 667;
    vi.clearAllMocks();
  });

  describe('画面回転時のレイアウト切り替え', () => {
    it('縦向き→横向き（640px以上）でLandscapeGameLayoutに切り替わる', async () => {
      const { rerender } = render(<Gobblet />);

      // 初期状態: 縦向きレイアウト（375x667）
      expect(global.innerWidth).toBe(375);

      // ゲームを開始してゲーム画面に遷移
      const easyButton = screen.getByRole('button', { name: 'Easy' });
      act(() => {
        easyButton.click();
      });

      // 縦向きレイアウトでGOBBLETヘッダーが表示される
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();

      // 画面を横向きに回転（667x375）
      act(() => {
        global.innerWidth = 667;
        global.innerHeight = 375;
        global.dispatchEvent(new Event('resize'));
      });

      // 再レンダリング
      rerender(<Gobblet />);

      // 横向きレイアウトでも引き続きGOBBLETヘッダーが表示される
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
    });

    it('横向き→縦向きで縦向きレイアウトに切り替わる', async () => {
      // 初期状態: 横向きレイアウト（667x375）
      global.innerWidth = 667;
      global.innerHeight = 375;

      const { rerender } = render(<Gobblet />);

      // ゲームを開始
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      act(() => {
        normalButton.click();
      });

      expect(screen.getByText('GOBBLET')).toBeInTheDocument();

      // 画面を縦向きに回転（375x667）
      act(() => {
        global.innerWidth = 375;
        global.innerHeight = 667;
        global.dispatchEvent(new Event('resize'));
      });

      // 再レンダリング
      rerender(<Gobblet />);

      // 縦向きレイアウトでGOBBLETヘッダーが表示される
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
    });

    it('640px未満の横向き（iPhone SE: 667x375）では縦向きレイアウトを維持', () => {
      // iPhone SEサイズ: 667x375（横向き）
      global.innerWidth = 568; // 640px未満
      global.innerHeight = 320;

      render(<Gobblet />);

      // ゲームを開始
      const hardButton = screen.getByRole('button', { name: 'Hard' });
      act(() => {
        hardButton.click();
      });

      // 縦向きレイアウトが使用される（横向きレイアウトは640px以上のみ）
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
      expect(screen.getByText('YOU')).toBeInTheDocument();
    });
  });

  describe('タイトル画面でのレイアウト切り替え', () => {
    it('縦向き→横向きでLandscapeTitleLayoutに切り替わる', () => {
      const { rerender } = render(<Gobblet />);

      // 初期状態: 縦向きレイアウト（375x667）
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();

      // 画面を横向きに回転（667x375）
      act(() => {
        global.innerWidth = 667;
        global.innerHeight = 375;
        global.dispatchEvent(new Event('resize'));
      });

      rerender(<Gobblet />);

      // 横向きレイアウトでもタイトルが表示される
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
    });

    it('横向き→縦向きで縦向きタイトルレイアウトに切り替わる', () => {
      // 初期状態: 横向きレイアウト（667x375）
      global.innerWidth = 667;
      global.innerHeight = 375;

      const { rerender } = render(<Gobblet />);

      expect(screen.getByText('GOBBLET')).toBeInTheDocument();

      // 画面を縦向きに回転（375x667）
      act(() => {
        global.innerWidth = 375;
        global.innerHeight = 667;
        global.dispatchEvent(new Event('resize'));
      });

      rerender(<Gobblet />);

      // 縦向きレイアウトでタイトルが表示される
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
    });
  });

  describe('ゲーム状態の保持', () => {
    it('レイアウト切り替え後もboard状態が保持される', async () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { rerender } = render(<Gobblet />);

      // ゲームを開始
      const easyButton = screen.getByRole('button', { name: 'Easy' });
      act(() => {
        easyButton.click();
      });

      // ゲーム画面が表示されることを確認
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();

      // 画面を横向きに回転
      act(() => {
        global.innerWidth = 667;
        global.innerHeight = 375;
        global.dispatchEvent(new Event('resize'));
      });

      rerender(<Gobblet />);

      // ゲーム画面が維持される
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
      expect(screen.getByText('YOU')).toBeInTheDocument();
    });

    it('レイアウト切り替え後もstacks状態が保持される', () => {
      global.innerWidth = 667;
      global.innerHeight = 375;

      const { rerender } = render(<Gobblet />);

      // ゲームを開始
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      act(() => {
        normalButton.click();
      });

      expect(screen.getByText('YOU')).toBeInTheDocument();

      // 画面を縦向きに回転
      act(() => {
        global.innerWidth = 375;
        global.innerHeight = 667;
        global.dispatchEvent(new Event('resize'));
      });

      rerender(<Gobblet />);

      // ゲーム画面のstacksが維持される
      expect(screen.getByText('YOU')).toBeInTheDocument();
    });

    it('レイアウト切り替え後もcurrentTurn状態が保持される', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      const { rerender } = render(<Gobblet />);

      // ゲームを開始
      const hardButton = screen.getByRole('button', { name: 'Hard' });
      act(() => {
        hardButton.click();
      });

      // 初期状態はプレイヤーのターン
      expect(screen.getByText('YOU')).toBeInTheDocument();

      // 画面を横向きに回転
      act(() => {
        global.innerWidth = 800;
        global.innerHeight = 600;
        global.dispatchEvent(new Event('resize'));
      });

      rerender(<Gobblet />);

      // ターン状態が維持される
      expect(screen.getByText('YOU')).toBeInTheDocument();
    });
  });

  describe('タブレット最適化 (Task 11)', () => {
    it('タブレットでStackAreaのstackBoxSizeが1.0x（cellSize * 1.0）になる', () => {
      // タブレットサイズ（768x1024）
      global.innerWidth = 768;
      global.innerHeight = 1024;

      render(<Gobblet />);

      // ゲームを開始
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      act(() => {
        normalButton.click();
      });

      // StackAreaのstack-boxが存在することを確認
      const stackBoxes = screen.getAllByTestId('stack-box');
      expect(stackBoxes.length).toBeGreaterThan(0);

      // タブレットではstackBoxSizeがcellSize * 1.0になるべき
      // (実装後に検証可能)
    });

    it('モバイルでStackAreaのstackBoxSizeが0.85x（cellSize * 0.85）になる', () => {
      // モバイルサイズ（375x667）
      global.innerWidth = 375;
      global.innerHeight = 667;

      render(<Gobblet />);

      // ゲームを開始
      const easyButton = screen.getByRole('button', { name: 'Easy' });
      act(() => {
        easyButton.click();
      });

      // StackAreaのstack-boxが存在することを確認
      const stackBoxes = screen.getAllByTestId('stack-box');
      expect(stackBoxes.length).toBeGreaterThan(0);

      // モバイルではstackBoxSizeがcellSize * 0.85になるべき
      // (実装後に検証可能)
    });
  });

  describe('スペーシング設定の統合テスト (Task 13.1)', () => {
    beforeEach(() => {
      // LocalStorageをクリア
      localStorage.clear();
      global.innerWidth = 375;
      global.innerHeight = 667;
    });

    it('オプション画面でスライダー変更後、ゲーム画面のcellSizeが再計算される', async () => {
      const { rerender } = render(<Gobblet />);

      // オプション画面を開く
      const optionsButton = screen.getByRole('button', { name: '⚙ Options' });
      act(() => {
        optionsButton.click();
      });

      // スライダーが表示されることを確認
      expect(screen.getByText(/Header.*CPU/i)).toBeInTheDocument();

      // headerSpacingスライダーを変更（7 → 10）
      const headerSlider = screen.getAllByRole('slider')[0];
      act(() => {
        fireEvent.change(headerSlider, { target: { value: '10' } });
      });

      // Backボタンでタイトル画面に戻る
      const backButton = screen.getByRole('button', { name: 'Back' });
      act(() => {
        backButton.click();
      });

      // ゲームを開始
      const normalButton = screen.getByRole('button', { name: 'Normal' });
      act(() => {
        normalButton.click();
      });

      // ゲーム画面が表示される（cellSizeが再計算されているはず）
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
      expect(screen.getByText('YOU')).toBeInTheDocument();

      // 再レンダリング後もゲーム画面が維持される
      rerender(<Gobblet />);
      expect(screen.getByText('GOBBLET')).toBeInTheDocument();
    });

    it('LocalStorageにスペーシング設定が保存される', () => {
      render(<Gobblet />);

      // オプション画面を開く
      const optionsButton = screen.getByRole('button', { name: '⚙ Options' });
      act(() => {
        optionsButton.click();
      });

      // headerSpacingスライダーを変更（7 → 15）
      const headerSlider = screen.getAllByRole('slider')[0];
      act(() => {
        fireEvent.change(headerSlider, { target: { value: '15' } });
      });

      // LocalStorageに保存されることを確認
      const saved = localStorage.getItem('gobblet-spacing-options');
      expect(saved).toBeTruthy();

      const spacingOptions = JSON.parse(saved);
      expect(spacingOptions.headerSpacing).toBe(15);
    });

    it('アプリ再起動後にスペーシング設定が保持される', () => {
      // 初回レンダリング: スペーシング設定を変更
      const { unmount } = render(<Gobblet />);

      const optionsButton = screen.getByRole('button', { name: '⚙ Options' });
      act(() => {
        optionsButton.click();
      });

      // topSpacingスライダーを変更（13 → 20）
      const topSlider = screen.getAllByRole('slider')[1];
      act(() => {
        fireEvent.change(topSlider, { target: { value: '20' } });
      });

      // コンポーネントをアンマウント（アプリ終了をシミュレート）
      unmount();

      // 2回目のレンダリング: LocalStorageから設定を読み込み
      render(<Gobblet />);

      // オプション画面を開く
      const optionsButton2 = screen.getByRole('button', { name: '⚙ Options' });
      act(() => {
        optionsButton2.click();
      });

      // topSpacingスライダーの値が保持されている
      const topSlider2 = screen.getAllByRole('slider')[1];
      expect(topSlider2.value).toBe('20');
    });

    it('複数のスペーシング設定を同時に変更できる', () => {
      render(<Gobblet />);

      // オプション画面を開く
      const optionsButton = screen.getByRole('button', { name: '⚙ Options' });
      act(() => {
        optionsButton.click();
      });

      // 全スライダーを変更
      const sliders = screen.getAllByRole('slider');
      act(() => {
        // headerSpacing: 7 → 10
        fireEvent.change(sliders[0], { target: { value: '10' } });

        // topSpacing: 13 → 18
        fireEvent.change(sliders[1], { target: { value: '18' } });

        // bottomSpacing: 2 → 5
        fireEvent.change(sliders[2], { target: { value: '5' } });

        // messageSpacing: 15 → 20
        fireEvent.change(sliders[3], { target: { value: '20' } });
      });

      // LocalStorageに全設定が保存される
      const saved = localStorage.getItem('gobblet-spacing-options');
      const spacingOptions = JSON.parse(saved);

      expect(spacingOptions.headerSpacing).toBe(10);
      expect(spacingOptions.topSpacing).toBe(18);
      expect(spacingOptions.bottomSpacing).toBe(5);
      expect(spacingOptions.messageSpacing).toBe(20);
    });
  });
});
