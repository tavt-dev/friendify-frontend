import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  ImageList,
  ImageListItem,
  Button,
} from '@mui/material'
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
} from '@mui/icons-material'
import { useLikePost } from '../hooks/useApi'
import { formatDistanceToNow } from '../utils/dateUtils'

export default function PostCard({ post, onCommentClick }) {
  const navigate = useNavigate()
  const likeMutation = useLikePost()
  const [showAllImages, setShowAllImages] = useState(false)
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = (e) => {
    e.stopPropagation()
    likeMutation.mutate(post.id)
    setIsLiked(!isLiked)
    setLikesCount(likesCount + (isLiked ? -1 : 1))
  }

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`)
  }

  const displayedImages = showAllImages ? post.images : post.images?.slice(0, 4)

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        avatar={
          <Avatar
            src={post.author.avatar}
            sx={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/profile/${post.author.id}`)
            }}
          >
            {post.author.firstName?.[0]}
          </Avatar>
        }
        action={
          <IconButton>
            <MoreVert />
          </IconButton>
        }
        title={
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/profile/${post.author.id}`)
            }}
          >
            {post.author.firstName} {post.author.lastName}
          </Typography>
        }
        subheader={formatDistanceToNow(post.timestamp)}
      />

      <CardContent sx={{ py: 1 }}>
        <Typography variant="body1">{post.content}</Typography>
      </CardContent>

      {post.images && post.images.length > 0 && (
        <Box>
          <ImageList
            cols={post.images.length === 1 ? 1 : 2}
            gap={2}
            sx={{ margin: 0, cursor: 'pointer' }}
            onClick={handleCardClick}
          >
            {displayedImages.map((image) => (
              <ImageListItem key={image}>
                <img
                  src={image}
                  alt="Post image"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: post.images.length === 1 ? 'auto' : '200px',
                    objectFit: 'cover',
                  }}
                />
              </ImageListItem>
            ))}
          </ImageList>
          {post.images.length > 4 && !showAllImages && (
            <Button fullWidth onClick={() => setShowAllImages(true)}>
              Show all {post.images.length} images
            </Button>
          )}
        </Box>
      )}

      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {post.shares} {post.shares === 1 ? 'share' : 'shares'}
          </Typography>
        </Box>
      </Box>

      <CardActions disableSpacing>
        <Button
          startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
          color={isLiked ? 'primary' : 'inherit'}
          onClick={handleLike}
          fullWidth
        >
          Like
        </Button>
        <Button
          startIcon={<Comment />}
          onClick={() => onCommentClick?.(post.id)}
          fullWidth
        >
          Comment
        </Button>
        <Button startIcon={<Share />} fullWidth>
          Share
        </Button>
      </CardActions>
    </Card>
  )
}
