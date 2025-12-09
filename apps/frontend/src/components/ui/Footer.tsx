import { Facebook, Instagram, PawPrint, Twitter } from 'lucide-react';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <PawPrint className="text-primary-500" size={24} fill="currentColor" />
              <span className="text-2xl font-display font-bold">Paz Animal</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Dedicados a rescatar, rehabilitar y reubicar animales en situación de calle. Tu apoyo hace posible nuestra misión.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Adopciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Voluntariado
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Eventos
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">
                  Transparencia Financiera
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6">Contacto</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>contacto@pazanimal.org</li>
              <li>+54 11 1234 5678</li>
              <li>Av. Siempre Viva 742</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Paz Animal Fundación. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Hecho con ❤️ para los animales</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
