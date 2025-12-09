import { Clock, MapPin } from 'lucide-react';
import React from 'react';
import { Event } from '../../types';

const events: Event[] = [
  {
    id: 1,
    title: "Gran Bingo Solidario",
    date: "15 Oct",
    time: "14:00 - 18:00",
    isPaid: true,
    location: "Club Central, Av. Principal 123"
  },
  {
    id: 2,
    title: "Jornada de Vacunación",
    date: "22 Oct",
    time: "09:00 - 13:00",
    isPaid: false,
    location: "Plaza Las Heras"
  }
];

const Events: React.FC = () => {
  return (
    <section id="events" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
            Próximos <span className="text-primary-600">Eventos</span>
          </h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              &larr;
            </button>
            <button className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              &rarr;
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start">

              <div className="flex-shrink-0 w-20 h-20 bg-secondary-100 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center text-primary-600 font-display font-bold leading-none">
                <span className="text-2xl">{event.date.split(' ')[0]}</span>
                <span className="text-sm uppercase">{event.date.split(' ')[1]}</span>
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${event.isPaid ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                    {event.isPaid ? 'Entrada $500' : 'Gratuito'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
                  {event.title}
                </h3>
                <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Clock size={16} /> {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} /> {event.location}
                  </div>
                </div>
              </div>

              <button className="mt-4 sm:mt-0 px-4 py-2 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Info
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
