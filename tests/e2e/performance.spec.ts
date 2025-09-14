import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('landing page loads within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {}
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // First Input Delay (simulated)
        vitals.fid = 0 // Will be 0 in automated tests
        
        // Cumulative Layout Shift
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          vitals.cls = clsValue
        }).observe({ entryTypes: ['layout-shift'] })
        
        setTimeout(() => resolve(vitals), 2000)
      })
    })
    
    // LCP should be under 2.5 seconds
    expect(webVitals.lcp).toBeLessThan(2500)
    
    // CLS should be under 0.1
    expect(webVitals.cls).toBeLessThan(0.1)
  })

  test('images are optimized and load efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Check that images have proper optimization attributes
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      
      // Check for lazy loading
      const loading = await img.getAttribute('loading')
      const isAboveFold = await img.evaluate(el => {
        const rect = el.getBoundingClientRect()
        return rect.top < window.innerHeight
      })
      
      if (!isAboveFold) {
        expect(loading).toBe('lazy')
      }
      
      // Check for responsive images
      const srcset = await img.getAttribute('srcset')
      const sizes = await img.getAttribute('sizes')
      
      // Content images should have responsive attributes
      const isDecorative = await img.getAttribute('aria-hidden')
      if (!isDecorative) {
        expect(srcset || sizes).toBeTruthy()
      }
    }
  })

  test('JavaScript bundles are optimized', async ({ page }) => {
    const responses = []
    
    page.on('response', response => {
      if (response.url().includes('.js') && response.status() === 200) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'],
          compressed: response.headers()['content-encoding']
        })
      }
    })
    
    await page.goto('/')
    
    // Check that JavaScript is compressed
    const jsResponses = responses.filter(r => r.url.includes('.js'))
    for (const response of jsResponses) {
      expect(['gzip', 'br', 'deflate']).toContain(response.compressed)
    }
    
    // Main bundle should be reasonably sized (under 500KB)
    const mainBundle = jsResponses.find(r => r.url.includes('main') || r.url.includes('index'))
    if (mainBundle && mainBundle.size) {
      expect(parseInt(mainBundle.size)).toBeLessThan(500000)
    }
  })

  test('CSS is optimized and non-blocking', async ({ page }) => {
    const responses = []
    
    page.on('response', response => {
      if (response.url().includes('.css') && response.status() === 200) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'],
          compressed: response.headers()['content-encoding']
        })
      }
    })
    
    await page.goto('/')
    
    // Check that CSS is compressed
    const cssResponses = responses.filter(r => r.url.includes('.css'))
    for (const response of cssResponses) {
      expect(['gzip', 'br', 'deflate']).toContain(response.compressed)
    }
    
    // Check for critical CSS inlining
    const inlineStyles = await page.locator('style').count()
    expect(inlineStyles).toBeGreaterThan(0) // Should have some critical CSS inlined
  })

  test('fonts load efficiently', async ({ page }) => {
    const fontRequests = []
    
    page.on('request', request => {
      if (request.url().includes('.woff') || request.url().includes('.woff2')) {
        fontRequests.push(request.url())
      }
    })
    
    await page.goto('/')
    
    // Should use modern font formats
    const modernFonts = fontRequests.filter(url => url.includes('.woff2'))
    expect(modernFonts.length).toBeGreaterThan(0)
    
    // Check for font-display: swap
    const fontFaces = await page.evaluate(() => {
      const stylesheets = Array.from(document.styleSheets)
      const fontFaces = []
      
      for (const sheet of stylesheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules)
          for (const rule of rules) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              fontFaces.push(rule.style.fontDisplay)
            }
          }
        } catch (e) {
          // Cross-origin stylesheets might not be accessible
        }
      }
      
      return fontFaces
    })
    
    // Font faces should use font-display: swap for better performance
    if (fontFaces.length > 0) {
      expect(fontFaces.some(display => display === 'swap')).toBeTruthy()
    }
  })

  test('API responses are fast', async ({ page }) => {
    const apiRequests = []
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiRequests.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing()
        })
      }
    })
    
    await page.goto('/reservas')
    
    // Wait for API calls to complete
    await page.waitForTimeout(2000)
    
    // API responses should be fast (under 1 second)
    for (const request of apiRequests) {
      if (request.timing) {
        const responseTime = request.timing.responseEnd - request.timing.requestStart
        expect(responseTime).toBeLessThan(1000)
      }
    }
  })

  test('page uses efficient caching strategies', async ({ page }) => {
    const responses = []
    
    page.on('response', response => {
      responses.push({
        url: response.url(),
        cacheControl: response.headers()['cache-control'],
        etag: response.headers()['etag'],
        lastModified: response.headers()['last-modified']
      })
    })
    
    await page.goto('/')
    
    // Static assets should have cache headers
    const staticAssets = responses.filter(r => 
      r.url.includes('.js') || 
      r.url.includes('.css') || 
      r.url.includes('.png') || 
      r.url.includes('.jpg') || 
      r.url.includes('.webp')
    )
    
    for (const asset of staticAssets) {
      // Should have some form of caching
      expect(
        asset.cacheControl || 
        asset.etag || 
        asset.lastModified
      ).toBeTruthy()
    }
  })

  test('third-party scripts are optimized', async ({ page }) => {
    const thirdPartyRequests = []
    
    page.on('request', request => {
      const url = new URL(request.url())
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        thirdPartyRequests.push({
          url: request.url(),
          resourceType: request.resourceType()
        })
      }
    })
    
    await page.goto('/')
    
    // Third-party scripts should be minimal
    const thirdPartyScripts = thirdPartyRequests.filter(r => r.resourceType === 'script')
    expect(thirdPartyScripts.length).toBeLessThan(5) // Keep third-party scripts minimal
    
    // Check for async/defer attributes on script tags
    const scriptTags = page.locator('script[src]')
    const scriptCount = await scriptTags.count()
    
    for (let i = 0; i < scriptCount; i++) {
      const script = scriptTags.nth(i)
      const src = await script.getAttribute('src')
      
      if (src && !src.startsWith('/') && !src.startsWith('http://localhost')) {
        // Third-party scripts should be async or defer
        const isAsync = await script.getAttribute('async')
        const isDefer = await script.getAttribute('defer')
        
        expect(isAsync !== null || isDefer !== null).toBeTruthy()
      }
    }
  })

  test('page has good Lighthouse performance score', async ({ page }) => {
    // This is a simplified version - in real scenarios you'd use lighthouse CI
    await page.goto('/')
    
    // Check for performance best practices
    const performanceChecks = await page.evaluate(() => {
      const checks = {
        hasServiceWorker: 'serviceWorker' in navigator,
        usesHTTPS: location.protocol === 'https:',
        hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),
        hasMetaDescription: !!document.querySelector('meta[name="description"]'),
        hasTitle: !!document.title && document.title.length > 0
      }
      
      return checks
    })
    
    // Basic performance checks
    expect(performanceChecks.hasMetaViewport).toBeTruthy()
    expect(performanceChecks.hasMetaDescription).toBeTruthy()
    expect(performanceChecks.hasTitle).toBeTruthy()
  })

  test('handles slow network conditions gracefully', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
      route.continue()
    })
    
    const startTime = Date.now()
    await page.goto('/')
    
    // Page should still be usable even with slow network
    await expect(page.locator('h1')).toBeVisible()
    
    // Should show loading states
    const loadingIndicators = page.locator('[data-testid*="loading"], .loading, .spinner')
    if (await loadingIndicators.count() > 0) {
      // Loading indicators should be visible during slow loads
      await expect(loadingIndicators.first()).toBeVisible()
    }
    
    const loadTime = Date.now() - startTime
    // Even with delays, should load within reasonable time
    expect(loadTime).toBeLessThan(10000)
  })
})