import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Spa & Masajes Relajación - Masajes Terapéuticos Profesionales'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #8B7355 0%, #A8956F 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '40px',
            }}
          >
            🧘‍♀️
          </div>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
            Spa & Masajes Relajación
          </div>
        </div>
        
        <div
          style={{
            fontSize: '32px',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.4',
            marginBottom: '30px',
          }}
        >
          Servicios Profesionales de Masajes Terapéuticos
        </div>
        
        <div
          style={{
            fontSize: '24px',
            opacity: 0.9,
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          Más de 10 años cuidando tu bienestar • Reserva Online
        </div>
        
        <div
          style={{
            display: 'flex',
            marginTop: '40px',
            gap: '40px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>500+</div>
            <div style={{ fontSize: '16px', opacity: 0.8 }}>Clientes Satisfechos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>4.9⭐</div>
            <div style={{ fontSize: '16px', opacity: 0.8 }}>Calificación</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>$80-140</div>
            <div style={{ fontSize: '16px', opacity: 0.8 }}>Precios</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}