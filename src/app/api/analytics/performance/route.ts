import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, duration, type, url, size, timestamp } = body

    // Validate required fields
    if (!name || typeof duration !== 'number' || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, duration, type' },
        { status: 400 }
      )
    }

    // Log the performance metric
    console.log('Performance Metric:', {
      name,
      duration: `${duration.toFixed(2)}ms`,
      type,
      url,
      size: size ? `${(size / 1024).toFixed(2)}KB` : undefined,
      timestamp: new Date(timestamp).toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    })

    // Here you could:
    // 1. Store in database for analysis
    // 2. Send to external monitoring service (DataDog, New Relic, etc.)
    // 3. Trigger alerts for performance issues

    // Example: Check for performance issues and alert
    if (shouldAlert(name, duration, type)) {
      await sendPerformanceAlert({
        name,
        duration,
        type,
        url,
        timestamp,
      })
    }

    // Example: Store critical metrics
    if (shouldStore(name, duration, type)) {
      // await storePerformanceMetric({ name, duration, type, url, timestamp })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing performance metric:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to determine if we should alert
function shouldAlert(name: string, duration: number, type: string): boolean {
  const alertThresholds = {
    'api': 5000,      // 5 seconds for API calls
    'timing': 3000,   // 3 seconds for custom timings
    'longtask': 100,  // 100ms for long tasks
    'resource': 10000, // 10 seconds for resources
  }

  const threshold = alertThresholds[type as keyof typeof alertThresholds]
  return threshold ? duration > threshold : false
}

// Helper function to determine if we should store the metric
function shouldStore(name: string, duration: number, type: string): boolean {
  // Store all API calls and long tasks, and slow timings
  return type === 'api' || type === 'longtask' || (type === 'timing' && duration > 1000)
}

// Send performance alert
async function sendPerformanceAlert(alert: {
  name: string
  duration: number
  type: string
  url?: string
  timestamp: number
}) {
  // In a real application, you might send this to:
  // - Slack webhook
  // - Email service
  // - PagerDuty
  // - Discord webhook
  // - etc.
  
  console.warn(`🚨 Performance Alert: ${alert.type} "${alert.name}" took ${alert.duration.toFixed(2)}ms on ${alert.url}`)
  
  // Example: Send to a webhook
  // try {
  //   await fetch(process.env.PERFORMANCE_WEBHOOK_URL!, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       text: `Performance Alert: ${alert.type} "${alert.name}" took ${alert.duration.toFixed(2)}ms`,
  //       url: alert.url,
  //       timestamp: new Date(alert.timestamp).toISOString(),
  //     }),
  //   })
  // } catch (error) {
  //   console.error('Failed to send performance alert:', error)
  // }
}

// Example function to store metrics in database
// async function storePerformanceMetric(metric: {
//   name: string
//   duration: number
//   type: string
//   url?: string
//   timestamp: number
// }) {
//   const prisma = new PrismaClient()
//   try {
//     await prisma.performanceMetric.create({
//       data: {
//         name: metric.name,
//         duration: metric.duration,
//         type: metric.type,
//         url: metric.url,
//         timestamp: new Date(metric.timestamp),
//       }
//     })
//   } finally {
//     await prisma.$disconnect()
//   }
// }