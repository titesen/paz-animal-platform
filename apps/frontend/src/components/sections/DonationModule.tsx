import { Copy, CreditCard, Package } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui';

const DonationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'money' | 'supplies'>('money');

  return (
    <section id="donate" className="py-24 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">

          {/* Left Side: Info */}
          <div className="md:w-2/5 bg-secondary/50 dark:bg-slate-700/50 p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-4">
              Tu ayuda salva vidas
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              Somos una ONG sin fines de lucro. El 100% de tu donación va directo al cuidado veterinario y alimentación.
            </p>
            <div className="mt-auto">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Transparencia garantizada
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Meta mensual</span>
                <span>75%</span>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Tabs */}
          <div className="md:w-3/5 p-8 md:p-12 bg-white dark:bg-slate-800">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-8">
              <button
                onClick={() => setActiveTab('money')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'money'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <CreditCard size={18} /> Dinero
              </button>
              <button
                onClick={() => setActiveTab('supplies')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'supplies'
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Package size={18} /> Insumos
              </button>
            </div>

            {activeTab === 'money' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {['$1.000', '$2.500', '$5.000'].map((amount) => (
                    <button key={amount} className="border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition-colors">
                      {amount}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Otro monto"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 dark:bg-slate-900 focus:border-primary focus:ring-0 outline-none transition-all dark:text-white"
                  />
                </div>

                <Button variant="accent" size="lg" fullWidth className="text-lg">
                  Donar con Mercado Pago
                </Button>

                <p className="text-xs text-center text-slate-400">
                  Pagos procesados de forma segura.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-secondary/30 dark:bg-slate-700/30 p-4 rounded-xl">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Lo que más necesitamos:</h4>
                  <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 text-sm">
                    <li>Alimento balanceado (Cachorro/Adulto)</li>
                    <li>Mantas y sábanas limpias</li>
                    <li>Pipetas y desparasitarios</li>
                    <li>Gasas y alcohol</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Punto de Acopio</span>
                    <button className="text-primary hover:text-primary-hover p-1" title="Copy Address">
                      <Copy size={16} />
                    </button>
                  </div>
                  <Button variant="primary" fullWidth>
                    Contactar por WhatsApp
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationModule;
