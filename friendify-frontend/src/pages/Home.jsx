import { useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { Article } from '@mui/icons-material'
import { useInView } from 'react-intersection-observer'
import Layout from '../components/Layout'
import Composer from '../components/Composer'
import PostCard from '../components/PostCard'
import PostSkeleton from '../components/PostSkeleton'
import EmptyState from '../components/EmptyState'
import { useInfinitePosts } from '../hooks/useApi'

export default function Home() {
  const { ref, inView } = useInView()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfinitePosts()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap(page => page.posts) || []

  return (
    <Layout>
      <Composer />

      {isLoading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}

      {!isLoading && posts.length === 0 && (
        <EmptyState
          icon={Article}
          title="No posts yet"
          description="Start sharing your thoughts with the world!"
        />
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <Box ref={ref} sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          {isFetchingNextPage && (
            <CircularProgress 
              size={32} 
              thickness={3.5}
              sx={{ color: 'primary.main' }}
            />
          )}
        </Box>
      )}

      {!hasNextPage && posts.length > 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            You've reached the end
          </Typography>
        </Box>
      )}
    </Layout>
  )
}
