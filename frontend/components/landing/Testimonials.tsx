export default function Testimonials() {
  const testimonials = [
    {
      quote: "DoctorCRM ha transformado completamente la forma en que gestionamos nuestra clínica. Hemos reducido las ausencias de pacientes en un 40% gracias a los recordatorios automáticos.",
      author: "Dra. María González",
      role: "Directora Médica",
      clinic: "Clínica San Rafael",
      avatar: "MG",
    },
    {
      quote: "La interfaz es intuitiva y el equipo la adoptó en cuestión de días. Ahora tenemos más tiempo para nuestros pacientes y menos estrés administrativo.",
      author: "Dr. Carlos Mendoza",
      role: "Médico General",
      clinic: "Centro Médico Vida",
      avatar: "CM",
    },
    {
      quote: "El sistema de roles y permisos nos permite gestionar un equipo de 20 personas de forma eficiente. Cada quien ve solo lo que necesita ver.",
      author: "Dr. Roberto Silva",
      role: "Cardiólogo",
      clinic: "Hospital del Corazón",
      avatar: "RS",
    },
    {
      quote: "La atención al cliente es excepcional. Cualquier duda se resuelve rápidamente. La inversión se pagó sola en los primeros 3 meses.",
      author: "Dra. Ana Torres",
      role: "Pediatra",
      clinic: "Clínica Infantil Sonrisas",
      avatar: "AT",
    },
    {
      quote: "Los reportes me dan una visión clara del rendimiento de la clínica. Puedo tomar decisiones basadas en datos reales, no en intuiciones.",
      author: "Dr. Luis Ramírez",
      role: "Director General",
      clinic: "Grupo Médico Integral",
      avatar: "LR",
    },
    {
      quote: "Migrar desde nuestro sistema antiguo fue más fácil de lo que esperaba. El equipo de DoctorCRM nos ayudó en cada paso del proceso.",
      author: "Dra. Patricia Herrera",
      role: "Ginecóloga",
      clinic: "Centro de Salud Femenina",
      avatar: "PH",
    },
  ];

  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold inline-block mb-4">
            Testimonios
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Confían en nosotros cientos de profesionales
          </h2>
          <p className="text-xl text-gray-600">
            Descubre cómo DoctorCRM está ayudando a médicos y clínicas a mejorar 
            su práctica diaria.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-10 h-10 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-gray-500">{testimonial.clinic}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-8 font-medium">
            Certificaciones y Cumplimiento
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
              <span className="font-bold text-gray-900">HIPAA Compliant</span>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
              <span className="font-bold text-gray-900">ISO 27001</span>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
              <span className="font-bold text-gray-900">SOC 2 Type II</span>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
              <span className="font-bold text-gray-900">GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
