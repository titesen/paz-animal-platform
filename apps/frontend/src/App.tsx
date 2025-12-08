import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Plataforma Paz Animal
                  </h1>
                  <p className="text-gray-600 mb-8">
                    Sistema de gestión en desarrollo
                  </p>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-500">
                      ✅ Monorepo configurado
                    </div>
                    <div className="text-sm text-gray-500">
                      ✅ Backend API listo
                    </div>
                    <div className="text-sm text-gray-500">
                      ✅ Frontend React + Vite
                    </div>
                    <div className="text-sm text-gray-500">
                      ✅ PostgreSQL + pgAdmin
                    </div>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
