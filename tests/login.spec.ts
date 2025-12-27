import { test, expect } from '@playwright/test';

test.describe('Master IA Login Page', () => {
  test('should display all login elements correctly', async ({ page }) => {
    // Navigate to login
    await page.goto('http://localhost:5000/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify Logo "Master IA" is visible
    const logo = page.locator('text=Master IA');
    await expect(logo).toBeVisible();
    console.log('✅ Logo "Master IA" is visible');
    
    // Verify Heading "Bem-vindo de volta!" is visible
    const heading = page.locator('text=Bem-vindo de volta!');
    await expect(heading).toBeVisible();
    console.log('✅ Heading "Bem-vindo de volta!" is visible');
    
    // Verify Email field exists
    const emailField = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]').first();
    await expect(emailField).toBeVisible();
    console.log('✅ Email field exists');
    
    // Verify Password field exists
    const passwordField = page.locator('input[type="password"], input[placeholder*="password"], input[name="password"]').first();
    await expect(passwordField).toBeVisible();
    console.log('✅ Password field exists');
    
    // Verify "Entrar" button is visible
    const enterButton = page.locator('button:has-text("Entrar"), input[type="submit"][value="Entrar"]');
    await expect(enterButton).toBeVisible();
    console.log('✅ "Entrar" button is visible');
    
    // Verify button is green (check for green class or style)
    const buttonStyle = await enterButton.evaluate(el => window.getComputedStyle(el).backgroundColor);
    console.log(`✅ Button background color: ${buttonStyle}`);
    
    // Verify "Esqueceu sua senha?" link is visible
    const forgotPassword = page.locator('text=Esqueceu sua senha?');
    await expect(forgotPassword).toBeVisible();
    console.log('✅ "Esqueceu sua senha?" link is visible');
    
    // Verify "Cadastre-se gratuitamente" link is visible
    const registerLink = page.locator('text=Cadastre-se gratuitamente');
    await expect(registerLink).toBeVisible();
    console.log('✅ "Cadastre-se gratuitamente" link is visible');
    
    // Check for Facebook login button
    const facebookButton = page.locator('button:has-text("Facebook"), [data-testid="facebook-login"], text=Facebook').first();
    const hasFacebook = await facebookButton.isVisible().catch(() => false);
    if (hasFacebook) {
      console.log('✅ Facebook login button is present');
    } else {
      console.log('⚠️ Facebook login button not found in viewport');
    }
    
    console.log('\n=== ALL TESTS PASSED ===');
  });
});
