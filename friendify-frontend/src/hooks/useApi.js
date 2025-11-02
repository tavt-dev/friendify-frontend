import { useState, useEffect } from 'react'
import {
  currentUser,
  posts,
  comments,
  conversations,
  messages,
  users,
  friendRequests,
  friendSuggestions,
  groups,
  marketplaceItems,
  notifications,
  pages,
  savedItems,
  events,
} from '../data/constants'

let postsState = [...posts]
let commentsState = [...comments]
let messagesState = { ...messages }

function simulateAsync(data, delay = 100) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay)
  })
}

export function usePosts(page = 1) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const limit = 10
    const start = (page - 1) * limit
    const end = start + limit
    
    simulateAsync({
      posts: postsState.slice(start, end),
      hasMore: end < postsState.length,
      total: postsState.length,
    }).then((result) => {
      setData(result)
      setIsLoading(false)
    })
  }, [page])

  return { data, isLoading }
}

export function useInfinitePosts() {
  const [data, setData] = useState({ pages: [], pageParams: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)

  useEffect(() => {
    const limit = 10
    const firstPage = {
      posts: postsState.slice(0, limit),
      hasMore: limit < postsState.length,
    }
    
    simulateAsync({ pages: [firstPage], pageParams: [1] }).then((result) => {
      setData(result)
      setHasNextPage(firstPage.hasMore)
      setIsLoading(false)
    })
  }, [])

  const fetchNextPage = () => {
    if (!hasNextPage || isFetchingNextPage) return

    setIsFetchingNextPage(true)
    const currentPage = data.pages.length + 1
    const limit = 10
    const start = (currentPage - 1) * limit
    const end = start + limit

    simulateAsync({
      posts: postsState.slice(start, end),
      hasMore: end < postsState.length,
    }).then((newPage) => {
      setData((prev) => ({
        pages: [...prev.pages, newPage],
        pageParams: [...prev.pageParams, currentPage],
      }))
      setHasNextPage(newPage.hasMore)
      setIsFetchingNextPage(false)
    })
  }

  return { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage }
}

export function usePost(id) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const post = postsState.find((p) => p.id === id)
    simulateAsync(post).then((result) => {
      setData(result)
      setIsLoading(false)
    })
  }, [id])

  return { data, isLoading }
}

export function useCreatePost() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (postData) => {
    setIsPending(true)
    const newPost = {
      id: `post-${Date.now()}`,
      author: currentUser,
      content: postData.content,
      images: postData.images || [],
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date().toISOString(),
      isLiked: false,
    }

    await simulateAsync(null, 300)
    postsState = [newPost, ...postsState]
    setIsPending(false)
    window.location.reload()
    return newPost
  }

  return { mutateAsync, isPending }
}

export function useLikePost() {
  const mutate = (postId) => {
    const post = postsState.find((p) => p.id === postId)
    if (post) {
      post.isLiked = !post.isLiked
      post.likes += post.isLiked ? 1 : -1
    }
  }

  return { mutate }
}

export function useComments(postId) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!postId) return

    const postComments = commentsState.filter((c) => c.postId === postId)
    simulateAsync(postComments).then((result) => {
      setData(result)
      setIsLoading(false)
    })
  }, [postId])

  return { data, isLoading }
}

export function useCreateComment() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ postId, content }) => {
    setIsPending(true)
    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      author: currentUser,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      replies: [],
    }

    await simulateAsync(null, 200)
    commentsState = [...commentsState, newComment]

    const post = postsState.find((p) => p.id === postId)
    if (post) {
      post.comments += 1
    }

    setIsPending(false)
    window.location.reload()
    return newComment
  }

  return { mutateAsync, isPending }
}

export function useUser(id) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    let user
    if (id === '1' || id === currentUser.id) {
      user = currentUser
    } else {
      user = users.find((u) => u.id === id) || currentUser
    }
    
    simulateAsync(user).then((result) => {
      setData(result)
      setIsLoading(false)
    })
  }, [id])

  return { data, isLoading }
}

export function useUpdateUser() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ id, data }) => {
    setIsPending(true)
    await simulateAsync(null, 300)
    Object.assign(currentUser, data)
    setIsPending(false)
    return currentUser
  }

  return { mutateAsync, isPending }
}

export function useConversations() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(conversations).then(setData)
  }, [])

  return { data }
}

export function useMessages(conversationId) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!conversationId) return

    const convMessages = messagesState[conversationId] || []
    simulateAsync(convMessages).then(setData)
  }, [conversationId])

  return { data }
}

export function useSendMessage() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ conversationId, content }) => {
    setIsPending(true)
    
    if (!messagesState[conversationId]) {
      messagesState[conversationId] = []
    }
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    }
    
    await simulateAsync(null, 200)
    messagesState[conversationId] = [...messagesState[conversationId], newMessage]
    setIsPending(false)
    return newMessage
  }

  return { mutateAsync, isPending }
}

export function useFriends() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(users).then(setData)
  }, [])

  return { data }
}

export function useFriendRequests() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(friendRequests).then(setData)
  }, [])

  return { data }
}

export function useFriendSuggestions() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(friendSuggestions).then(setData)
  }, [])

  return { data }
}

export function useGroups() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(groups).then(setData)
  }, [])

  return { data }
}

export function useMarketplace() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(marketplaceItems).then(setData)
  }, [])

  return { data }
}

export function useNotifications() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(notifications).then(setData)
  }, [])

  return { data }
}

export function usePages() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(pages).then(setData)
  }, [])

  return { data }
}

export function useSaved() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(savedItems).then(setData)
  }, [])

  return { data }
}

export function useSearch(query) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!query || query.length === 0) return

    const results = {
      users: users.filter(
        (u) =>
          u.firstName.toLowerCase().includes(query.toLowerCase()) ||
          u.lastName.toLowerCase().includes(query.toLowerCase())
      ),
      posts: postsState
        .filter((p) => p.content.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5),
      groups: groups.filter((g) =>
        g.name.toLowerCase().includes(query.toLowerCase())
      ),
      pages: pages.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    }

    simulateAsync(results).then(setData)
  }, [query])

  return { data, isLoading: false }
}

export function useEvents() {
  const [data, setData] = useState(null)

  useEffect(() => {
    simulateAsync(events).then(setData)
  }, [])

  return { data }
}
