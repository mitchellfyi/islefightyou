const puppeteer = require('puppeteer');
const path = require('path');

async function captureScreenshots() {
  console.log('🎮 Starting screenshot capture...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--no-first-run',
      '--disable-default-apps'
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  // Disable timeout for font loading
  await page.setDefaultTimeout(30000);
  
  try {
    console.log('📱 Navigating to game...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for game to load
    console.log('⏳ Waiting for game to load...');
    await page.waitForTimeout(10000);
    
    // Take main gameplay screenshot
    console.log('📸 Capturing main gameplay...');
    await page.screenshot({
      path: './screenshots/gameplay-main.png',
      fullPage: false
    });
    
    // Try to interact with inventory button
    try {
      await page.click('button:has-text("🎒")');
      await page.waitForTimeout(2000);
      
      console.log('📸 Capturing inventory view...');
      await page.screenshot({
        path: './screenshots/gameplay-inventory.png',
        fullPage: false
      });
    } catch (e) {
      console.log('⚠️ Could not open inventory');
    }
    
    // Try to click build menu
    try {
      await page.click('button:has-text("🏗️")');
      await page.waitForTimeout(2000);
      
      console.log('📸 Capturing build menu...');
      await page.screenshot({
        path: './screenshots/gameplay-build.png',
        fullPage: false
      });
    } catch (e) {
      console.log('⚠️ Could not open build menu');
    }
    
    console.log('✅ Screenshots captured successfully!');
    
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  }
  
  await browser.close();
}

if (require.main === module) {
  captureScreenshots().catch(console.error);
}

module.exports = captureScreenshots;