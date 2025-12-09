import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Footer, Header } from './components/ui'
import { useDarkMode } from './hooks/useDarkMode'

const queryClient = new QueryClient()

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode()

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen">
          <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Routes>
            <Route path="/" element={
              <main className="pt-20">
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">
                      Plataforma Paz Animal
                    </h1>
                    <p className="text-muted-foreground mb-8">
                      Sistema de gestión en desarrollo
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        ✅ Monorepo configurado
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ✅ Backend API listo
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ✅ Frontend React + Vite
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ✅ PostgreSQL + pgAdmin
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ✅ Componentes UI Base
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            } />
          </Routes>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
