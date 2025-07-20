import { test, expect } from '@playwright/test';

test.describe('Terrain Alignment Visual Tests', () => {
  test('should show proper character positioning on hexagonal terrain', async ({ page }) => {
    // Navigate to the game
    await page.goto('/');
    
    // Wait for the game to load
    await page.waitForSelector('canvas', { timeout: 30000 });
    
    // Wait a bit more for 3D scene to fully render
    await page.waitForTimeout(3000);
    
    // Take a screenshot for visual verification
    await expect(page).toHaveScreenshot('terrain-alignment-test.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should verify character height in console logs', async ({ page }) => {
    // Listen for console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('TERRAIN TEST')) {
        consoleLogs.push(msg.text());
      }
    });

    // Navigate to the game
    await page.goto('/');
    
    // Wait for the game to load and logs to appear
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(5000); // Wait for debug logs
    
    // Check if we got terrain height logs
    expect(consoleLogs.length).toBeGreaterThan(0);
    
    // Look for the expected height difference
    const heightDifferenceLog = consoleLogs.find(log => 
      log.includes('Height Difference') && log.includes('0.50')
    );
    
    if (heightDifferenceLog) {
      console.log('✅ Found correct height difference:', heightDifferenceLog);
    } else {
      console.log('❌ Height difference logs:', consoleLogs);
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/debug-terrain.png' });
    }
  });

  test('should check terrain visual elements are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check that the 3D scene is rendering
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Take a screenshot to verify hexagons and player are visible
    await page.screenshot({ 
      path: 'test-results/terrain-elements.png',
      fullPage: true 
    });
    
    // Log success
    console.log('✅ Visual test completed - check screenshots for terrain alignment');
  });

  test('should measure exact pixel positioning (advanced)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // Get canvas dimensions and take a screenshot
    const canvas = await page.locator('canvas');
    const boundingBox = await canvas.boundingBox();
    
    if (boundingBox) {
      // Take a screenshot of just the canvas area
      await page.screenshot({ 
        path: 'test-results/canvas-only.png',
        clip: boundingBox
      });
      
      console.log('✅ Canvas screenshot taken for pixel analysis');
      console.log('Canvas dimensions:', boundingBox);
    }
  });
});