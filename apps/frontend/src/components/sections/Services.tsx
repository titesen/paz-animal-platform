import { ArrowRight, HeartHandshake, PackageOpen, Users } from 'lucide-react';
import React from 'react';

const Services: React.FC = () => {
  const services = [
    {
      id: 1,
      icon: HeartHandshake,
      title: "Encontrá tu compañero",
      description: "Nuestro proceso de adopción es simple y responsable. Te acompañamos en cada paso para asegurar el match perfecto.",
      action: "Ver requisitos"
    },
    {
      id: 2,
      icon: Users,
      title: "Sumate al equipo",
      description: "El voluntariado es el motor de nuestra fundación. Ayudá en refugios, paseos o eventos solidarios.",
      action: "Ser voluntario"
    },
    {
      id: 3,
      icon: PackageOpen,
      title: "Doná Insumos",
      description: "No solo dinero. Necesitamos alimento, mantas, y medicinas para mantener a nuestros rescatados sanos y felices.",
      action: "Ver lista de necesidades"
    }
  ];

  return (
    <section id="services" className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">
            Cómo puedes <span className="text-primary-600">ayudar hoy</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Existen muchas formas de ser parte de nuestra misión. Cada pequeña acción cuenta para transformar vidas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-t-8 border-primary-600 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-100/50 dark:bg-slate-700/50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

              <div className="bg-secondary-100 dark:bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors relative z-10">
                <service.icon size={32} />
              </div>

              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4 relative z-10">
                {service.title}
              </h3>

              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed relative z-10">
                {service.description}
              </p>

              <a href="#" className="inline-flex items-center gap-2 font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors relative z-10">
                {service.action} <ArrowRight size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
