import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
} from '@mui/material'
import { styled, alpha } from '@mui/material/styles'
import {
  Search as SearchIcon,
  Home,
  People,
  Forum,
  Notifications,
  Apps,
  Settings,
  Logout,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useColorMode } from '../contexts/ThemeContext'
import { useNotifications } from '../hooks/useApi'

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}))

export default function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { mode, toggleColorMode } = useColorMode()
  const { data: notificationsData } = useNotifications()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [notifAnchorEl, setNotifAnchorEl] = useState(null)
  const [searchValue, setSearchValue] = useState('')

  const unreadCount = notificationsData?.filter(n => !n.read).length || 0

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleNotificationsOpen = (event) => {
    setNotifAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotifClose = () => {
    setNotifAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
    navigate('/')
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { md: 'none' } }}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', mr: 2 }}
          onClick={() => navigate('/')}
        >
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}>
            F
          </Avatar>
        </Box>

        <SearchBar>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
        </SearchBar>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Home">
            <IconButton color="inherit" onClick={() => navigate('/')}>
              <Home />
            </IconButton>
          </Tooltip>

          <Tooltip title="Friends">
            <IconButton color="inherit" onClick={() => navigate('/friends')}>
              <People />
            </IconButton>
          </Tooltip>

          <Tooltip title="Messages">
            <IconButton color="inherit" onClick={() => navigate('/chat')}>
              <Forum />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotificationsOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={`${mode === 'dark' ? 'Light' : 'Dark'} mode`}>
            <IconButton color="inherit" onClick={toggleColorMode}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={handleProfileMenuOpen} size="small" sx={{ ml: 1 }}>
              <Avatar
                src={user?.avatar}
                alt={user?.firstName}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => navigate(`/profile/${user?.id}`)}>
            <Avatar src={user?.avatar} sx={{ width: 24, height: 24, mr: 2 }} />
            {user?.firstName} {user?.lastName}
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 360, maxHeight: 400 },
          }}
        >
          {notificationsData?.slice(0, 5).map((notif) => (
            <MenuItem
              key={notif.id}
              onClick={() => {
                handleNotifClose()
                navigate(notif.link)
              }}
              sx={{ opacity: notif.read ? 0.6 : 1 }}
            >
              <Avatar src={notif.user.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
              <Box>
                <Box sx={{ fontWeight: notif.read ? 'normal' : 'bold' }}>
                  {notif.user.firstName} {notif.message}
                </Box>
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {new Date(notif.timestamp).toLocaleTimeString()}
                </Box>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => { handleNotifClose(); navigate('/notifications'); }}>
            View all notifications
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
