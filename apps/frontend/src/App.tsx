import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import {
  AboutUsSection,
  DonationModule,
  Events,
  FeaturedPets,
  Hero,
  LostPetsSection,
  Services,
  Sponsors
} from './components/sections'
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
            <Route
              path="/"
              element={
                <main>
                  <Hero />
                  <Services />
                  <FeaturedPets />
                  <DonationModule />
                  <LostPetsSection />
                  <Events />
                  <Sponsors />
                  <AboutUsSection />
                </main>
              }
            />
            {/* Rutas adicionales listas para implementar */}
            {/* <Route path="/adoptar" element={<AdoptPage />} /> */}
            {/* <Route path="/donar" element={<DonatePage />} /> */}
            {/* <Route path="/eventos" element={<EventsPage />} /> */}
            {/* <Route path="/nosotros" element={<AboutPage />} /> */}
          </Routes>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
