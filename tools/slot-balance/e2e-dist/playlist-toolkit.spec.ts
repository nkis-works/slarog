import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const locales = [
  { code: 'en', path: '' },
  { code: 'ja', path: 'ja/' },
  { code: 'de', path: 'de/' },
  { code: 'es', path: 'es/' },
  { code: 'fr', path: 'fr/' },
  { code: 'it', path: 'it/' },
  { code: 'pt-BR', path: 'pt-br/' },
];
const legalPages = ['privacy', 'support', 'terms'];

test.describe('Playlist Toolkit product site', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const locale of locales) {
    test(`${locale.code} home remains usable on mobile`, async ({ page }) => {
      await page.goto(`/products/playlist-toolkit/${locale.path}`);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);

      const menu = page.locator('.pt-mobile-menu');
      await expect(menu).toBeVisible();
      await menu.locator('summary').click();
      await expect(menu.locator('.pt-mobile-page-links a')).toHaveCount(5);
      await expect(menu.locator('.pt-mobile-languages a')).toHaveCount(7);
      await expect(
        page.locator(`a[href*="play.google.com/store/apps/details"]`).first(),
      ).toBeVisible();
    });
  }

  test('localized pages do not expose English fallback copy', async ({ page }) => {
    const englishMarkers = [
      'COMPATIBILITY CONSOLE',
      'SUPPORTED UI',
      'SAFETY CHECK',
      'This Privacy Policy',
      'Before contacting support',
      'These Terms govern',
    ];

    for (const locale of locales.slice(2)) {
      await page.goto(`/products/playlist-toolkit/${locale.path}`);
      const homeText = await page.locator('body').innerText();
      for (const marker of englishMarkers.slice(0, 3)) expect(homeText).not.toContain(marker);

      for (const pageName of legalPages) {
        await page.goto(`/products/playlist-toolkit/${locale.path}${pageName}/`);
        const bodyText = await page.locator('body').innerText();
        for (const marker of englishMarkers.slice(3)) expect(bodyText).not.toContain(marker);
      }
    }
  });

  test('home publishes complete search and social metadata', async ({ page }) => {
    await page.goto('/products/playlist-toolkit/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /playlist-toolkit-og\.png$/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    const structuredData = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent()) || '{}',
    );
    expect(structuredData['@type']).toBe('SoftwareApplication');
    expect(structuredData.offers.priceSpecification.price).toBe('200');
    expect(structuredData.subjectOf['@type']).toBe('FAQPage');
    await expect(page).toHaveTitle(/Amazon Music Playlist Organizer/);
    await expect(page.locator('#playlist-organizer')).toContainText('Sort Amazon Music playlists');
  });

  test('language navigation cannot leave the product site', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/products/playlist-toolkit/ja/');
    const language = page.locator('.pt-language');
    await language.locator('summary').click();
    const paths = await language
      .locator('a')
      .evaluateAll((links) =>
        links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
      );
    expect(paths).toHaveLength(7);
    for (const path of paths) expect(path).toMatch(/^\/products\/playlist-toolkit\//);
  });

  test('NKIS Works language links stay on the studio site', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('.language-link')).toHaveAttribute('href', '/ja/');
    await page.goto('/ja/');
    await expect(page.locator('.language-link')).toHaveAttribute('href', '/en/');
    await expect(page.locator('a[href="/products/playlist-toolkit/ja/"]').first()).toBeVisible();
  });

  for (const locale of locales.slice(0, 2)) {
    test(`${locale.code} home has no automated accessibility violations`, async ({ page }) => {
      await page.goto(`/products/playlist-toolkit/${locale.path}`);
      await page.waitForTimeout(1200);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
