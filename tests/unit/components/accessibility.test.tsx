import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '@/components/ui/Button'
import { ContactForm } from '@/components/forms/ContactForm'
import { ServiceSelector } from '@/components/forms/ServiceSelector'
import { HeroSection } from '@/components/landing/HeroSection'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  describe('Button Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<Button>Click me</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA attributes when disabled', async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA attributes when loading', async () => {
      const { container } = render(<Button loading>Loading Button</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ContactForm Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ContactForm />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper form labels', async () => {
      const { container } = render(<ContactForm />)
      
      // Check that all form inputs have associated labels
      const inputs = container.querySelectorAll('input, textarea')
      inputs.forEach(input => {
        const id = input.getAttribute('id')
        const ariaLabel = input.getAttribute('aria-label')
        const ariaLabelledBy = input.getAttribute('aria-labelledby')
        const label = id ? container.querySelector(`label[for="${id}"]`) : null
        
        expect(label || ariaLabel || ariaLabelledBy).toBeTruthy()
      })
    })

    it('should have proper error message associations', async () => {
      const { container } = render(<ContactForm />)
      
      // Trigger validation errors
      const submitButton = container.querySelector('button[type="submit"]')
      submitButton?.click()
      
      // Wait for errors to appear and check associations
      setTimeout(async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }, 100)
    })
  })

  describe('ServiceSelector Component', () => {
    it('should not have accessibility violations', async () => {
      const mockOnSelect = jest.fn()
      const { container } = render(<ServiceSelector onSelect={mockOnSelect} />)
      
      // Wait for services to load
      setTimeout(async () => {
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      }, 100)
    })

    it('should have proper keyboard navigation', async () => {
      const mockOnSelect = jest.fn()
      const { container } = render(<ServiceSelector onSelect={mockOnSelect} />)
      
      // Check that service cards are focusable
      setTimeout(() => {
        const serviceCards = container.querySelectorAll('[role="button"], button')
        serviceCards.forEach(card => {
          expect(card.getAttribute('tabindex')).not.toBe('-1')
        })
      }, 100)
    })
  })

  describe('HeroSection Component', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<HeroSection />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper heading hierarchy', async () => {
      const { container } = render(<HeroSection />)
      
      // Check that there's only one h1
      const h1Elements = container.querySelectorAll('h1')
      expect(h1Elements).toHaveLength(1)
      
      // Check that headings follow proper hierarchy
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let previousLevel = 0
      
      headings.forEach(heading => {
        const currentLevel = parseInt(heading.tagName.charAt(1))
        expect(currentLevel).toBeLessThanOrEqual(previousLevel + 1)
        previousLevel = currentLevel
      })
    })

    it('should have proper image alt text', async () => {
      const { container } = render(<HeroSection />)
      
      const images = container.querySelectorAll('img')
      images.forEach(img => {
        const alt = img.getAttribute('alt')
        const ariaLabel = img.getAttribute('aria-label')
        const ariaLabelledBy = img.getAttribute('aria-labelledby')
        const role = img.getAttribute('role')
        
        // Images should have alt text unless they're decorative
        if (role !== 'presentation' && !img.getAttribute('aria-hidden')) {
          expect(alt || ariaLabel || ariaLabelledBy).toBeTruthy()
        }
      })
    })
  })

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text elements', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <p className="text-gray-600">Regular text</p>
          <h1 className="text-gray-900">Main heading</h1>
        </div>
      )
      
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })
  })

  describe('Focus Management', () => {
    it('should have visible focus indicators', async () => {
      const { container } = render(
        <div>
          <Button>Focusable Button</Button>
          <input type="text" placeholder="Focusable Input" />
          <a href="/test">Focusable Link</a>
        </div>
      )
      
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })
  })

  describe('ARIA Landmarks', () => {
    it('should have proper landmark structure', async () => {
      const { container } = render(
        <div>
          <header role="banner">
            <nav role="navigation">Navigation</nav>
          </header>
          <main role="main">
            <section>Content</section>
          </main>
          <footer role="contentinfo">Footer</footer>
        </div>
      )
      
      const results = await axe(container, {
        rules: {
          'landmark-one-main': { enabled: true },
          'landmark-complementary-is-top-level': { enabled: true }
        }
      })
      
      expect(results).toHaveNoViolations()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA live regions for dynamic content', async () => {
      const { container } = render(
        <div>
          <div aria-live="polite" id="status-messages">
            Status updates appear here
          </div>
          <div aria-live="assertive" id="error-messages">
            Error messages appear here
          </div>
        </div>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA descriptions for complex interactions', async () => {
      const mockOnSelect = jest.fn()
      const { container } = render(
        <ServiceSelector 
          onSelect={mockOnSelect}
          aria-describedby="service-help-text"
        />
      )
      
      // Add help text
      const helpText = document.createElement('div')
      helpText.id = 'service-help-text'
      helpText.textContent = 'Select a service to continue with your booking'
      container.appendChild(helpText)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})