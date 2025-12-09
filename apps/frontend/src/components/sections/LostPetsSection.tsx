import { AlertCircle, MapPin, Phone, Siren } from 'lucide-react';
import React from 'react';
import { Pet } from '../../types';

// Mock data for Lost Pets
const lostPets: Pet[] = [
  {
    id: 101,
    name: "Rocky",
    age: "3 años",
    type: "Perro",
    badge: "Perdido hace 2h",
    status: 'LOST',
    lastSeenZone: "Parque Mitre",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&h=500&fit=crop",
    description: "Tiene un collar rojo."
  },
  {
    id: 102,
    name: "Michi",
    age: "2 años",
    type: "Gato",
    badge: "Perdido ayer",
    status: 'LOST',
    lastSeenZone: "Barrio Centro",
    imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop",
    description: "Es muy asustadizo."
  },
  {
    id: 103,
    name: "Lola",
    age: "5 años",
    type: "Perro",
    badge: "Urgente",
    status: 'LOST',
    lastSeenZone: "Costanera Sur",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&h=500&fit=crop",
    description: "Responde a su nombre."
  },
  {
    id: 104,
    name: "Coco",
    age: "1 año",
    type: "Perro",
    badge: "Perdido hoy",
    status: 'LOST',
    lastSeenZone: "Plaza Vera",
    imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&h=500&fit=crop",
    description: "Collar azul con chapita."
  }
];

const LostPetsSection: React.FC = () => {
  const hasLostPets = lostPets.length > 0;

  return (
    <section className="py-20 bg-rose-50/50 dark:bg-slate-900 border-t-4 border-rose-500 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-12">

          {/* Animated Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-sm mb-6 border border-rose-200 dark:border-rose-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            ALERTA COMUNITARIA
          </div>

          <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-4">
            ¿Viste a alguno de <span className="text-rose-600 dark:text-rose-500 decoration-wavy underline decoration-rose-300 underline-offset-4">ellos?</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Estas mascotas están extraviadas. Tu reporte puede ser la clave para que vuelvan a casa.
          </p>
        </div>

        {hasLostPets ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lostPets.map((pet) => (
              <div
                key={pet.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border-2 border-transparent hover:border-rose-400 dark:hover:border-rose-600 transition-all duration-300 hover:shadow-rose-100 dark:hover:shadow-none"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter group-hover:brightness-110"
                  />

                  {/* Overlay Gradient for text readability if needed */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>

                  <div className="absolute top-3 right-3 z-20">
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-rose-600 shadow-md flex items-center gap-2">
                      <Siren size={12} className="animate-pulse" />
                      {pet.badge}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 relative">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white leading-none mb-1">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-slate-500">{pet.type} • {pet.age}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg text-rose-600 dark:text-rose-400">
                      <AlertCircle size={20} />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 mb-6 text-sm bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                    <MapPin size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <span>Última vez en: <strong className="block text-slate-800 dark:text-slate-200">{pet.lastSeenZone}</strong></span>
                  </div>

                  {/* Custom 'Danger/Alert' Button Style specifically for this section */}
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-heading font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2">
                    <Phone size={18} /> Reportar Avistamiento
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-70">
            <div className="w-24 h-24 bg-green-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-500">
              <AlertCircle size={40} />
            </div>
            <p className="text-xl font-heading font-bold text-slate-600 dark:text-slate-300">
              ¡Buenas noticias! No hay mascotas reportadas como perdidas.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LostPetsSection;
