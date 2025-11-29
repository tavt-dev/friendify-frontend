import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ProfileEnhancedPage from '../pages/ProfileEnhancedPage'
import ChatPage from '../pages/ChatPage'
import FriendsPage from '../pages/FriendsPage'
import GroupPage from '../pages/GroupPage'
import GroupDetailPage from '../pages/GroupDetailPage'
import SavedPage from '../pages/SavedPage'
import SettingsPage from '../pages/SettingsPage'
import SearchPage from '../pages/SearchPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import VerifyOtpPage from "../pages/VerifyOtpPage";
import OAuthCallbackPage from "../pages/OAuthCallbackPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile/:id" element={<ProfileEnhancedPage />} />
      <Route path="/profile" element={<ProfileEnhancedPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/groups" element={<GroupPage />} />
      <Route path="/groups/:groupId" element={<GroupDetailPage />} />
      <Route path="/saved" element={<SavedPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/verify-user" element={<VerifyOtpPage />} />
      <Route path="/oauth2/redirect" element={<OAuthCallbackPage />} />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
