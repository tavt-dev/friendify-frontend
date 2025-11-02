import { useNavigate, useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Box,
} from '@mui/material'
import {
  Home,
  People,
  Group,
  Store,
  Pages,
  Bookmark,
  Event,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const menuItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: People, label: 'Friends', path: '/friends' },
  { icon: Group, label: 'Groups', path: '/groups' },
  { icon: Store, label: 'Marketplace', path: '/marketplace' },
  { icon: Pages, label: 'Pages', path: '/pages' },
  { icon: Bookmark, label: 'Saved', path: '/saved' },
  { icon: Event, label: 'Events', path: '/events' },
]

export default function LeftNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate(`/profile/${user?.id}`)}>
            <ListItemIcon>
              <Avatar src={user?.avatar} sx={{ width: 36, height: 36 }}>
                {user?.firstName?.[0]}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={`${user?.firstName} ${user?.lastName}`}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>
                <item.icon color={location.pathname === item.path ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
