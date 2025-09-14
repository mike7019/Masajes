import { test, expect } from '@playwright/test'

test.describe('Booking Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock successful API responses
    await page.route('/api/servicios', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'service-1',
            nombre: 'Masaje Relajante',
            descripcion: 'Un masaje para relajar cuerpo y mente',
            duracion: 60,
            precio: 80,
            activo: true,
            promociones: []
          }
        ])
      })
    })

    await page.route('/api/disponibilidad**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          horariosDisponibles: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
        })
      })
    })

    await page.route('/api/reservas', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'reservation-123',
          clienteNombre: 'Juan Pérez',
          clienteEmail: 'juan@test.com',
          estado: 'PENDIENTE'
        })
      })
    })

    await page.goto('/reservas')
  })

  test('completes full booking flow', async ({ page }) => {
    // Step 1: Service Selection
    await expect(page.locator('h1')).toContainText(/reservar/i)
    
    // Wait for services to load
    await page.waitForSelector('[data-testid="service-card"]')
    
    // Select first service
    const firstService = page.locator('[data-testid="service-card"]').first()
    await firstService.click()
    
    // Verify service is selected
    await expect(firstService).toHaveClass(/selected|ring/)
    
    // Proceed to next step
    await page.click('[data-testid="next-button"]')
    
    // Step 2: Date and Time Selection
    await expect(page.locator('h2')).toContainText(/fecha.*hora/i)
    
    // Wait for calendar to load
    await page.waitForSelector('[data-testid="calendar"]')
    
    // Select a future date (assuming calendar shows current month)
    const availableDate = page.locator('[data-testid="available-date"]').first()
    await availableDate.click()
    
    // Select a time slot
    await page.waitForSelector('[data-testid="time-slot"]')
    const timeSlot = page.locator('[data-testid="time-slot"]').first()
    await timeSlot.click()
    
    // Proceed to next step
    await page.click('[data-testid="next-button"]')
    
    // Step 3: Client Information
    await expect(page.locator('h2')).toContainText(/información/i)
    
    // Fill out the form
    await page.fill('[data-testid="client-name"]', 'Juan Pérez')
    await page.fill('[data-testid="client-email"]', 'juan@test.com')
    await page.fill('[data-testid="client-phone"]', '123456789')
    await page.fill('[data-testid="client-notes"]', 'Primera vez, tengo algunas molestias en la espalda')
    
    // Step 4: Confirmation
    await page.click('[data-testid="confirm-button"]')
    
    // Wait for confirmation page
    await page.waitForSelector('[data-testid="booking-confirmation"]')
    
    // Verify confirmation details
    await expect(page.locator('[data-testid="confirmation-message"]')).toContainText(/confirmada/i)
    await expect(page.locator('[data-testid="client-name-display"]')).toContainText('Juan Pérez')
    await expect(page.locator('[data-testid="client-email-display"]')).toContainText('juan@test.com')
    
    // Check that booking ID is displayed
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible()
  })

  test('validates form fields correctly', async ({ page }) => {
    // Select service and proceed to client info
    await page.waitForSelector('[data-testid="service-card"]')
    await page.click('[data-testid="service-card"]')
    await page.click('[data-testid="next-button"]')
    
    // Skip date selection for this test (mock or select quickly)
    await page.waitForSelector('[data-testid="available-date"]')
    await page.click('[data-testid="available-date"]')
    await page.waitForSelector('[data-testid="time-slot"]')
    await page.click('[data-testid="time-slot"]')
    await page.click('[data-testid="next-button"]')
    
    // Try to submit without filling required fields
    await page.click('[data-testid="confirm-button"]')
    
    // Check validation errors
    await expect(page.locator('[data-testid="name-error"]')).toContainText(/requerido/i)
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/requerido/i)
    
    // Fill invalid email
    await page.fill('[data-testid="client-name"]', 'Juan Pérez')
    await page.fill('[data-testid="client-email"]', 'invalid-email')
    await page.fill('[data-testid="client-phone"]', '123')
    
    await page.click('[data-testid="confirm-button"]')
    
    // Check specific validation errors
    await expect(page.locator('[data-testid="email-error"]')).toContainText(/válido/i)
    await expect(page.locator('[data-testid="phone-error"]')).toContainText(/dígitos/i)
  })

  test('handles unavailable time slots', async ({ page }) => {
    // Select service
    await page.waitForSelector('[data-testid="service-card"]')
    await page.click('[data-testid="service-card"]')
    await page.click('[data-testid="next-button"]')
    
    // Select date
    await page.waitForSelector('[data-testid="available-date"]')
    await page.click('[data-testid="available-date"]')
    
    // Check that unavailable slots are disabled
    const unavailableSlots = page.locator('[data-testid="time-slot"][disabled]')
    if (await unavailableSlots.count() > 0) {
      await expect(unavailableSlots.first()).toBeDisabled()
    }
    
    // Check that available slots are clickable
    const availableSlots = page.locator('[data-testid="time-slot"]:not([disabled])')
    if (await availableSlots.count() > 0) {
      await expect(availableSlots.first()).toBeEnabled()
    }
  })

  test('allows navigation between steps', async ({ page }) => {
    // Go through first step
    await page.waitForSelector('[data-testid="service-card"]')
    await page.click('[data-testid="service-card"]')
    await page.click('[data-testid="next-button"]')
    
    // Go to second step and then back
    await page.waitForSelector('[data-testid="back-button"]')
    await page.click('[data-testid="back-button"]')
    
    // Verify we're back at service selection
    await expect(page.locator('h2')).toContainText(/servicio/i)
    
    // Service should still be selected
    const selectedService = page.locator('[data-testid="service-card"].selected')
    await expect(selectedService).toBeVisible()
  })

  test('shows loading states during submission', async ({ page }) => {
    // Complete the booking flow
    await page.waitForSelector('[data-testid="service-card"]')
    await page.click('[data-testid="service-card"]')
    await page.click('[data-testid="next-button"]')
    
    await page.waitForSelector('[data-testid="available-date"]')
    await page.click('[data-testid="available-date"]')
    await page.waitForSelector('[data-testid="time-slot"]')
    await page.click('[data-testid="time-slot"]')
    await page.click('[data-testid="next-button"]')
    
    await page.fill('[data-testid="client-name"]', 'Juan Pérez')
    await page.fill('[data-testid="client-email"]', 'juan@test.com')
    await page.fill('[data-testid="client-phone"]', '123456789')
    
    // Click confirm and immediately check for loading state
    await page.click('[data-testid="confirm-button"]')
    
    // Check loading indicator appears
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    
    // Check button is disabled during loading
    await expect(page.locator('[data-testid="confirm-button"]')).toBeDisabled()
  })

  test('handles booking errors gracefully', async ({ page }) => {
    // Mock API error by intercepting the request
    await page.route('/api/reservas', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      })
    })
    
    // Complete booking flow
    await page.waitForSelector('[data-testid="service-card"]')
    await page.click('[data-testid="service-card"]')
    await page.click('[data-testid="next-button"]')
    
    await page.waitForSelector('[data-testid="available-date"]')
    await page.click('[data-testid="available-date"]')
    await page.waitForSelector('[data-testid="time-slot"]')
    await page.click('[data-testid="time-slot"]')
    await page.click('[data-testid="next-button"]')
    
    await page.fill('[data-testid="client-name"]', 'Juan Pérez')
    await page.fill('[data-testid="client-email"]', 'juan@test.com')
    await page.fill('[data-testid="client-phone"]', '123456789')
    
    await page.click('[data-testid="confirm-button"]')
    
    // Check error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/error/i)
    
    // Check that user can retry
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test('is accessible with keyboard navigation', async ({ page }) => {
    // Test keyboard navigation through the booking flow
    await page.keyboard.press('Tab')
    
    // First service should be focused
    const firstService = page.locator('[data-testid="service-card"]').first()
    await expect(firstService).toBeFocused()
    
    // Select with Enter
    await page.keyboard.press('Enter')
    await expect(firstService).toHaveClass(/selected|ring/)
    
    // Navigate to next button
    await page.keyboard.press('Tab')
    const nextButton = page.locator('[data-testid="next-button"]')
    await expect(nextButton).toBeFocused()
    
    // Continue with Enter
    await page.keyboard.press('Enter')
    
    // Should be on date selection step
    await expect(page.locator('h2')).toContainText(/fecha.*hora/i)
  })

  test('works on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Complete booking flow on mobile
    await page.waitForSelector('[data-testid="service-card"]')
    
    // Services should be displayed in mobile layout
    const serviceCards = page.locator('[data-testid="service-card"]')
    await expect(serviceCards.first()).toBeVisible()
    
    // Select service
    await serviceCards.first().click()
    await page.click('[data-testid="next-button"]')
    
    // Calendar should be mobile-friendly
    await page.waitForSelector('[data-testid="calendar"]')
    const calendar = page.locator('[data-testid="calendar"]')
    await expect(calendar).toBeVisible()
    
    // Time slots should be touch-friendly
    await page.waitForSelector('[data-testid="available-date"]')
    await page.click('[data-testid="available-date"]')
    
    const timeSlots = page.locator('[data-testid="time-slot"]')
    await expect(timeSlots.first()).toBeVisible()
  })
})