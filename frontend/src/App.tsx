import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PixelEmoji } from './components/PixelEmoji'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { LoginPage } from './pages/LoginPage'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const MonthPage = lazy(() => import('./pages/MonthPage').then((m) => ({ default: m.MonthPage })))
const WeekPage = lazy(() => import('./pages/WeekPage').then((m) => ({ default: m.WeekPage })))
const AddEventPage = lazy(() => import('./pages/AddEventPage').then((m) => ({ default: m.AddEventPage })))
const InboxPage = lazy(() => import('./pages/InboxPage').then((m) => ({ default: m.InboxPage })))
const BondPage = lazy(() => import('./pages/BondPage').then((m) => ({ default: m.BondPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const SetupPage = lazy(() => import('./pages/SetupPage').then((m) => ({ default: m.SetupPage })))

function Boot() {
  return (
    <div className="boot-page">
      <div className="crt" />
      <PixelEmoji emoji="💘" size="xl" motion="pulse" />
      <p className="blink">LOADING LOVE OS...</p>
    </div>
  )
}

function Gate({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Boot />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/setup" replace />
  return children
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Boot />
  if (user && !profile) return <Navigate to="/setup" replace />
  if (user && profile) return <Navigate to="/" replace />
  return children
}

function SetupGate() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Boot />
  if (!user) return <Navigate to="/login" replace />
  if (profile) return <Navigate to="/" replace />
  return <SetupPage />
}

function AppRoutes() {
  return (
    <Suspense fallback={<Boot />}>
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
    </Suspense>
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
