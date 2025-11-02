import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'

import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Friends from './pages/Friends'
import Groups from './pages/Groups'
import Marketplace from './pages/Marketplace'
import Pages from './pages/Pages'
import Saved from './pages/Saved'
import Settings from './pages/Settings'
import Search from './pages/Search'
import Notifications from './pages/Notifications'
import Events from './pages/Events'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/pages" element={<Pages />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/events" element={<Events />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
