import { Eye, Heart, Target } from 'lucide-react';
import React from 'react';

const AboutUsSection: React.FC = () => {
  return (
    <section className="py-24 bg-secondary dark:bg-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">
            Nuestra <span className="text-primary">Misión</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 text-center">

          {/* Vision */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-primary shadow-sm mb-6 rotate-3 hover:rotate-0 transition-transform">
              <Eye size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Visión
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Ser el puente de amor y esperanza que conecta a cada animal en situación de calle con un hogar responsable y lleno de cariño.
            </p>
          </div>

          {/* Mision */}
          <div className="flex flex-col items-center relative">
            {/* Visual connector for desktop */}
            <div className="hidden md:block absolute top-8 -left-1/2 w-full h-[2px] bg-primary/10 -z-10"></div>

            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 mb-6 -rotate-3 hover:rotate-0 transition-transform">
              <Target size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Misión
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Proteger, rescatar y facilitar la adopción responsable de animales en Corrientes, promoviendo una cultura de respecto y bienestar animal a través de la educación y la acción comunitaria.
            </p>
          </div>

          {/* Valores */}
          <div className="flex flex-col items-center relative">
            <div className="hidden md:block absolute top-8 -right-1/2 w-full h-[2px] bg-primary/10 -z-10"></div>

            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-primary shadow-sm mb-6 rotate-3 hover:rotate-0 transition-transform">
              <Heart size={32} fill="currentColor" className="text-primary/20" />
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Valores
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Compasión, Responsabilidad, Transparencia, Inclusión y Amor Incondicional.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
