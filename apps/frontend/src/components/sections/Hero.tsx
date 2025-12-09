import { Heart } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

const Hero: React.FC = () => {
  return (
    <section id="hero" className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-white to-secondary-100 dark:from-slate-900 dark:to-slate-850 overflow-hidden relative">
      {/* Decorative Circles */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Text Content */}
          <div className="order-2 md:order-1 space-y-8">
            <div className="inline-flex items-center gap-2 bg-secondary-100/50 dark:bg-slate-800/50 px-4 py-2 rounded-full text-primary-700 dark:text-primary-400 font-bold text-sm">
              <Heart size={16} fill="currentColor" />
              <span>Más de 500 animales rescatados este año</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 dark:text-white leading-[1.1]">
              Cambia una vida, <span className="text-primary-600 block mt-2">adopta amor.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
              En Paz Animal, conectamos corazones. Dale una segunda oportunidad a un amigo fiel y descubre el amor incondicional que solo ellos pueden dar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="primary" size="lg" className="group">
                Quiero Adoptar
              </Button>
              <Button variant="accent" size="lg">
                Donar Ahora
              </Button>
            </div>
          </div>

          {/* Image Content */}
          <div className="order-1 md:order-2 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-primary-600/20 border-8 border-white dark:border-slate-800 rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://picsum.photos/id/237/800/800"
                alt="Perro feliz adoptado"
                className="w-full h-auto object-cover aspect-[4/4]"
              />
            </div>
            {/* Background Accent Card */}
            <div className="absolute top-4 -right-4 w-full h-full bg-primary-600 rounded-3xl -z-10 -rotate-2"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
