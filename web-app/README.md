# Social Media Web Application

A modern, feature-rich social media application built with React, Vite, and Material-UI. This is a **mock-only demonstration** that provides a complete social networking experience with a clean, responsive design that works seamlessly across all devices.

## 🎯 Overview

This application is a **fully functional frontend demo** that uses **mock data** instead of real API calls. It's perfect for:
- UI/UX demonstrations
- Learning React and Material-UI
- Prototyping and design exploration
- Frontend development practice

**Note**: All data is stored in localStorage and resets when cleared. No backend or API is required to run this application.

## 🛠️ Technology Stack

- **React 18.3.1** - UI library
- **Vite 5.1.3** - Build tool and dev server
- **Material-UI (MUI) 5.15** - Component library
  - `@mui/material` - Core components
  - `@mui/icons-material` - Icon set
  - `@mui/x-date-pickers` - Date picker
- **Emotion** - CSS-in-JS styling
- **React Router DOM 6.23** - Client-side routing
- **Day.js 1.11** - Date formatting

## 📦 Project Structure

```
web-app/
├── public/
│   ├── logo/
│   │   └── logo.png
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── CreatePostComposer.jsx
│   │   ├── Header.jsx
│   │   ├── LoginLeftPanel.jsx
│   │   ├── MediaUpload.jsx
│   │   ├── NewChatPopover.jsx
│   │   ├── Post.jsx
│   │   ├── RightSidebar.jsx
│   │   ├── SendOtpButton.jsx
│   │   └── SideMenu.jsx
│   ├── pages/
│   │   ├── ChatPage.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── FriendsPage.jsx
│   │   ├── GroupDetail.jsx
│   │   ├── GroupPage.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Marketplace.jsx
│   │   ├── Pages.jsx
│   │   ├── Profile.jsx
│   │   ├── ProfileEnhanced.jsx
│   │   ├── Register.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Saved.jsx
│   │   ├── Scene.jsx (layout wrapper)
│   │   ├── SearchPage.jsx
│   │   ├── Settings.jsx
│   │   └── VerifyOtpPage.jsx
│   ├── services/
│   │   ├── authenticationService.js (mock-only)
│   │   ├── localStorageService.js
│   │   ├── postService.js (mock-only)
│   │   └── userService.js (mock-only)
│   ├── utils/
│   │   ├── mockAuth.js
│   │   └── mockData.js
│   ├── App.jsx
│   ├── main.jsx (Vite entry point)
│   └── index.css
├── index.html
├── package.json
├── vite.config.mjs
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to:
```
http://localhost:5173
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 🎯 Features

### Authentication (Mock)
- Login with any username/password combination
- Register new accounts (stored in localStorage)
- Password reset flow (UI only)
- Email verification (UI only)
- Persistent sessions via localStorage

### Social Features
- **Posts**: Create, edit, delete posts with rich text
- **Profile**: View and edit user profiles with avatar upload
- **Friends**: Friend management system
- **Groups**: Group discovery and membership
- **Chat**: Messaging interface (mock conversations)
- **Marketplace**: Product listings
- **Pages**: Discover and follow pages
- **Saved Items**: Save and organize content

### UI Features
- **Dark/Light Mode**: Toggle with persistent preference
- **Responsive Design**: Mobile, tablet, and desktop layouts
- **Real-time Updates**: Optimistic UI updates
- **Search**: Smart search with suggestions
- **Notifications**: Success/error notifications via snackbars

## 🎨 Design Highlights

### Color Scheme
- **Primary Gradient**: Purple to Blue (`#667eea` to `#764ba2`)
- **Neutral Colors**: Modern gray scale with dark mode support
- **Clean Typography**: System fonts for optimal readability

### Responsive Breakpoints
- **Mobile**: < 600px (single column)
- **Tablet**: 600px - 900px (two columns)
- **Desktop**: > 900px (three columns with sidebar)
- **Large Desktop**: > 1200px (full layout with right sidebar)

## 🔧 Key Components

### Layout Components
- `App.jsx` - Root component with theming and routing
- `Scene.jsx` - Page layout wrapper with header and sidebars

### Feature Components
- `Header.jsx` - Top navigation with search and user menu
- `SideMenu.jsx` - Left navigation sidebar
- `RightSidebar.jsx` - Friends and trending content
- `Post.jsx` - Post card with interactions
- `CreatePostComposer.jsx` - New post creation

### Page Components
All pages are self-contained and use the Scene wrapper for consistent layout.

## 💾 Mock Data & Services

All services in `src/services/` return Promises that simulate API calls with delays:

### authenticationService.js
- `logIn(username, password)` - Mock login (any credentials work)
- `logOut()` - Clear session
- `isAuthenticated()` - Check auth status
- `registerAccount({username, email, password})` - Mock registration
- `resetPassword(token, newPassword)` - Mock password reset
- `verifyUser({email, otpCode})` - Mock OTP verification

### userService.js
- `getMyInfo()` - Get current user profile
- `updateProfile(profileData)` - Update profile
- `uploadAvatar(formData)` - Upload avatar (creates blob URL)
- `search(keyword)` - Search users

### postService.js
- `getMyPosts(page)` - Get paginated posts
- `createPost(content)` - Create new post

All data persists in localStorage and includes:
- User sessions (tokens)
- User profiles
- Posts (with CRUD operations)

## 🎨 Customization

### Theme
Edit the theme in `src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    mode, // 'light' or 'dark'
    primary: {
      main: '#667eea',
    },
    background: {
      default: mode === "dark" ? "#0b0c10" : "#f7f7fb",
      paper: mode === "dark" ? "#111319" : "#ffffff",
    },
  },
  shape: { borderRadius: 12 },
});
```

### Mock Data
Edit mock data in:
- `src/utils/mockData.js` - Posts, friends, groups
- `src/services/*.js` - Service responses and user data

### Logo
Replace `public/logo/logo.png` with your logo.

## 🧩 Best Practices Implemented

### Code Organization
- ✅ Single entry point (`main.jsx`)
- ✅ Centralized routing in `App.jsx`
- ✅ Reusable components in `components/`
- ✅ Page components in `pages/`
- ✅ Service layer abstraction
- ✅ No duplicate files

### Performance
- ✅ Lazy loading potential (can be added)
- ✅ Optimistic UI updates
- ✅ Memoization where appropriate
- ✅ Efficient re-renders

### Developer Experience
- ✅ Clean project structure
- ✅ Consistent naming conventions
- ✅ Vite for fast HMR
- ✅ No unnecessary dependencies
- ✅ Mock services with Promise-based API

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast mode compatible
- Screen reader friendly

## 🔐 Mock Security Features

The app demonstrates security best practices:
- Password visibility toggle
- Form validation
- Input sanitization
- Session management patterns
- Protected routes

**Note**: These are UI demonstrations only. Real security requires backend implementation.

## 📱 Responsive Behavior

### Mobile (< 600px)
- Collapsed sidebars
- Single column layout
- Touch-optimized controls

### Tablet (600px - 900px)
- Collapsible left sidebar
- Two-column layout

### Desktop (> 900px)
- Fixed sidebars
- Three-column layout
- Full feature set

## 🎯 Demo Credentials

Since this is a mock-only app, you can login with **any credentials**:
- Username: `demo` (or anything)
- Password: `password` (or anything)

Or create a new account - all data is stored locally.

## 🚫 What's NOT Included

This is a frontend-only demo. The following are **not** implemented:
- ❌ Real API backend
- ❌ Database
- ❌ Real authentication
- ❌ File uploads to server
- ❌ Real-time notifications
- ❌ Email sending
- ❌ Payment processing

## 🎯 Future Enhancements

Possible additions for learning/practice:
- [ ] Add backend API (Node.js/Express)
- [ ] Connect to real database
- [ ] Implement real authentication (JWT/OAuth)
- [ ] Add WebSocket for real-time features
- [ ] Progressive Web App (PWA) features
- [ ] End-to-end testing
- [ ] Performance monitoring

## 📄 License

This project is for demonstration purposes.

---

**Built with ❤️ using React + Vite + Material-UI**

*A clean, modern, mock-only social media demo*
