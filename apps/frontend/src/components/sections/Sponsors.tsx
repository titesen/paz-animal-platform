import React from 'react';

const Sponsors: React.FC = () => {
  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Nuestros Aliados</p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
          {/* Placeholder Logos using Text or generic shapes for Demo */}
          {['Royal Canin', 'Mercado Pago', 'Municipalidad', 'PetShop'].map((name, i) => (
            <div key={i} className="group cursor-pointer transition-all duration-300">
              <span className="text-xl md:text-2xl font-display font-bold text-slate-400 grayscale group-hover:grayscale-0 group-hover:text-primary transition-all duration-500">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
