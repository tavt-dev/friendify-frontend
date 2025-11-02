import { useState } from 'react'
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
} from '@mui/material'
import { Send, ThumbUp, ThumbUpOutlined } from '@mui/icons-material'
import { useComments, useCreateComment } from '../hooks/useApi'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from '../utils/dateUtils'

function Comment({ comment }) {
  const [showReply, setShowReply] = useState(false)

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Avatar src={comment.author.avatar} sx={{ width: 32, height: 32 }}>
          {comment.author.firstName?.[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 1.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {comment.author.firstName} {comment.author.lastName}
            </Typography>
            <Typography variant="body2">{comment.content}</Typography>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2, mt: 0.5, px: 1 }}>
            <Button size="small" startIcon={<ThumbUpOutlined />}>
              Like {comment.likes > 0 && `(${comment.likes})`}
            </Button>
            <Button size="small" onClick={() => setShowReply(!showReply)}>
              Reply
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              {formatDistanceToNow(comment.timestamp)}
            </Typography>
          </Box>

          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2, ml: 4 }}>
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default function CommentList({ postId }) {
  const { user } = useAuth()
  const { data: comments, isLoading } = useComments(postId)
  const createComment = useCreateComment()
  const [newComment, setNewComment] = useState('')

  const handleSubmit = async () => {
    if (!newComment.trim()) return

    try {
      await createComment.mutateAsync({ postId, content: newComment })
      setNewComment('')
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  if (isLoading) {
    return <Typography>Loading comments...</Typography>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Avatar src={user?.avatar} sx={{ width: 32, height: 32 }}>
          {user?.firstName?.[0]}
        </Avatar>
        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                size="small"
                onClick={handleSubmit}
                disabled={!newComment.trim() || createComment.isPending}
              >
                <Send />
              </IconButton>
            ),
          }}
        />
      </Box>

      {comments?.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}

      {comments?.length === 0 && (
        <Typography color="text.secondary" textAlign="center" py={3}>
          No comments yet. Be the first to comment!
        </Typography>
      )}
    </Box>
  )
}
