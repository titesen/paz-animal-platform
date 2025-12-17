import { Calendar, Clock, Heart, Users } from 'lucide-react';
import React from 'react';
import { AboutUsSection } from '../components/sections';
import { Button } from '../components/ui';
import { TeamMember } from '../types';

// Mock team data - En producción vendría de la API
const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Facundo González',
    role: 'Fundador/Desarrollador',
    since: '2018',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    linkedIn: '#',
    instagram: '#'
  },
  {
    id: '2',
    name: 'María Rodríguez',
    role: 'Veterinaria',
    since: '2019',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    instagram: '#'
  },
  {
    id: '3',
    name: 'Carlos Méndez',
    role: 'Voluntario',
    since: '2020',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: 'Ana López',
    role: 'Logística',
    since: '2021',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    linkedIn: '#'
  },
  {
    id: '5',
    name: 'Roberto Silva',
    role: 'Voluntario',
    since: '2022',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: 'Laura Martínez',
    role: 'Coordinadora',
    since: '2019',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    instagram: '#'
  }
];

const AboutPage: React.FC = () => {
  const calculateYears = (since: string): number => {
    return new Date().getFullYear() - parseInt(since);
  };

  return (
    <div className="pt-20">
      {/* 1. HERO EMOCIONAL */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-secondary/30 via-white to-primary/5 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full text-primary dark:text-primary-light font-bold text-sm mb-6">
            <Heart size={16} fill="currentColor" />
            <span>Nuestra Historia</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-slate-900 dark:text-white leading-tight max-w-4xl mx-auto mb-6">
            Más que un refugio, <br />
            <span className="text-primary">una familia.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Conocé la historia y las personas detrás de cada rescate en Corrientes.
          </p>
        </div>
      </section>

      {/* 2. MISSION, VISION & VALUES */}
      <AboutUsSection />

      {/* 3. NUESTRA HISTORIA */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Imagen */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop"
                alt="Equipo de Paz Animal trabajando"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8">
                <p className="text-white font-heading font-bold text-2xl">
                  Desde 2018 cambiando vidas
                </p>
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white">
                ¿Cómo empezó todo?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Paz Animal nació en 2018 de la necesidad de dar respuesta a la creciente cantidad de animales en situación de calle en Corrientes. Lo que comenzó como un grupo de voluntarios que se organizaban por redes sociales, hoy es una organización formal con personería jurídica.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A lo largo de estos años, hemos logrado más de <strong className="text-primary">1.200 adopciones responsables</strong>, realizamos jornadas de esterilización mensuales y contamos con una red de más de 50 voluntarios activos que día a día trabajan para mejorar la vida de nuestros rescatados.
              </p>

              {/* Milestones */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 bg-secondary/50 dark:bg-slate-800 p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-2xl text-slate-900 dark:text-white">2018</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Fundación</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-secondary/50 dark:bg-slate-800 p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Heart size={24} />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-2xl text-slate-900 dark:text-white">1.200+</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Adopciones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EL EQUIPO (CORE SECTION) */}
      <section className="py-20 bg-secondary/20 dark:bg-slate-850">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white mb-4">
              Nuestro <span className="text-primary">Equipo</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Las personas que hacen posible cada rescate, cada adopción y cada historia de amor.
            </p>
          </div>

          {/* Grid Responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => {
              const years = calculateYears(member.since);

              return (
                <div
                  key={member.id}
                  className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary"
                >
                  {/* Avatar */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
                      {member.name}
                    </h3>

                    {/* Role Badge */}
                    <span className="inline-block px-3 py-1 rounded-full border-2 border-primary text-primary text-sm font-bold">
                      {member.role}
                    </span>

                    {/* Tenure - REQUISITO CLAVE */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock size={16} className="text-primary" />
                      <span>
                        En la fundación desde <strong className="text-slate-900 dark:text-white">{member.since}</strong>
                        {years > 0 && <span className="text-slate-500"> ({years} {years === 1 ? 'año' : 'años'})</span>}
                      </span>
                    </div>

                    {/* Social Links (Optional) */}
                    {(member.linkedIn || member.instagram) && (
                      <div className="flex gap-3 pt-2">
                        {member.linkedIn && (
                          <a
                            href={member.linkedIn}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            title="LinkedIn"
                          >
                            <span className="text-sm font-bold">in</span>
                          </a>
                        )}
                        {member.instagram && (
                          <a
                            href={member.instagram}
                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                            title="Instagram"
                          >
                            <span className="text-sm font-bold">IG</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TRANSPARENCY / STATS */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl md:text-6xl font-heading font-extrabold mb-2">7+</p>
              <p className="text-white/80 text-sm md:text-base">Años de trayectoria</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-heading font-extrabold mb-2">1.200+</p>
              <p className="text-white/80 text-sm md:text-base">Adopciones realizadas</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-heading font-extrabold mb-2">50+</p>
              <p className="text-white/80 text-sm md:text-base">Voluntarios activos</p>
            </div>
            <div>
              <p className="text-5xl md:text-6xl font-heading font-extrabold mb-2">100%</p>
              <p className="text-white/80 text-sm md:text-base">Transparencia</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-20 bg-gradient-to-br from-secondary via-white to-secondary/30 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Users size={64} className="text-primary mx-auto" />
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-slate-900 dark:text-white">
              ¿Querés ser parte?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Sumate a nuestro equipo de voluntarios y ayudá a transformar vidas. No necesitás experiencia previa, solo amor por los animales y ganas de colaborar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button variant="primary" size="lg">
                Quiero ser Voluntario
              </Button>
              <Button variant="outline" size="lg">
                Conocer más
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
