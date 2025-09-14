import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, id, url, timestamp } = body

    // Validate required fields
    if (!name || typeof value !== 'number' || !id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, value, id' },
        { status: 400 }
      )
    }

    // Log the metric (in production, you might want to send this to a proper analytics service)
    console.log('Web Vital Metric:', {
      name,
      value,
      id,
      url,
      timestamp,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    })

    // Here you could:
    // 1. Store in database for analysis
    // 2. Send to external analytics service (Google Analytics, DataDog, etc.)
    // 3. Trigger alerts for poor performance

    // Example: Store critical metrics in database
    if (shouldStoreMetric(name, value)) {
      // await storeMetricInDatabase({ name, value, id, url, timestamp })
    }

    // Example: Send alerts for poor performance
    if (isPerformanceCritical(name, value)) {
      // await sendPerformanceAlert({ name, value, url })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing web vitals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine if metric should be stored
function shouldStoreMetric(name: string, value: number): boolean {
  const criticalMetrics = ['LCP', 'FID', 'CLS']
  return criticalMetrics.includes(name)
}

// Helper function to determine if performance is critical
function isPerformanceCritical(name: string, value: number): boolean {
  const thresholds = {
    LCP: 2500, // 2.5 seconds
    FID: 100,  // 100 milliseconds
    CLS: 0.1,  // 0.1 cumulative layout shift
    FCP: 1800, // 1.8 seconds
    TTFB: 800, // 800 milliseconds
  }

  const threshold = thresholds[name as keyof typeof thresholds]
  return threshold ? value > threshold : false
}

// Example function to store metrics in database
// async function storeMetricInDatabase(metric: {
//   name: string
//   value: number
//   id: string
//   url: string
//   timestamp: number
// }) {
//   const prisma = new PrismaClient()
//   try {
//     await prisma.webVitalMetric.create({
//       data: {
//         name: metric.name,
//         value: metric.value,
//         metricId: metric.id,
//         url: metric.url,
//         timestamp: new Date(metric.timestamp),
//       }
//     })
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// Example function to send performance alerts
// async function sendPerformanceAlert(alert: {
//   name: string
//   value: number
//   url: string
// }) {
//   // Send email, Slack notification, etc.
//   console.warn(`Performance Alert: ${alert.name} is ${alert.value} on ${alert.url}`)
// }