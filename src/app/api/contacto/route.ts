import { NextRequest, NextResponse } from 'next/server'
import { validateContactoData } from '@/lib/validation/contacto'
import { sendEmail } from '@/lib/email/resend'
import { generalApiRateLimit } from '@/lib/middleware/rateLimit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = generalApiRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    
    // Validate input data
    const validation = validateContactoData(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues.map(e => e.message)
        },
        { status: 400 }
      )
    }

    const { nombre, email, telefono, asunto, mensaje, tipoConsulta } = validation.data

    // Generate email content
    const adminEmail = process.env.BUSINESS_EMAIL || 'admin@tumasajes.com'
    const fromEmail = process.env.EMAIL_FROM || 'noreply@tumasajes.com'

    // Email to business
    const businessEmailContent = generateBusinessNotificationEmail({
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
      tipoConsulta
    })

    // Email confirmation to user
    const userConfirmationContent = generateUserConfirmationEmail({
      nombre,
      email,
      asunto,
      tipoConsulta
    })

    // Send emails
    const emailPromises = [
      // Send to business
      sendEmail({
        to: adminEmail,
        subject: `💬 Nueva Consulta: ${asunto}`,
        html: businessEmailContent
      }),
      // Send confirmation to user
      sendEmail({
        to: email,
        subject: '✅ Hemos recibido tu mensaje - Spa & Masajes Relajación',
        html: userConfirmationContent
      })
    ]

    try {
      await Promise.all(emailPromises)
      console.log(`Contact form submitted by ${email} - emails sent successfully`)
    } catch (emailError) {
      console.error('Error sending contact emails:', emailError)
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      message: 'Mensaje enviado correctamente',
      data: {
        nombre,
        email,
        asunto,
        tipoConsulta
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

function generateBusinessNotificationEmail(data: {
  nombre: string
  email: string
  telefono?: string
  asunto: string
  mensaje: string
  tipoConsulta: string
}) {
  const tipoLabels: Record<string, string> = {
    general: 'Consulta General',
    reserva: 'Información sobre Reservas',
    servicio: 'Consulta sobre Servicios',
    precio: 'Información de Precios',
    cancelacion: 'Cancelación o Reprogramación',
    otro: 'Otro'
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Consulta</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1E40AF;
        }
        .alert-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .title {
          color: #1E40AF;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .details-card {
          background-color: #EFF6FF;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          border-left: 4px solid #1E40AF;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        .detail-label {
          font-weight: 600;
          color: #1E40AF;
        }
        .detail-value {
          color: #374151;
          text-align: right;
        }
        .message-content {
          background-color: #F9FAFB;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #E5E7EB;
        }
        .priority-high {
          border-left-color: #DC2626;
          background-color: #FEF2F2;
        }
        .actions {
          text-align: center;
          margin: 25px 0;
        }
        .button {
          display: inline-block;
          background-color: #1E40AF;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="alert-icon">💬</div>
          <h1 class="title">Nueva Consulta Recibida</h1>
          <p>Se ha recibido un nuevo mensaje a través del formulario de contacto</p>
        </div>

        <div class="details-card">
          <h3 style="margin-top: 0; color: #1E40AF;">👤 Información del Cliente</h3>
          
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value"><strong>${data.nombre}</strong></span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.email}</span>
          </div>
          
          ${data.telefono ? `
          <div class="detail-row">
            <span class="detail-label">Teléfono:</span>
            <span class="detail-value">${data.telefono}</span>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="detail-label">Tipo de Consulta:</span>
            <span class="detail-value"><strong>${tipoLabels[data.tipoConsulta] || data.tipoConsulta}</strong></span>
          </div>
        </div>

        <div class="details-card">
          <h3 style="margin-top: 0; color: #1E40AF;">📋 Detalles de la Consulta</h3>
          
          <div class="detail-row">
            <span class="detail-label">Asunto:</span>
            <span class="detail-value"><strong>${data.asunto}</strong></span>
          </div>
        </div>

        <div class="message-content">
          <h4 style="margin-top: 0; color: #374151;">💬 Mensaje:</h4>
          <p style="white-space: pre-wrap; margin: 0;">${data.mensaje}</p>
        </div>

        <div class="actions">
          <a href="mailto:${data.email}" class="button">
            📧 Responder por Email
          </a>
          ${data.telefono ? `
          <a href="tel:${data.telefono}" class="button" style="background-color: #059669;">
            📞 Llamar Cliente
          </a>
          ` : ''}
        </div>

        <div style="background-color: #F9FAFB; padding: 15px; border-radius: 8px; margin-top: 25px; text-align: center; font-size: 14px; color: #6B7280;">
          <p><strong>Recibido:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Prioridad:</strong> ${data.tipoConsulta === 'cancelacion' ? 'Alta' : 'Normal'}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateUserConfirmationEmail(data: {
  nombre: string
  email: string
  asunto: string
  tipoConsulta: string
}) {
  const tipoLabels: Record<string, string> = {
    general: 'Consulta General',
    reserva: 'Información sobre Reservas',
    servicio: 'Consulta sobre Servicios',
    precio: 'Información de Precios',
    cancelacion: 'Cancelación o Reprogramación',
    otro: 'Otro'
  }

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mensaje Recibido</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #8B7355;
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .title {
          color: #8B7355;
          font-size: 24px;
          margin-bottom: 10px;
        }
        .info-card {
          background-color: #F5F5DC;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          border-left: 4px solid #8B7355;
        }
        .contact-info {
          background-color: #F3F4F6;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1 class="title">¡Mensaje Recibido!</h1>
          <p>Gracias por contactarnos, ${data.nombre}</p>
        </div>

        <p>Hemos recibido tu mensaje y te responderemos pronto. Aquí tienes un resumen de tu consulta:</p>

        <div class="info-card">
          <h3 style="margin-top: 0; color: #8B7355;">📋 Resumen de tu Consulta</h3>
          <p><strong>Tipo:</strong> ${tipoLabels[data.tipoConsulta] || data.tipoConsulta}</p>
          <p><strong>Asunto:</strong> ${data.asunto}</p>
          <p><strong>Email de contacto:</strong> ${data.email}</p>
        </div>

        <div style="background-color: #EFF6FF; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #1E40AF;">⏰ Tiempo de Respuesta</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>📧 <strong>Email:</strong> Responderemos en un máximo de 24 horas</li>
            <li>📞 <strong>Urgente:</strong> Llama al +1 (234) 567-890</li>
            <li>🕒 <strong>Horario:</strong> Lun-Vie 9:00-18:00, Sáb 10:00-16:00</li>
          </ul>
        </div>

        <div class="contact-info">
          <h3 style="margin-top: 0; color: #8B7355;">📍 Spa & Masajes Relajación</h3>
          <p>Calle Principal 123, Centro de la Ciudad</p>
          <p>📞 +1 (234) 567-890 | 📧 info@tumasajes.com</p>
          <p>🌐 <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="color: #8B7355;">www.tumasajes.com</a></p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E5E5; color: #666; font-size: 14px;">
          <p>¡Gracias por confiar en nosotros! 🧘‍♀️</p>
          <p>© 2024 Spa & Masajes Relajación</p>
        </div>
      </div>
    </body>
    </html>
  `
}