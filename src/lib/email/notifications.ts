import { sendEmail, sendBulkEmails } from './resend'
import { enviarEmailCancelacion } from './templates'
import { ReservaConServicio } from '@/types'

export async function sendReservaConfirmation(reserva: ReservaConServicio) {
  try {
    // For now, we'll use a simple confirmation email
    // TODO: Create proper email templates
    await sendEmail({
      to: reserva.clienteEmail,
      subject: `Confirmación de Reserva - ${reserva.servicio.nombre}`,
      html: `
        <h2>Reserva Confirmada</h2>
        <p>Estimado/a ${reserva.clienteNombre},</p>
        <p>Su reserva ha sido confirmada:</p>
        <ul>
          <li><strong>Servicio:</strong> ${reserva.servicio.nombre}</li>
          <li><strong>Fecha:</strong> ${new Date(reserva.fechaHora).toLocaleDateString('es-ES')}</li>
          <li><strong>Hora:</strong> ${new Date(reserva.fechaHora).toLocaleTimeString('es-ES')}</li>
        </ul>
        <p>Gracias por elegir nuestros servicios.</p>
      `
    })

    console.log(`Confirmation email sent to ${reserva.clienteEmail} for reservation ${reserva.id}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return { success: false, error }
  }
}

export async function sendAdminNotification(reserva: ReservaConServicio) {
  try {
    const adminEmail = process.env.BUSINESS_EMAIL || 'admin@tumasajes.com'
    
    await sendEmail({
      to: adminEmail,
      subject: `Nueva Reserva - ${reserva.servicio.nombre}`,
      html: `
        <h2>Nueva Reserva Recibida</h2>
        <p><strong>Cliente:</strong> ${reserva.clienteNombre}</p>
        <p><strong>Email:</strong> ${reserva.clienteEmail}</p>
        <p><strong>Teléfono:</strong> ${reserva.clienteTelefono}</p>
        <p><strong>Servicio:</strong> ${reserva.servicio.nombre}</p>
        <p><strong>Fecha:</strong> ${new Date(reserva.fechaHora).toLocaleDateString('es-ES')}</p>
        <p><strong>Hora:</strong> ${new Date(reserva.fechaHora).toLocaleTimeString('es-ES')}</p>
        ${reserva.notas ? `<p><strong>Notas:</strong> ${reserva.notas}</p>` : ''}
      `
    })

    console.log(`Admin notification sent to ${adminEmail} for reservation ${reserva.id}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error }
  }
}

export async function sendReservaReminder(reserva: ReservaConServicio) {
  try {
    await sendEmail({
      to: reserva.clienteEmail,
      subject: `Recordatorio de Cita - ${reserva.servicio.nombre}`,
      html: `
        <h2>Recordatorio de Cita</h2>
        <p>Estimado/a ${reserva.clienteNombre},</p>
        <p>Le recordamos su cita programada para mañana:</p>
        <ul>
          <li><strong>Servicio:</strong> ${reserva.servicio.nombre}</li>
          <li><strong>Fecha:</strong> ${new Date(reserva.fechaHora).toLocaleDateString('es-ES')}</li>
          <li><strong>Hora:</strong> ${new Date(reserva.fechaHora).toLocaleTimeString('es-ES')}</li>
        </ul>
        <p>Si necesita cancelar o reprogramar, contáctenos con anticipación.</p>
      `
    })

    console.log(`Reminder email sent to ${reserva.clienteEmail} for reservation ${reserva.id}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending reminder email:', error)
    return { success: false, error }
  }
}

export async function sendReservaNotifications(reserva: ReservaConServicio) {
  const results: {
    confirmation: { success: boolean; error?: unknown };
    adminNotification: { success: boolean; error?: unknown };
  } = {
    confirmation: { success: false },
    adminNotification: { success: false }
  }

  // Send confirmation email to client
  try {
    const confirmationResult = await sendReservaConfirmation(reserva)
    results.confirmation = confirmationResult
  } catch (error) {
    results.confirmation = { success: false, error }
  }

  // Send notification to admin
  try {
    const adminResult = await sendAdminNotification(reserva)
    results.adminNotification = adminResult
  } catch (error) {
    results.adminNotification = { success: false, error }
  }

  return results
}

// Utility function to send bulk reminders (for cron jobs)
export async function sendBulkReminders(reservas: ReservaConServicio[]) {
  const emails = reservas.map(reserva => ({
    to: reserva.clienteEmail,
    subject: `Recordatorio de Cita - ${reserva.servicio.nombre}`,
    html: `
      <h2>Recordatorio de Cita</h2>
      <p>Estimado/a ${reserva.clienteNombre},</p>
      <p>Le recordamos su cita programada para mañana:</p>
      <ul>
        <li><strong>Servicio:</strong> ${reserva.servicio.nombre}</li>
        <li><strong>Fecha:</strong> ${new Date(reserva.fechaHora).toLocaleDateString('es-ES')}</li>
        <li><strong>Hora:</strong> ${new Date(reserva.fechaHora).toLocaleTimeString('es-ES')}</li>
      </ul>
      <p>Si necesita cancelar o reprogramar, contáctenos con anticipación.</p>
    `
  }))

  const results = await sendBulkEmails(emails)
  
  console.log(`Bulk reminders sent: ${results.filter(r => r.success).length}/${results.length} successful`)
  
  return results
}

// Function to send cancellation email using existing template
export async function sendCancellationEmail(reserva: ReservaConServicio, motivo?: string) {
  try {
    await enviarEmailCancelacion({
      clienteEmail: reserva.clienteEmail,
      clienteNombre: reserva.clienteNombre,
      servicio: reserva.servicio.nombre,
      fechaHora: reserva.fechaHora,
      motivo
    })

    console.log(`Cancellation email sent to ${reserva.clienteEmail} for reservation ${reserva.id}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending cancellation email:', error)
    return { success: false, error }
  }
}

// Email validation utility
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Retry mechanism for failed emails
export async function retryFailedEmail(
  emailFunction: () => Promise<unknown>, 
  maxRetries: number = 3,
  delay: number = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await emailFunction()
      return result
    } catch (error) {
      console.error(`Email attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}