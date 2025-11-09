export default function Benefits() {
  return (
    <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Benefits List */}
          <div className="space-y-12">
            <div>
              <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold inline-block mb-4">
                Beneficios Reales
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Transformamos tu práctica médica
              </h2>
              <p className="text-xl text-gray-600">
                Más de 500 profesionales de la salud confían en DoctorCRM para 
                mejorar su eficiencia operativa y la satisfacción de sus pacientes.
              </p>
            </div>

            <div className="space-y-8">
              {/* Benefit 1 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Ahorra hasta 15 horas semanales
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Automatiza tareas repetitivas y enfócate en lo que realmente importa: 
                    cuidar a tus pacientes. Reduce el tiempo administrativo significativamente.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Aumenta la satisfacción del paciente
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Recordatorios automáticos, tiempos de espera reducidos y mejor comunicación. 
                    Tus pacientes lo notarán y lo agradecerán.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Incrementa tus ingresos en un 30%
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Optimiza tu agenda, reduce las ausencias y maximiza la utilización de tu tiempo. 
                    Más pacientes atendidos con mejor calidad de servicio.
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Implementación en menos de 24 horas
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    No pierdas tiempo con sistemas complicados. Nuestro equipo te ayuda a configurar 
                    todo rápidamente para que empieces a ver resultados de inmediato.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Stats Cards */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
              <div className="text-5xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Clínicas Activas</div>
              <div className="text-gray-600">Profesionales confiando en nuestra plataforma</div>
            </div>

            <div className="bg-green-50 p-8 rounded-2xl border border-green-100">
              <div className="text-5xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Satisfacción</div>
              <div className="text-gray-600">De nuestros usuarios recomiendan DoctorCRM</div>
            </div>

            <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100">
              <div className="text-5xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Citas Mensuales</div>
              <div className="text-gray-600">Gestionadas eficientemente cada mes</div>
            </div>

            <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
              <div className="text-5xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Soporte Técnico</div>
              <div className="text-gray-600">Asistencia cuando la necesites</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
