'use client'

interface BookingProgressProps {
  currentStep: 1 | 2 | 3
  steps?: Array<{
    number: number
    title: string
    description: string
  }>
}

export function BookingProgress({ currentStep, steps }: BookingProgressProps) {
  const defaultSteps = [
    {
      number: 1,
      title: 'Seleccionar Servicio',
      description: 'Elige tu masaje ideal'
    },
    {
      number: 2,
      title: 'Fecha y Hora',
      description: 'Selecciona cuándo quieres tu cita'
    },
    {
      number: 3,
      title: 'Confirmar Datos',
      description: 'Completa tu información'
    }
  ]

  const progressSteps = steps || defaultSteps

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {progressSteps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step.number < currentStep
                    ? 'bg-green-500 text-white' // Completed
                    : step.number === currentStep
                    ? 'bg-spa-primary text-white' // Current
                    : 'bg-gray-200 text-gray-600' // Pending
                }`}
              >
                {step.number < currentStep ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              
              {/* Step Info */}
              <div className="ml-3 hidden sm:block">
                <div
                  className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            </div>

            {/* Connector Line */}
            {index < progressSteps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-0.5 transition-colors ${
                    step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Step Info */}
      <div className="sm:hidden mt-4 text-center">
        <div className="text-sm font-medium text-gray-900">
          {progressSteps[currentStep - 1]?.title}
        </div>
        <div className="text-xs text-gray-500">
          {progressSteps[currentStep - 1]?.description}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-spa-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / progressSteps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Paso {currentStep} de {progressSteps.length}</span>
          <span>{Math.round((currentStep / progressSteps.length) * 100)}% completado</span>
        </div>
      </div>
    </div>
  )
}