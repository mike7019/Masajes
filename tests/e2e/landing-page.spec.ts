import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle(/masajes/i)
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /masajes/i)
  })

  test('displays hero section with call-to-action', async ({ page }) => {
    // Check hero section is visible
    const heroSection = page.locator('[data-testid="hero-section"]')
    await expect(heroSection).toBeVisible()
    
    // Check main heading
    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()
    await expect(mainHeading).toContainText(/masajes/i)
    
    // Check CTA button
    const ctaButton = page.locator('[data-testid="cta-button"]')
    await expect(ctaButton).toBeVisible()
    await expect(ctaButton).toContainText(/reservar/i)
  })

  test('displays services preview section', async ({ page }) => {
    const servicesSection = page.locator('[data-testid="services-preview"]')
    await expect(servicesSection).toBeVisible()
    
    // Check section heading
    const sectionHeading = page.locator('h2').filter({ hasText: /servicios/i })
    await expect(sectionHeading).toBeVisible()
    
    // Check at least one service card is displayed
    const serviceCards = page.locator('[data-testid="service-card"]')
    await expect(serviceCards.first()).toBeVisible()
  })

  test('displays contact information', async ({ page }) => {
    const contactSection = page.locator('[data-testid="contact-info"]')
    await expect(contactSection).toBeVisible()
    
    // Check phone number is displayed
    const phoneNumber = page.locator('[data-testid="phone-number"]')
    await expect(phoneNumber).toBeVisible()
    
    // Check address is displayed
    const address = page.locator('[data-testid="address"]')
    await expect(address).toBeVisible()
    
    // Check business hours are displayed
    const businessHours = page.locator('[data-testid="business-hours"]')
    await expect(businessHours).toBeVisible()
  })

  test('navigation works correctly', async ({ page }) => {
    // Check navigation menu is visible
    const navigation = page.locator('[data-testid="main-navigation"]')
    await expect(navigation).toBeVisible()
    
    // Test navigation links
    const servicesLink = page.locator('a[href="/servicios"]')
    await expect(servicesLink).toBeVisible()
    
    const reservasLink = page.locator('a[href="/reservas"]')
    await expect(reservasLink).toBeVisible()
    
    const contactoLink = page.locator('a[href="/contacto"]')
    await expect(contactoLink).toBeVisible()
  })

  test('CTA button navigates to booking page', async ({ page }) => {
    const ctaButton = page.locator('[data-testid="cta-button"]')
    await ctaButton.click()
    
    await expect(page).toHaveURL('/reservas')
  })

  test('is responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check hero section is still visible
    const heroSection = page.locator('[data-testid="hero-section"]')
    await expect(heroSection).toBeVisible()
    
    // Check mobile navigation menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      await expect(mobileMenu).toBeVisible()
    }
  })

  test('has proper accessibility attributes', async ({ page }) => {
    // Check main landmark
    const main = page.locator('main')
    await expect(main).toBeVisible()
    
    // Check heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    
    // Check images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      await expect(img).toHaveAttribute('alt')
    }
    
    // Check links have accessible names
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i)
      const hasText = await link.textContent()
      const hasAriaLabel = await link.getAttribute('aria-label')
      
      expect(hasText || hasAriaLabel).toBeTruthy()
    }
  })

  test('loads performance optimized images', async ({ page }) => {
    // Check that images are lazy loaded
    const images = page.locator('img[loading="lazy"]')
    await expect(images.first()).toBeVisible()
    
    // Check that images have proper sizes
    const responsiveImages = page.locator('img[sizes]')
    if (await responsiveImages.count() > 0) {
      await expect(responsiveImages.first()).toHaveAttribute('sizes')
    }
  })
})