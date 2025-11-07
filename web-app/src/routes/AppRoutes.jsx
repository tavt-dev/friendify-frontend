import { Route, Routes, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Profile from '../pages/ProfileEnhanced'
import ChatPage from '../pages/ChatPage'
import FriendsPage from '../pages/FriendsPage'
import GroupPage from '../pages/GroupPage'
import Marketplace from '../pages/Marketplace'
import Pages from '../pages/Pages'
import Saved from '../pages/Saved'
import Settings from '../pages/Settings'
import SearchPage from '../pages/SearchPage'
import Login from '../pages/Login'
import Register from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import VerifyOtpPage from "../pages/VerifyOtpPage";

const AppRoutes = () => {
  return (
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
      <Route path="/verify-user" element={<VerifyOtpPage />} />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
