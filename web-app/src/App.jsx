import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'

import Home from './pages/Home'
import Profile from './pages/Profile'
import ChatPage from './pages/ChatPage'
import FriendsPage from './pages/FriendsPage'
import GroupPage from './pages/GroupPage'
import Marketplace from './pages/Marketplace'
import Pages from './pages/Pages'
import Saved from './pages/Saved'
import Settings from './pages/Settings'
import SearchPage from './pages/SearchPage'
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
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/groups" element={<GroupPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/pages" element={<Pages />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/search" element={<SearchPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
