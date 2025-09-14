import { test, expect } from '@playwright/test'

test.describe('Contact Form E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacto')
  })

  test('submits contact form successfully', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText(/contacto/i)
    
    // Fill out the form
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'maria@test.com')
    await page.fill('[data-testid="contact-phone"]', '987654321')
    await page.fill('[data-testid="contact-message"]', 'Hola, me gustaría saber más sobre sus servicios de masajes. ¿Tienen disponibilidad para la próxima semana?')
    
    // Submit the form
    await page.click('[data-testid="submit-button"]')
    
    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/enviado.*correctamente/i)
    
    // Form should be reset after successful submission
    await expect(page.locator('[data-testid="contact-name"]')).toHaveValue('')
    await expect(page.locator('[data-testid="contact-email"]')).toHaveValue('')
    await expect(page.locator('[data-testid="contact-phone"]')).toHaveValue('')
    await expect(page.locator('[data-testid="contact-message"]')).toHaveValue('')
  })

  test('validates required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="submit-button"]')
    
    // Check validation errors appear
    await expect(page.locator('[data-testid="name-error"]')).toContainText(/requerido/i)
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/requerido/i)
    await expect(page.locator('[data-testid="message-error"]')).toContainText(/requerido/i)
    
    // Form should not be submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible()
  })

  test('validates email format', async ({ page }) => {
    // Fill form with invalid email
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'invalid-email')
    await page.fill('[data-testid="contact-message"]', 'Test message that is long enough to pass validation')
    
    await page.click('[data-testid="submit-button"]')
    
    // Check email validation error
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/válido/i)
  })

  test('validates phone number format', async ({ page }) => {
    // Fill form with invalid phone
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'maria@test.com')
    await page.fill('[data-testid="contact-phone"]', '123')
    await page.fill('[data-testid="contact-message"]', 'Test message that is long enough to pass validation')
    
    await page.click('[data-testid="submit-button"]')
    
    // Check phone validation error
    await expect(page.locator('[data-testid="phone-error"]')).toContainText(/dígitos/i)
  })

  test('validates message minimum length', async ({ page }) => {
    // Fill form with short message
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'maria@test.com')
    await page.fill('[data-testid="contact-message"]', 'Hi')
    
    await page.click('[data-testid="submit-button"]')
    
    // Check message validation error
    await expect(page.locator('[data-testid="message-error"]')).toContainText(/10.*caracteres/i)
  })

  test('shows loading state during submission', async ({ page }) => {
    // Fill valid form
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'maria@test.com')
    await page.fill('[data-testid="contact-phone"]', '987654321')
    await page.fill('[data-testid="contact-message"]', 'Test message that is long enough to pass validation')
    
    // Submit and immediately check loading state
    await page.click('[data-testid="submit-button"]')
    
    // Check loading indicator
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    
    // Button should be disabled during loading
    await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled()
    
    // Button text should change
    await expect(page.locator('[data-testid="submit-button"]')).toContainText(/enviando/i)
  })

  test('handles submission errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/contacto', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      })
    })
    
    // Fill and submit form
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'maria@test.com')
    await page.fill('[data-testid="contact-phone"]', '987654321')
    await page.fill('[data-testid="contact-message"]', 'Test message that is long enough to pass validation')
    
    await page.click('[data-testid="submit-button"]')
    
    // Check error message appears
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/error.*enviar/i)
    
    // Form should remain filled for retry
    await expect(page.locator('[data-testid="contact-name"]')).toHaveValue('María García')
    await expect(page.locator('[data-testid="contact-email"]')).toHaveValue('maria@test.com')
  })

  test('displays contact information', async ({ page }) => {
    // Check that contact information is displayed
    await expect(page.locator('[data-testid="business-phone"]')).toBeVisible()
    await expect(page.locator('[data-testid="business-email"]')).toBeVisible()
    await expect(page.locator('[data-testid="business-address"]')).toBeVisible()
    await expect(page.locator('[data-testid="business-hours"]')).toBeVisible()
    
    // Check that phone number is clickable
    const phoneLink = page.locator('a[href^="tel:"]')
    if (await phoneLink.count() > 0) {
      await expect(phoneLink).toBeVisible()
    }
    
    // Check that email is clickable
    const emailLink = page.locator('a[href^="mailto:"]')
    if (await emailLink.count() > 0) {
      await expect(emailLink).toBeVisible()
    }
  })

  test('is accessible with keyboard navigation', async ({ page }) => {
    // Test keyboard navigation through form
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="contact-name"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="contact-email"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="contact-phone"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="contact-message"]')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="submit-button"]')).toBeFocused()
  })

  test('has proper form labels and accessibility', async ({ page }) => {
    // Check that all form fields have labels
    const nameField = page.locator('[data-testid="contact-name"]')
    await expect(nameField).toHaveAttribute('aria-label')
    
    const emailField = page.locator('[data-testid="contact-email"]')
    await expect(emailField).toHaveAttribute('aria-label')
    
    const phoneField = page.locator('[data-testid="contact-phone"]')
    await expect(phoneField).toHaveAttribute('aria-label')
    
    const messageField = page.locator('[data-testid="contact-message"]')
    await expect(messageField).toHaveAttribute('aria-label')
    
    // Check that error messages are properly associated
    await page.click('[data-testid="submit-button"]')
    
    const nameError = page.locator('[data-testid="name-error"]')
    if (await nameError.isVisible()) {
      await expect(nameField).toHaveAttribute('aria-describedby')
    }
  })

  test('works on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Form should be responsive
    const form = page.locator('[data-testid="contact-form"]')
    await expect(form).toBeVisible()
    
    // Fields should be touch-friendly
    const nameField = page.locator('[data-testid="contact-name"]')
    await expect(nameField).toBeVisible()
    
    // Test form submission on mobile
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'maria@test.com')
    await page.fill('[data-testid="contact-phone"]', '987654321')
    await page.fill('[data-testid="contact-message"]', 'Test message from mobile device')
    
    await page.click('[data-testid="submit-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toContainText(/enviado.*correctamente/i)
  })

  test('handles network connectivity issues', async ({ page }) => {
    // Simulate network failure
    await page.route('/api/contacto', route => {
      route.abort('failed')
    })
    
    // Fill and submit form
    await page.fill('[data-testid="contact-name"]', 'María García')
    await page.fill('[data-testid="contact-email"]', 'maria@test.com')
    await page.fill('[data-testid="contact-phone"]', '987654321')
    await page.fill('[data-testid="contact-message"]', 'Test message')
    
    await page.click('[data-testid="submit-button"]')
    
    // Should show network error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/error.*conexión|red/i)
  })
})