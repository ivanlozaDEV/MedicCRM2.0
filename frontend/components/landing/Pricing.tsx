import Link from 'next/link';

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '49',
      description: 'Perfecto para consultorios pequeños',
      features: [
        'Hasta 3 usuarios',
        'Hasta 100 pacientes',
        '500 citas mensuales',
        'Gestión básica de pacientes',
        'Agenda digital',
        'Soporte por email',
        'Actualizaciones incluidas',
      ],
      cta: 'Comenzar Gratis',
      popular: false,
    },
    {
      name: 'Professional',
      price: '149',
      description: 'Ideal para clínicas en crecimiento',
      features: [
        'Hasta 15 usuarios',
        'Pacientes ilimitados',
        'Citas ilimitadas',
        'Todo en Basic, más:',
        'Especialidades médicas',
        'Roles y permisos avanzados',
        'Reportes y analíticas',
        'Recordatorios automáticos',
        'Integración con calendario',
        'Soporte prioritario 24/7',
      ],
      cta: 'Comenzar Gratis',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Para hospitales y grandes organizaciones',
      features: [
        'Usuarios ilimitados',
        'Multi-clínica',
        'Todo en Professional, más:',
        'API personalizada',
        'Integraciones custom',
        'Onboarding dedicado',
        'Gestor de cuenta',
        'SLA garantizado',
        'Seguridad avanzada',
        'Soporte 24/7 premium',
      ],
      cta: 'Contactar Ventas',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold inline-block mb-4">
            Precios Transparentes
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-xl text-gray-600">
            Todos los planes incluyen 14 días de prueba gratis. Sin tarjeta de crédito. 
            Cancela cuando quieras.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl border-2 ${
                plan.popular ? 'border-blue-600 shadow-xl' : 'border-gray-200'
              } p-8 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="flex items-baseline mb-2">
                  {plan.price !== 'Custom' ? (
                    <>
                      <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600 ml-2">/mes</span>
                    </>
                  ) : (
                    <span className="text-5xl font-bold text-gray-900">Cotizar</span>
                  )}
                </div>
                {plan.price !== 'Custom' && (
                  <p className="text-sm text-gray-500">Facturación anual disponible</p>
                )}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg 
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    <span className={feature.includes('Todo en') ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.price === 'Custom' ? '/contact' : '/signup'}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Datos Protegidos</h3>
              <p className="text-gray-600 text-sm">Encriptación SSL y backups automáticos</p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Sin Contratos</h3>
              <p className="text-gray-600 text-sm">Cancela cuando quieras, sin preguntas</p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Migración Gratis</h3>
              <p className="text-gray-600 text-sm">Te ayudamos a migrar desde tu sistema actual</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
