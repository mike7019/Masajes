import { Resend } from 'resend'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const resend = new Resend(process.env.EMAIL_SERVER_PASSWORD)

interface EmailCancelacionData {
  clienteEmail: string
  clienteNombre: string
  servicio: string
  fechaHora: Date
  motivo?: string
}

export async function enviarEmailCancelacion(data: EmailCancelacionData) {
  const fechaFormateada = format(data.fechaHora, "PPP 'a las' p", { locale: es })
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reserva Cancelada</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
        .alert { background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .details { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; color: #dc3545;">Reserva Cancelada</h1>
        </div>
        
        <div class="content">
          <p>Estimado/a ${data.clienteNombre},</p>
          
          <div class="alert">
            <strong>Su reserva ha sido cancelada</strong>
          </div>
          
          <p>Lamentamos informarle que su reserva ha sido cancelada por nuestro equipo.</p>
          
          <div class="details">
            <h3>Detalles de la reserva cancelada:</h3>
            <ul>
              <li><strong>Servicio:</strong> ${data.servicio}</li>
              <li><strong>Fecha y hora:</strong> ${fechaFormateada}</li>
              ${data.motivo ? `<li><strong>Motivo:</strong> ${data.motivo}</li>` : ''}
            </ul>
          </div>
          
          <p>Si desea reprogramar su cita o tiene alguna pregunta, no dude en contactarnos:</p>
          <ul>
            <li><strong>Teléfono:</strong> ${process.env.BUSINESS_PHONE}</li>
            <li><strong>Email:</strong> ${process.env.BUSINESS_EMAIL}</li>
          </ul>
          
          <p>Agradecemos su comprensión y esperamos poder atenderle en una próxima oportunidad.</p>
          
          <p>Saludos cordiales,<br>
          <strong>${process.env.BUSINESS_NAME}</strong></p>
        </div>
        
        <div class="footer">
          <p>Este es un mensaje automático, por favor no responda a este email.</p>
          <p>${process.env.BUSINESS_ADDRESS}</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
    Estimado/a ${data.clienteNombre},

    Su reserva ha sido cancelada.

    Detalles de la reserva:
    - Servicio: ${data.servicio}
    - Fecha y hora: ${fechaFormateada}
    ${data.motivo ? `- Motivo: ${data.motivo}` : ''}

    Si desea reprogramar su cita o tiene alguna pregunta, contáctenos:
    - Teléfono: ${process.env.BUSINESS_PHONE}
    - Email: ${process.env.BUSINESS_EMAIL}

    Saludos cordiales,
    ${process.env.BUSINESS_NAME}
  `

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: data.clienteEmail,
      subject: `Reserva Cancelada - ${data.servicio}`,
      html: htmlContent,
      text: textContent,
    })

    // También enviar copia al negocio
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: process.env.BUSINESS_EMAIL!,
      subject: `[ADMIN] Reserva Cancelada - ${data.clienteNombre}`,
      html: `
        <h2>Reserva Cancelada por Administrador</h2>
        <p><strong>Cliente:</strong> ${data.clienteNombre} (${data.clienteEmail})</p>
        <p><strong>Servicio:</strong> ${data.servicio}</p>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        ${data.motivo ? `<p><strong>Motivo:</strong> ${data.motivo}</p>` : ''}
      `,
    })

    console.log('Emails de cancelación enviados exitosamente')
  } catch (error) {
    console.error('Error enviando emails de cancelación:', error)
    throw error
  }
}