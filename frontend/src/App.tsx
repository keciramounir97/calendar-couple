import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PixelEmoji } from './components/PixelEmoji'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { AddEventPage } from './pages/AddEventPage'
import { BondPage } from './pages/BondPage'
import { HomePage } from './pages/HomePage'
import { InboxPage } from './pages/InboxPage'
import { LoginPage } from './pages/LoginPage'
import { MonthPage } from './pages/MonthPage'
import { SettingsPage } from './pages/SettingsPage'
import { SetupPage } from './pages/SetupPage'
import { WeekPage } from './pages/WeekPage'
import type { ReactNode } from 'react'

function Gate({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="boot-page">
        <div className="crt" />
        <PixelEmoji emoji="💘" size="xl" motion="pulse" />
        <p className="blink">LOADING LOVE OS...</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/setup" replace />
  return children
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="boot-page">
        <div className="crt" />
        <PixelEmoji emoji="💘" size="xl" motion="pulse" />
        <p className="blink">LOADING LOVE OS...</p>
      </div>
    )
  }
  if (user && !profile) return <Navigate to="/setup" replace />
  if (user && profile) return <Navigate to="/" replace />
  return children
}

function SetupGate() {
  const { user, profile, loading } = useAuth()
  if (loading) {
    return (
      <div className="boot-page">
        <div className="crt" />
        <PixelEmoji emoji="💘" size="xl" motion="pulse" />
        <p className="blink">LOADING LOVE OS...</p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (profile) return <Navigate to="/" replace />
  return <SetupPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route path="/setup" element={<SetupGate />} />
      <Route
        element={
          <Gate>
            <DataProvider>
              <Layout />
            </DataProvider>
          </Gate>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/month" element={<MonthPage />} />
        <Route path="/week" element={<WeekPage />} />
        <Route path="/add" element={<AddEventPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/bond" element={<BondPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
