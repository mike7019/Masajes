import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      )
    }

    // Send test email
    await sendEmail({
      to: email,
      subject: '✅ Email de Prueba - Spa & Masajes Relajación',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email de Prueba</title>
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
              text-align: center;
            }
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .title {
              color: #8B7355;
              font-size: 24px;
              margin-bottom: 15px;
            }
            .message {
              color: #666;
              margin-bottom: 25px;
            }
            .info-box {
              background-color: #F5F5DC;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1 class="title">¡Email de Prueba Exitoso!</h1>
            <p class="message">
              Este es un email de prueba del sistema de notificaciones de 
              <strong>Spa & Masajes Relajación</strong>.
            </p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #8B7355;">📋 Información del Sistema</h3>
              <p><strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-ES')}</p>
              <p><strong>Email destinatario:</strong> ${email}</p>
              <p><strong>Servicio de email:</strong> Resend</p>
              <p><strong>Estado:</strong> Funcionando correctamente ✅</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 25px;">
              Si recibes este email, significa que el sistema de notificaciones 
              está configurado y funcionando correctamente.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E5E5; color: #666; font-size: 14px;">
              <p>© 2024 Spa & Masajes Relajación</p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    return NextResponse.json({
      message: 'Email de prueba enviado correctamente',
      email
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { error: 'Error al enviar email de prueba' },
      { status: 500 }
    )
  }
}