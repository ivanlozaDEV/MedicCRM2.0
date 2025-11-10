import Link from 'next/link';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
                Transformando la Atención Médica
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Gestiona tu práctica médica con{' '}
              <span className="text-blue-600">inteligencia</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              DoctorCRM es la plataforma todo-en-uno que necesitas para optimizar 
              la gestión de pacientes, citas y tu equipo médico. Más tiempo para 
              cuidar, menos tiempo administrando.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg text-center"
              >
                Comenzar Prueba Gratis
              </Link>
              <Link 
                href="#demo" 
                className="px-8 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-lg text-center"
              >
                Ver Demo
              </Link>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 font-medium">Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 font-medium">15 días gratis</span>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative bg-gray-50 rounded-2xl p-8 border border-gray-200">
              {/* Dashboard Preview Mock */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 py-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-blue-600 rounded w-12"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-green-500 rounded w-12"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-6 bg-purple-500 rounded w-12"></div>
                  </div>
                </div>

                {/* List Items */}
                <div className="space-y-3 pt-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-16 h-6 bg-blue-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-900">+127 pacientes</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-900">98% satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
