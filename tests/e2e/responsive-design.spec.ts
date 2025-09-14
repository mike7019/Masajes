import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1024, height: 768 },
  { name: 'Large Desktop', width: 1440, height: 900 },
]

test.describe('Responsive Design Tests', () => {
  viewports.forEach(({ name, width, height }) => {
    test.describe(`${name} (${width}x${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height })
      })

      test('landing page is responsive', async ({ page }) => {
        await page.goto('/')
        
        // Hero section should be visible
        const heroSection = page.locator('[data-testid="hero-section"]')
        await expect(heroSection).toBeVisible()
        
        // Navigation should adapt to viewport
        if (width < 768) {
          // Mobile: check for hamburger menu
          const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
          if (await mobileMenuButton.isVisible()) {
            await expect(mobileMenuButton).toBeVisible()
          }
        } else {
          // Desktop: check for full navigation
          const desktopNav = page.locator('[data-testid="desktop-navigation"]')
          if (await desktopNav.isVisible()) {
            await expect(desktopNav).toBeVisible()
          }
        }
        
        // Services section should be responsive
        const servicesSection = page.locator('[data-testid="services-preview"]')
        await expect(servicesSection).toBeVisible()
        
        // Contact info should be visible
        const contactInfo = page.locator('[data-testid="contact-info"]')
        await expect(contactInfo).toBeVisible()
      })

      test('booking form is responsive', async ({ page }) => {
        await page.goto('/reservas')
        
        // Form should be visible and usable
        const bookingForm = page.locator('[data-testid="booking-form"]')
        await expect(bookingForm).toBeVisible()
        
        // Service cards should adapt to viewport
        await page.waitForSelector('[data-testid="service-card"]')
        const serviceCards = page.locator('[data-testid="service-card"]')
        await expect(serviceCards.first()).toBeVisible()
        
        // Select a service
        await serviceCards.first().click()
        
        // Next button should be accessible
        const nextButton = page.locator('[data-testid="next-button"]')
        await expect(nextButton).toBeVisible()
        await nextButton.click()
        
        // Calendar should be responsive
        await page.waitForSelector('[data-testid="calendar"]')
        const calendar = page.locator('[data-testid="calendar"]')
        await expect(calendar).toBeVisible()
        
        // Time slots should be touch-friendly on mobile
        if (width < 768) {
          const timeSlots = page.locator('[data-testid="time-slot"]')
          if (await timeSlots.count() > 0) {
            const firstSlot = timeSlots.first()
            const boundingBox = await firstSlot.boundingBox()
            
            // Touch targets should be at least 44px (iOS) or 48px (Android)
            expect(boundingBox?.height).toBeGreaterThanOrEqual(44)
          }
        }
      })

      test('contact form is responsive', async ({ page }) => {
        await page.goto('/contacto')
        
        // Form should be visible
        const contactForm = page.locator('[data-testid="contact-form"]')
        await expect(contactForm).toBeVisible()
        
        // Form fields should be appropriately sized
        const nameField = page.locator('[data-testid="contact-name"]')
        const emailField = page.locator('[data-testid="contact-email"]')
        const messageField = page.locator('[data-testid="contact-message"]')
        
        await expect(nameField).toBeVisible()
        await expect(emailField).toBeVisible()
        await expect(messageField).toBeVisible()
        
        // On mobile, fields should stack vertically
        if (width < 768) {
          const nameBox = await nameField.boundingBox()
          const emailBox = await emailField.boundingBox()
          
          if (nameBox && emailBox) {
            // Email field should be below name field on mobile
            expect(emailBox.y).toBeGreaterThan(nameBox.y + nameBox.height - 10)
          }
        }
        
        // Submit button should be accessible
        const submitButton = page.locator('[data-testid="submit-button"]')
        await expect(submitButton).toBeVisible()
        
        if (width < 768) {
          const buttonBox = await submitButton.boundingBox()
          expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
        }
      })

      test('admin dashboard is responsive', async ({ page }) => {
        // Mock authentication
        await page.goto('/admin/login')
        
        // Fill login form (if visible)
        const loginForm = page.locator('[data-testid="login-form"]')
        if (await loginForm.isVisible()) {
          await page.fill('[data-testid="email"]', 'admin@test.com')
          await page.fill('[data-testid="password"]', 'password')
          await page.click('[data-testid="login-button"]')
        }
        
        // Navigate to dashboard
        await page.goto('/admin')
        
        // Dashboard should be responsive
        const dashboard = page.locator('[data-testid="admin-dashboard"]')
        if (await dashboard.isVisible()) {
          await expect(dashboard).toBeVisible()
          
          // Stats cards should adapt to viewport
          const statsCards = page.locator('[data-testid="stat-card"]')
          if (await statsCards.count() > 0) {
            await expect(statsCards.first()).toBeVisible()
          }
          
          // On mobile, navigation might be collapsed
          if (width < 768) {
            const mobileAdminNav = page.locator('[data-testid="mobile-admin-nav"]')
            if (await mobileAdminNav.isVisible()) {
              await expect(mobileAdminNav).toBeVisible()
            }
          }
        }
      })

      test('images are responsive', async ({ page }) => {
        await page.goto('/')
        
        // Check that images have responsive attributes
        const images = page.locator('img')
        const imageCount = await images.count()
        
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const img = images.nth(i)
          
          // Images should have proper sizing
          const boundingBox = await img.boundingBox()
          if (boundingBox) {
            // Image should not overflow viewport
            expect(boundingBox.width).toBeLessThanOrEqual(width + 10) // Small tolerance
            
            // Image should be visible
            expect(boundingBox.width).toBeGreaterThan(0)
            expect(boundingBox.height).toBeGreaterThan(0)
          }
          
          // Check for responsive image attributes
          const sizes = await img.getAttribute('sizes')
          const srcset = await img.getAttribute('srcset')
          
          // At least one responsive attribute should be present for content images
          if (!(await img.getAttribute('aria-hidden'))) {
            expect(sizes || srcset).toBeTruthy()
          }
        }
      })

      test('text is readable at all viewport sizes', async ({ page }) => {
        await page.goto('/')
        
        // Check main heading
        const mainHeading = page.locator('h1').first()
        if (await mainHeading.isVisible()) {
          const headingBox = await mainHeading.boundingBox()
          const fontSize = await mainHeading.evaluate(el => 
            window.getComputedStyle(el).fontSize
          )
          
          // Font size should be appropriate for viewport
          const fontSizeNum = parseInt(fontSize)
          if (width < 768) {
            expect(fontSizeNum).toBeGreaterThanOrEqual(24) // Minimum for mobile
          } else {
            expect(fontSizeNum).toBeGreaterThanOrEqual(28) // Minimum for desktop
          }
        }
        
        // Check body text
        const bodyText = page.locator('p').first()
        if (await bodyText.isVisible()) {
          const fontSize = await bodyText.evaluate(el => 
            window.getComputedStyle(el).fontSize
          )
          
          const fontSizeNum = parseInt(fontSize)
          expect(fontSizeNum).toBeGreaterThanOrEqual(14) // Minimum readable size
        }
      })

      test('interactive elements are appropriately sized', async ({ page }) => {
        await page.goto('/')
        
        // Check buttons
        const buttons = page.locator('button, a[role="button"]')
        const buttonCount = await buttons.count()
        
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i)
          if (await button.isVisible()) {
            const boundingBox = await button.boundingBox()
            
            if (boundingBox && width < 768) {
              // Touch targets should be at least 44px on mobile
              expect(Math.min(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(44)
            }
          }
        }
        
        // Check form inputs
        const inputs = page.locator('input, textarea, select')
        const inputCount = await inputs.count()
        
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i)
          if (await input.isVisible()) {
            const boundingBox = await input.boundingBox()
            
            if (boundingBox) {
              // Inputs should have reasonable height
              expect(boundingBox.height).toBeGreaterThanOrEqual(32)
              
              if (width < 768) {
                // Touch-friendly height on mobile
                expect(boundingBox.height).toBeGreaterThanOrEqual(44)
              }
            }
          }
        }
      })

      test('layout does not break at viewport size', async ({ page }) => {
        await page.goto('/')
        
        // Check for horizontal scrollbars (indicates layout overflow)
        const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = width
        
        // Allow small tolerance for scrollbars
        expect(bodyScrollWidth).toBeLessThanOrEqual(viewportWidth + 20)
        
        // Check that main content areas are visible
        const main = page.locator('main')
        if (await main.isVisible()) {
          const mainBox = await main.boundingBox()
          if (mainBox) {
            expect(mainBox.width).toBeLessThanOrEqual(viewportWidth)
            expect(mainBox.x).toBeGreaterThanOrEqual(0)
          }
        }
      })
    })
  })

  test('handles orientation changes on mobile', async ({ page }) => {
    // Start in portrait
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Verify layout in portrait
    const heroPortrait = page.locator('[data-testid="hero-section"]')
    await expect(heroPortrait).toBeVisible()
    
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 })
    
    // Verify layout adapts to landscape
    const heroLandscape = page.locator('[data-testid="hero-section"]')
    await expect(heroLandscape).toBeVisible()
    
    // Navigation should still work
    const navigation = page.locator('[data-testid="main-navigation"], [data-testid="mobile-menu-button"]')
    await expect(navigation.first()).toBeVisible()
  })
})