const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function runTests() {
    console.log('🚀 Starting "Clean-Slate" Manual E2E Test...');

    // 1. Detect Chromium Path (Nix)
    console.log('Scanning for environment...');
    let chromiumPath = process.env.CHROMIUM_PATH;
    if (!chromiumPath) {
        try {
            chromiumPath = execSync('which chromium').toString().trim();
        } catch (e) {
            console.log('⚠️ System chromium not found.');
        }
    }

    const launchConfig = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Critical for Replit
    };

    if (chromiumPath) {
        console.log(`✅ Using System Chromium at: ${chromiumPath}`);
        launchConfig.executablePath = chromiumPath;
    } else {
        console.log('⚠️ Using Bundled Chromium...');
    }

    try {
        const browser = await chromium.launch(launchConfig);
        console.log('✅ Browser Launched successfully!');

        const page = await browser.newPage();
        console.log('🌐 Navigating to http://localhost:5000...');

        // Use domcontentloaded for speed, networkidle can hang if streaming
        await page.goto('http://localhost:5000', { waitUntil: 'domcontentloaded', timeout: 30000 });

        const title = await page.title();
        console.log(`📄 Page Title: "${title}"`);

        await page.screenshot({ path: 'manual_e2e_screenshot.png' });
        console.log('📸 Screenshot saved to "manual_e2e_screenshot.png"');

        console.log('✅ Test Passed!');
        await browser.close();
    } catch (error) {
        console.error('❌ Test Failed:', error);
        // Explicitly check for libraries missing
        if (error.message.includes('loading shared libraries')) {
            console.error('🚨 DIAGNOSIS: Missing Linux Libraries! replit.nix needs update.');
        }
        process.exit(1);
    }
}

runTests();
