import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:5176/shirokuro-tsukenai-lever';

// Supabase Realtime の接続待機タイムアウト。
// 通常は数秒で同期するが、稀にジッターが出るので余裕を取る。
// それでも失敗するケースは playwright の retries で吸収する。
const REALTIME_TIMEOUT = 30_000;

/**
 * 参加画面でニックネームとアイコンを入力してルームに入る
 */
async function joinRoom(page: import('@playwright/test').Page, nickname: string) {
  await page.getByRole('textbox', { name: 'ニックネーム' }).fill(nickname);
  await page.getByRole('button', { name: '参加する' }).click();
}

/**
 * ルームを新規作成し、そのURLを返す
 */
async function createRoom(page: import('@playwright/test').Page): Promise<string> {
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'ルームを作成' }).click();
  // 参加画面に遷移するのを待つ
  await page.waitForURL(/\?room=/);
  return page.url();
}

test.describe('ルーム機能', () => {
  test('自分自身が結果マップに表示される', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    await createRoom(page);
    await joinRoom(page, 'ユーザーA');

    // 自分のニックネームが結果マップに表示される
    await expect(page.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    await ctx.close();
  });

  test('2人が同じルームに参加すると互いに見える', async ({ browser }) => {
    // ユーザーAがルームを作成
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    const roomUrl = await createRoom(pageA);
    await joinRoom(pageA, 'ユーザーA');

    // ユーザーAのPresence接続を待つ
    await expect(pageA.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    // ユーザーBが同じルームに参加（別コンテキスト = 別ユーザー）
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await pageB.goto(roomUrl);
    await joinRoom(pageB, 'ユーザーB');

    // ユーザーBのページにユーザーAが表示されること
    await expect(pageB.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });
    // ユーザーBのページに自分（ユーザーB）が表示されること
    await expect(pageB.getByText('ユーザーB')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    // ユーザーAのページにユーザーBが表示されること
    await expect(pageA.getByText('ユーザーB')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    await ctxA.close();
    await ctxB.close();
  });

  test('レバーの値が結果マップに反映される', async ({ browser }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await createRoom(pageA);
    await joinRoom(pageA, 'ユーザーA');
    await expect(pageA.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    // 結果マップに初期値50が表示されること
    // ユーザーAのアイコン下の数値を確認（結果マップ内）
    const mapSection = pageA.locator('.room-page__map');
    await expect(mapSection.getByText('50').first()).toBeVisible();

    await ctxA.close();
  });

  test('ユーザーBのレバー値がユーザーAの結果マップにリアルタイム反映される', async ({
    browser,
  }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    const roomUrl = await createRoom(pageA);
    await joinRoom(pageA, 'ユーザーA');
    await expect(pageA.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await pageB.goto(roomUrl);
    await joinRoom(pageB, 'ユーザーB');

    // 両ユーザーが互いを確認できるまで待つ
    await expect(pageB.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });
    await expect(pageA.getByText('ユーザーB')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    // ユーザーBのレバーをキーボードで動かす（5刻み × 4回 = 50 → 70）
    // 人間の操作ペースに近い間隔で押下する
    const leverB = pageB.locator('[role="slider"]');
    await leverB.focus();
    for (let i = 0; i < 4; i++) {
      await leverB.press('ArrowRight');
      await pageB.waitForTimeout(80);
    }

    // ユーザーAの結果マップでユーザーBの値が更新されること
    const mapA = pageA.locator('.room-page__map');
    await expect(mapA.getByText('70')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    await ctxA.close();
    await ctxB.close();
  });

  test('後から入室したユーザーBの画面に、ユーザーAの現在のレバー値が反映される', async ({
    browser,
  }) => {
    // ユーザーAがルームを作成・参加
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    const roomUrl = await createRoom(pageA);
    await joinRoom(pageA, 'ユーザーA');
    await expect(pageA.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    // ユーザーAがレバーを操作して値を 50 → 70 に変更（5刻み × 4回）
    const leverA = pageA.locator('[role="slider"]');
    await leverA.focus();
    for (let i = 0; i < 4; i++) {
      await leverA.press('ArrowRight');
      await pageA.waitForTimeout(80);
    }
    // ユーザーA自身の結果マップに 70 が反映されること
    const mapA = pageA.locator('.room-page__map');
    await expect(mapA.getByText('70')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    // ユーザーBが後から入室
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await pageB.goto(roomUrl);
    await joinRoom(pageB, 'ユーザーB');

    // ユーザーBの結果マップにユーザーAが見えること
    await expect(pageB.getByText('ユーザーA')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    // ユーザーBの結果マップにユーザーAの現在値「70」が表示されること（初期値50ではなく）
    const mapB = pageB.locator('.room-page__map');
    await expect(mapB.getByText('70')).toBeVisible({ timeout: REALTIME_TIMEOUT });

    await ctxA.close();
    await ctxB.close();
  });
});
