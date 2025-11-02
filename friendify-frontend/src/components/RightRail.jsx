import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
} from '@mui/material'
import { useFriendSuggestions, useGroups } from '../hooks/useApi'
import { useNavigate } from 'react-router-dom'

export default function RightRail() {
  const navigate = useNavigate()
  const { data: suggestions } = useFriendSuggestions()
  const { data: groups } = useGroups()

  const trendingTopics = [
    { tag: '#WebDevelopment', posts: 12543 },
    { tag: '#React', posts: 8932 },
    { tag: '#JavaScript', posts: 15678 },
    { tag: '#TechNews', posts: 6543 },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Friend Suggestions
          </Typography>
          <List dense>
            {(suggestions ?? []).slice(0, 5).map((suggestion) => (
              <ListItem
                key={suggestion.id}
                disablePadding
                secondaryAction={
                  <Button size="small" variant="contained">
                    Add
                  </Button>
                }
              >
                <ListItemButton onClick={() => navigate(`/profile/${suggestion.user.id}`)}>
                  <ListItemAvatar>
                    <Avatar src={suggestion.user.avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${suggestion.user.firstName} ${suggestion.user.lastName}`}
                    secondary={`${suggestion.mutualFriends} mutual friends`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Trending
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {trendingTopics.map((topic) => (
              <Box key={topic.tag}>
                <Typography variant="body1" fontWeight={600}>
                  {topic.tag}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {topic.posts.toLocaleString()} posts
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Groups
          </Typography>
          <List dense>
            {(groups ?? []).filter(g => g.isMember).slice(0, 3).map((group) => (
              <ListItem key={group.id} disablePadding>
                <ListItemButton onClick={() => navigate(`/groups/${group.id}`)}>
                  <ListItemAvatar>
                    <Avatar src={group.coverPhoto} variant="rounded" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={group.name}
                    secondary={`${group.members.toLocaleString()} members`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}
