import { useState } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material'
import { PhotoLibrary, EmojiEmotions, Send } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useCreatePost } from '../hooks/useApi'

export default function Composer() {
  const { user } = useAuth()
  const createPost = useCreatePost()
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return

    try {
      await createPost.mutateAsync({ content })
      setContent('')
      setIsFocused(false)
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Avatar src={user?.avatar}>{user?.firstName?.[0]}</Avatar>
          <TextField
            fullWidth
            multiline
            maxRows={6}
            placeholder={`What's on your mind, ${user?.firstName}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
              },
            }}
          />
        </Box>

        {isFocused && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <IconButton color="primary">
                  <PhotoLibrary />
                </IconButton>
                <IconButton color="primary">
                  <EmojiEmotions />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                endIcon={<Send />}
                onClick={handleSubmit}
                disabled={!content.trim() || createPost.isPending}
              >
                {createPost.isPending ? 'Posting...' : 'Post'}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}
