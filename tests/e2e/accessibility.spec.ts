import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y, getViolations } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('landing page has no accessibility violations', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('booking page has no accessibility violations', async ({ page }) => {
    await page.goto('/reservas')
    await page.waitForLoadState('networkidle')
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('contact page has no accessibility violations', async ({ page }) => {
    await page.goto('/contacto')
    await page.waitForLoadState('networkidle')
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('services page has no accessibility violations', async ({ page }) => {
    await page.goto('/servicios')
    await page.waitForLoadState('networkidle')
    
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('keyboard navigation works throughout the site', async ({ page }) => {
    // Test landing page keyboard navigation
    await page.keyboard.press('Tab')
    
    // Skip to main content link should be first
    const skipLink = page.locator('a[href="#main-content"]')
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeFocused()
      await page.keyboard.press('Enter')
      
      // Main content should be focused
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toBeFocused()
    }
    
    // Navigate through main navigation
    const navLinks = page.locator('nav a')
    const navCount = await navLinks.count()
    
    for (let i = 0; i < navCount; i++) {
      await page.keyboard.press('Tab')
      const currentLink = navLinks.nth(i)
      await expect(currentLink).toBeFocused()
    }
  })

  test('form elements have proper labels and descriptions', async ({ page }) => {
    await page.goto('/contacto')
    
    // Check that all form inputs have labels
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const inputId = await input.getAttribute('id')
      
      if (inputId) {
        // Check for associated label
        const label = page.locator(`label[for="${inputId}"]`)
        await expect(label).toBeVisible()
        
        // Check for aria-describedby if present
        const describedBy = await input.getAttribute('aria-describedby')
        if (describedBy) {
          const description = page.locator(`#${describedBy}`)
          await expect(description).toBeVisible()
        }
      }
    }
  })

  test('images have appropriate alt text', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')
      
      // Images should have alt text or be marked as decorative
      expect(alt !== null || role === 'presentation').toBeTruthy()
      
      // Alt text should not be redundant
      if (alt) {
        expect(alt.toLowerCase()).not.toContain('image')
        expect(alt.toLowerCase()).not.toContain('picture')
        expect(alt.toLowerCase()).not.toContain('photo')
      }
    }
  })

  test('headings follow proper hierarchy', async ({ page }) => {
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    
    // Should have exactly one h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
    
    // Check heading hierarchy
    let previousLevel = 0
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i)
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const currentLevel = parseInt(tagName.charAt(1))
      
      if (i === 0) {
        // First heading should be h1
        expect(currentLevel).toBe(1)
      } else {
        // Subsequent headings should not skip levels
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1)
      }
      
      previousLevel = currentLevel
    }
  })

  test('color contrast meets WCAG standards', async ({ page }) => {
    // This test uses axe-core to check color contrast
    const violations = await getViolations(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
    
    expect(violations).toHaveLength(0)
  })

  test('focus indicators are visible', async ({ page }) => {
    // Test focus indicators on interactive elements
    const interactiveElements = page.locator('button, a, input, textarea, select')
    const elementCount = await interactiveElements.count()
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) { // Test first 5 elements
      const element = interactiveElements.nth(i)
      await element.focus()
      
      // Check that element has visible focus indicator
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // Element should have focus styles (outline, box-shadow, etc.)
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          outline: computed.outline,
          boxShadow: computed.boxShadow,
          border: computed.border
        }
      })
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none' || 
        styles.border !== 'none'
      
      expect(hasFocusIndicator).toBeTruthy()
    }
  })

  test('screen reader announcements work correctly', async ({ page }) => {
    await page.goto('/reservas')
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live]')
    const liveRegionCount = await liveRegions.count()
    
    if (liveRegionCount > 0) {
      // Live regions should have appropriate politeness levels
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i)
        const ariaLive = await region.getAttribute('aria-live')
        expect(['polite', 'assertive', 'off']).toContain(ariaLive)
      }
    }
    
    // Check for status messages
    const statusElements = page.locator('[role="status"], [role="alert"]')
    const statusCount = await statusElements.count()
    
    for (let i = 0; i < statusCount; i++) {
      const status = statusElements.nth(i)
      await expect(status).toBeVisible()
    }
  })

  test('modal dialogs are accessible', async ({ page }) => {
    await page.goto('/reservas')
    
    // Mock service selection to trigger modal
    await page.route('/api/servicios', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'service-1',
          nombre: 'Masaje Relajante',
          duracion: 60,
          precio: 80
        }])
      })
    })
    
    // Try to trigger a modal (confirmation dialog)
    const serviceCard = page.locator('[data-testid="service-card"]').first()
    if (await serviceCard.count() > 0) {
      await serviceCard.click()
      
      // Look for modal dialog
      const modal = page.locator('[role="dialog"]')
      if (await modal.count() > 0) {
        // Modal should have proper ARIA attributes
        await expect(modal).toHaveAttribute('aria-modal', 'true')
        
        // Modal should have accessible name
        const ariaLabelledBy = await modal.getAttribute('aria-labelledby')
        const ariaLabel = await modal.getAttribute('aria-label')
        expect(ariaLabelledBy || ariaLabel).toBeTruthy()
        
        // Focus should be trapped in modal
        await page.keyboard.press('Tab')
        const focusedElement = page.locator(':focus')
        const isInsideModal = await focusedElement.evaluate(
          (el, modalEl) => modalEl.contains(el),
          await modal.elementHandle()
        )
        expect(isInsideModal).toBeTruthy()
      }
    }
  })

  test('error messages are accessible', async ({ page }) => {
    await page.goto('/contacto')
    
    // Submit form without filling required fields
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Wait for error messages
    await page.waitForTimeout(1000)
    
    // Check for error messages
    const errorMessages = page.locator('[role="alert"], .error-message, [aria-invalid="true"]')
    const errorCount = await errorMessages.count()
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i)
        await expect(error).toBeVisible()
        
        // Error should be associated with form field
        const ariaDescribedBy = await error.getAttribute('aria-describedby')
        if (ariaDescribedBy) {
          const associatedField = page.locator(`[aria-describedby*="${ariaDescribedBy}"]`)
          await expect(associatedField).toBeVisible()
        }
      }
    }
  })
})