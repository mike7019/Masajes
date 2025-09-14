# Testing Suite Documentation

This document provides an overview of the comprehensive testing suite implemented for the sitio-web-masajes project.

## Overview

The testing suite includes:
- **Unit Tests**: Testing individual components and functions
- **Integration Tests**: Testing API endpoints and service integrations
- **End-to-End Tests**: Testing complete user workflows
- **Accessibility Tests**: Ensuring WCAG compliance
- **Performance Tests**: Validating performance metrics
- **Responsive Design Tests**: Testing across different viewports

## Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # Component tests
│   │   ├── ui/            # UI component tests
│   │   ├── forms/         # Form component tests
│   │   └── landing/       # Landing page component tests
│   ├── api/               # API route tests
│   └── lib/               # Library function tests
│       └── validation/    # Validation schema tests
├── integration/           # Integration tests
│   ├── email-service.test.ts
│   └── database-operations.test.ts
├── e2e/                   # End-to-end tests
│   ├── booking-flow.spec.ts
│   ├── contact-form.spec.ts
│   ├── landing-page.spec.ts
│   ├── responsive-design.spec.ts
│   ├── accessibility.spec.ts
│   └── performance.spec.ts
└── utils/                 # Test utilities
    ├── test-helpers.ts
    ├── mock-handlers.ts
    └── setup-tests.ts
```

## Test Categories

### 1. Unit Tests

#### Component Tests
- **Button Component**: Tests variants, sizes, loading states, and interactions
- **ContactForm Component**: Tests form validation, submission, and error handling
- **BookingForm Component**: Tests reservation flow, validation, and API integration
- **HeroSection Component**: Tests navigation and accessibility

#### API Tests
- **Reservations API**: Tests creation, validation, and error handling
- **Contact API**: Tests message processing and validation
- **Availability API**: Tests time slot calculation and conflicts

#### Validation Tests
- **Reservation Validation**: Tests Zod schemas and business rules
- **Contact Validation**: Tests form data validation and sanitization

### 2. Integration Tests

#### Email Service Integration
- Tests reservation confirmation emails
- Tests contact notification emails
- Tests email template generation
- Tests error handling and retry logic

#### Database Operations Integration
- Tests reservation creation and updates
- Tests availability calculations
- Tests transaction handling
- Tests data validation and sanitization

### 3. End-to-End Tests

#### Booking Flow
- Complete reservation process from service selection to confirmation
- Form validation and error handling
- Payment processing simulation
- Email confirmation verification

#### Contact Form
- Form submission and validation
- Success and error states
- Email notification testing

#### Responsive Design
- Tests across multiple viewport sizes (Mobile, Tablet, Desktop)
- Touch target sizing on mobile devices
- Layout adaptation and content reflow
- Image responsiveness

#### Accessibility
- WCAG 2.1 AA compliance testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- Focus management

#### Performance
- Core Web Vitals measurement
- Image optimization validation
- JavaScript bundle analysis
- Caching strategy verification

## Test Configuration

### Jest Configuration
- **Environment**: jsdom for DOM testing
- **Setup**: Comprehensive mocking of Next.js, Prisma, and external services
- **Coverage**: 70% threshold for branches, functions, lines, and statements
- **Module Mapping**: Path aliases for clean imports

### Playwright Configuration
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Testing**: iOS Safari and Android Chrome simulation
- **Parallel Execution**: Optimized for CI/CD environments
- **Visual Regression**: Screenshot comparison capabilities

## Running Tests

### Unit and Integration Tests
```bash
# Run all Jest tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ContactForm.test.tsx
```

### End-to-End Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific E2E test
npm run test:e2e -- booking-flow.spec.ts
```

### All Tests
```bash
# Run complete test suite
npm run test:all
```

## Test Utilities

### Test Helpers (`tests/utils/test-helpers.ts`)
- **renderWithProviders**: Renders components with necessary providers
- **Mock Data Generators**: Creates consistent test data
- **Date Utilities**: Helper functions for date manipulation in tests
- **API Response Mocks**: Standardized API response mocking
- **Accessibility Helpers**: Automated accessibility testing utilities

### Mock Handlers (`tests/utils/mock-handlers.ts`)
- MSW (Mock Service Worker) handlers for API mocking
- Database operation mocking
- External service mocking (email, payment)

## Coverage Requirements

The test suite maintains the following coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Continuous Integration

Tests are configured to run in CI/CD pipelines with:
- Parallel test execution
- Artifact collection (screenshots, videos, coverage reports)
- Performance regression detection
- Accessibility compliance verification

## Best Practices

### Writing Tests
1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear, descriptive test names
3. **Single Responsibility**: Each test should verify one behavior
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include error conditions and boundary cases

### Maintenance
1. **Regular Updates**: Keep tests updated with code changes
2. **Flaky Test Management**: Address intermittent failures promptly
3. **Performance Monitoring**: Monitor test execution times
4. **Coverage Analysis**: Review coverage reports regularly

## Troubleshooting

### Common Issues
1. **Module Resolution**: Ensure path aliases are configured correctly
2. **Async Operations**: Use proper async/await patterns
3. **Mock Cleanup**: Clear mocks between tests
4. **Environment Variables**: Set up test environment variables

### Debugging
1. **Jest Debug Mode**: Use `--detectOpenHandles` for hanging tests
2. **Playwright Debug**: Use `--debug` flag for E2E test debugging
3. **Coverage Reports**: Use HTML coverage reports for detailed analysis

## Future Enhancements

1. **Visual Regression Testing**: Implement screenshot comparison
2. **Performance Budgets**: Set and enforce performance budgets
3. **Cross-Browser Testing**: Expand browser coverage
4. **Load Testing**: Add performance testing under load
5. **Security Testing**: Implement security vulnerability testing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)