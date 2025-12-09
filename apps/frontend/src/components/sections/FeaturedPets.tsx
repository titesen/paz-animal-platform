import React from 'react';
import { Pet } from '../../types';

const pets: Pet[] = [
  {
    id: 1,
    name: "Benito",
    age: "2 años",
    type: "Perro",
    badge: "Urgente",
    imageUrl: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=500&h=500&fit=crop",
    description: "Lleno de energía y amor para dar."
  },
  {
    id: 2,
    name: "Luna",
    age: "4 meses",
    type: "Gato",
    badge: "Cachorro",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&h=600&fit=crop",
    description: "Juguetona y muy cariñosa."
  },
  {
    id: 3,
    name: "Rocco",
    age: "5 años",
    type: "Perro",
    badge: "Especial",
    imageUrl: "https://images.unsplash.com/photo-1600369671738-ffcc846f5be0?w=500&h=400&fit=crop",
    description: "Ideal para compañía tranquila."
  },
  {
    id: 4,
    name: "Molly",
    age: "1 año",
    type: "Perro",
    badge: "Adoptable",
    imageUrl: "https://images.unsplash.com/photo-1615789591457-74a63395c990?w=500&h=500&fit=crop",
    description: "Le encantan los paseos largos."
  },
];

const FeaturedPets: React.FC = () => {
  return (
    <section className="py-20 bg-secondary/30 dark:bg-slate-850">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-2">
              Esperando un <span className="text-primary">hogar</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Estos pequeños están listos para conocerte.
            </p>
          </div>
          <button className="text-primary font-bold hover:underline underline-offset-4">
            Ver todas las mascotas &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
          {pets.map((pet, index) => (
            <div
              key={pet.id}
              className={`group relative rounded-3xl overflow-hidden shadow-md cursor-pointer ${
                index === 1 ? 'lg:col-span-2' : ''
              }`}
            >
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute top-4 left-4 z-20">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
                  pet.badge === 'Urgente' ? 'bg-red-500' :
                  pet.badge === 'Cachorro' ? 'bg-blue-500' : 'bg-primary'
                }`}>
                  {pet.badge}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity"></div>

              <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <h3 className="text-2xl font-heading font-bold mb-1">{pet.name}</h3>
                <p className="text-gray-200 text-sm mb-2">{pet.type} • {pet.age}</p>
                <div className="h-0 group-hover:h-auto overflow-hidden transition-all opacity-0 group-hover:opacity-100">
                  <p className="text-sm text-gray-300">{pet.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPets;
