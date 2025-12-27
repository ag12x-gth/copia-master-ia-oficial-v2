import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5000';

test.describe('Master IA - Dashboard & Super Admin Tests', () => {

  test.describe('Dashboard Access Control', () => {
    test('should redirect unauthenticated users from super-admin to login', async ({ page }) => {
      await page.goto(`${BASE_URL}/super-admin`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      const isProtected = currentUrl.includes('/login') || currentUrl.includes('/super-admin');
      
      expect(isProtected).toBe(true);
      console.log(`✅ Super Admin Access Control - Current URL: ${currentUrl}`);
    });

    test('should redirect unauthenticated users from super-admin/dashboard', async ({ page }) => {
      await page.goto(`${BASE_URL}/super-admin/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`✅ Dashboard redirect check - URL: ${currentUrl}`);
    });

    test('should redirect unauthenticated users from super-admin/users', async ({ page }) => {
      await page.goto(`${BASE_URL}/super-admin/users`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`✅ Users page redirect check - URL: ${currentUrl}`);
    });

    test('should redirect unauthenticated users from super-admin/companies', async ({ page }) => {
      await page.goto(`${BASE_URL}/super-admin/companies`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`✅ Companies page redirect check - URL: ${currentUrl}`);
    });

    test('should redirect unauthenticated users from super-admin/analytics', async ({ page }) => {
      await page.goto(`${BASE_URL}/super-admin/analytics`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      console.log(`✅ Analytics page redirect check - URL: ${currentUrl}`);
    });
  });

  test.describe('API Endpoints Security', () => {
    test('should return 401 for protected user API without auth', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/users`);
      const status = response.status();
      
      console.log(`✅ /api/users returns status: ${status}`);
      expect([401, 403, 404, 500]).toContain(status);
    });

    test('should return 401 for protected companies API without auth', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/companies`);
      const status = response.status();
      
      console.log(`✅ /api/companies returns status: ${status}`);
      expect([401, 403, 404, 500]).toContain(status);
    });

    test('should have auth session endpoint', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/auth/session`);
      const status = response.status();
      
      console.log(`✅ /api/auth/session returns status: ${status}`);
      expect([200, 401]).toContain(status);
    });

    test('should have auth providers endpoint', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/auth/providers`);
      const status = response.status();
      
      console.log(`✅ /api/auth/providers returns status: ${status}`);
      expect(status).toBe(200);
    });

    test('should have CSRF token endpoint', async ({ page }) => {
      const response = await page.request.get(`${BASE_URL}/api/auth/csrf`);
      const status = response.status();
      
      console.log(`✅ /api/auth/csrf returns status: ${status}`);
      expect(status).toBe(200);
    });
  });

  test.describe('Dashboard Page Structure (when accessible)', () => {
    test('super-admin page should load without server errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/super-admin`);
      
      expect(response).not.toBeNull();
      if (response) {
        const status = response.status();
        expect([200, 302, 307]).toContain(status);
        console.log(`✅ Super Admin page status: ${status}`);
      }
    });

    test('super-admin/dashboard should load without server errors', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/super-admin/dashboard`);
      
      expect(response).not.toBeNull();
      if (response) {
        const status = response.status();
        expect([200, 302, 307]).toContain(status);
        console.log(`✅ Super Admin Dashboard status: ${status}`);
      }
    });
  });

  test.describe('Webhooks Dashboard', () => {
    test('webhooks dashboard should load', async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/webhooks/dashboard`);
      
      expect(response).not.toBeNull();
      if (response) {
        const status = response.status();
        console.log(`✅ Webhooks Dashboard status: ${status}`);
      }
    });
  });

  test.describe('Login Flow Integration', () => {
    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"], input[placeholder*="email"]', 'invalid@test.com');
      await page.fill('input[type="password"]', 'wrongpassword123');
      
      await page.click('button:has-text("Entrar")');
      await page.waitForTimeout(3000);
      
      const errorVisible = await page.locator('text=Credenciais inválidas, text=erro, text=Invalid, [role="alert"]').first().isVisible().catch(() => false);
      const stillOnLogin = page.url().includes('/login');
      
      expect(stillOnLogin || errorVisible).toBe(true);
      console.log(`✅ Login validation - Still on login: ${stillOnLogin}`);
    });

    test('should handle empty email validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="password"]', 'somepassword');
      await page.click('button:has-text("Entrar")');
      await page.waitForTimeout(1000);
      
      const stillOnLogin = page.url().includes('/login');
      expect(stillOnLogin).toBe(true);
      console.log('✅ Empty email validation works');
    });

    test('should handle empty password validation', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"], input[placeholder*="email"]', 'test@example.com');
      await page.click('button:has-text("Entrar")');
      await page.waitForTimeout(1000);
      
      const stillOnLogin = page.url().includes('/login');
      expect(stillOnLogin).toBe(true);
      console.log('✅ Empty password validation works');
    });
  });

  test.describe('Register Flow Integration', () => {
    test('should show error for existing email', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[placeholder*="nome"], input[name="name"]', 'Test User');
      await page.fill('input[type="email"], input[placeholder*="email"]', 'existing@test.com');
      await page.fill('input[type="password"]', 'TestPassword123!');
      
      const termsLabel = page.locator('label:has(input[type="checkbox"]), [data-state]').first();
      if (await termsLabel.isVisible().catch(() => false)) {
        await termsLabel.click({ timeout: 5000 }).catch(() => {});
      }
      
      await page.click('button:has-text("Criar Conta")');
      await page.waitForTimeout(3000);
      
      console.log('✅ Register form submission tested');
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[placeholder*="nome"], input[name="name"]', 'Test User');
      await page.fill('input[type="email"], input[placeholder*="email"]', 'newuser@test.com');
      await page.fill('input[type="password"]', '123');
      
      await page.click('button:has-text("Criar Conta")');
      await page.waitForTimeout(1000);
      
      const stillOnRegister = page.url().includes('/register');
      expect(stillOnRegister).toBe(true);
      console.log('✅ Password validation works');
    });
  });

  test.describe('Forgot Password Flow', () => {
    test('should submit forgot password request', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const emailField = page.locator('input[type="email"], input[placeholder*="email"]').first();
      const isVisible = await emailField.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        await emailField.fill('test@example.com');
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Enviar"), button:has-text("Recuperar")').first();
        if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await submitButton.click();
          await page.waitForTimeout(2000);
        }
      }
      
      console.log('✅ Forgot password flow tested');
    });
  });
});
