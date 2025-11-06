# Mock Data & API Configuration Setup

## Overview

This application is configured to use **hardcoded mock data for all read operations** (GET requests) and **real API calls for write operations** (POST/PUT/DELETE) that save data to localStorage.

## Configuration

### API Configuration File
Location: `src/config/apiConfig.js`

```javascript
export const USE_MOCK_DATA_FOR_READS = true; // Set to false to use real API for reads
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
```

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_USE_MOCK_DATA=true
```

## How It Works

### Read Operations (GET)
When `USE_MOCK_DATA_FOR_READS = true`:
- All GET requests return mock data from `src/utils/comprehensiveMockData.js`
- No network requests are made
- Perfect for testing and development

### Write Operations (POST/PUT/DELETE)
All write operations:
1. Save data to localStorage immediately (optimistic updates)
2. Attempt to call the real API
3. Update localStorage with API response if successful
4. Fall back to mock implementation if API fails

## Mock Data Structure

### Available Mock Data
Location: `src/utils/comprehensiveMockData.js`

- **Users**: Complete user profiles with all fields
- **Posts**: Feed posts with media, likes, comments
- **Friends**: Friend requests, suggestions, and friends list
- **Groups**: Groups with members and posts
- **Conversations**: Chat conversations and messages
- **Marketplace**: Marketplace items with categories
- **Pages**: Pages with followers
- **Saved Items**: Saved articles, videos, links, images
- **Settings**: User preferences and settings

### Adding New Mock Data

Edit `src/utils/comprehensiveMockData.js`:

```javascript
export const mockNewFeature = [
  {
    id: 1,
    name: 'Example',
    // ... other fields
  },
];
```

## Services

All services follow the same pattern:

### Example: Friend Service
```javascript
import { USE_MOCK_DATA_FOR_READS } from '../config/apiConfig';

export const getFriendRequests = async () => {
  if (USE_MOCK_DATA_FOR_READS) {
    // Return mock data
    return { data: { result: mockFriendRequests }, status: 200 };
  }
  
  // Call real API
  const response = await fetch(apiUrl);
  return { data: await response.json(), status: response.status };
};

export const acceptFriendRequest = async (id) => {
  // Save to localStorage first
  localStorage.setItem(`friend_accepted_${id}`, Date.now());
  
  // Call real API
  const response = await fetch(apiUrl, { method: 'POST' });
  return { data: await response.json(), status: response.status };
};
```

## Available Services

### Authentication (`authenticationService.js`)
- `logIn(username, password)` - Login (saves token to localStorage)
- `logOut()` - Logout (clears localStorage)
- `registerAccount(data)` - Register new account
- `requestPasswordReset(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password
- `verifyUser({ email, otpCode })` - Verify user email

### User (`userService.js`)
- `getMyInfo()` - Get current user info (MOCK for reads)
- `updateProfile(data)` - Update profile (REAL API + localStorage)
- `uploadAvatar(formData)` - Upload avatar (REAL API + localStorage)
- `search(keyword)` - Search users (MOCK for reads)

### Post (`postService.js`)
- `getMyPosts(page)` - Get user posts (MOCK for reads)
- `createPost(postData)` - Create new post (REAL API + localStorage)

### Post Interactions (`postInteractionService.js`)
- `likePost(postId)` - Like a post (REAL API + localStorage)
- `unlikePost(postId)` - Unlike a post (REAL API + localStorage)
- `commentOnPost(postId, text)` - Add comment (REAL API + localStorage)
- `sharePost(postId, data)` - Share post (REAL API + localStorage)
- `updatePost(postId, data)` - Update post (REAL API + localStorage)
- `deletePost(postId)` - Delete post (REAL API + localStorage)

### Friends (`friendService.js`)
- `getFriendRequests()` - Get friend requests (MOCK for reads)
- `getFriendSuggestions()` - Get suggestions (MOCK for reads)
- `getAllFriends()` - Get friends list (MOCK for reads)
- `acceptFriendRequest(id)` - Accept request (REAL API + localStorage)
- `declineFriendRequest(id)` - Decline request (REAL API + localStorage)
- `addFriend(userId)` - Send friend request (REAL API + localStorage)
- `removeFriend(friendId)` - Remove friend (REAL API + localStorage)

### Groups (`groupService.js`)
- `getMyGroups()` - Get user's groups (MOCK for reads)
- `getSuggestedGroups()` - Get suggestions (MOCK for reads)
- `getGroupDetail(id)` - Get group details (MOCK for reads)
- `getGroupMembers(id)` - Get group members (MOCK for reads)
- `getGroupPosts(id)` - Get group posts (MOCK for reads)
- `createGroup(data)` - Create new group (REAL API + localStorage)
- `joinGroup(id)` - Join group (REAL API + localStorage)
- `leaveGroup(id)` - Leave group (REAL API + localStorage)
- `createGroupPost(groupId, data)` - Create group post (REAL API + localStorage)

### Chat (`chatService.js`)
- `getConversations()` - Get conversations (MOCK for reads)
- `getMessages(conversationId)` - Get messages (MOCK for reads)
- `sendMessage(conversationId, text)` - Send message (REAL API + localStorage)
- `createConversation(data)` - Create conversation (REAL API + localStorage)

### Marketplace (`marketplaceService.js`)
- `getMarketplaceItems(filters)` - Get items (MOCK for reads)
- `getMarketplaceCategories()` - Get categories (MOCK for reads)

### Pages (`pageService.js`)
- `getPages()` - Get pages (MOCK for reads)
- `getSuggestedPages()` - Get suggestions (MOCK for reads)
- `followPage(id)` - Follow page (REAL API + localStorage)
- `unfollowPage(id)` - Unfollow page (REAL API + localStorage)

### Saved Items (`savedService.js`)
- `getSavedItems(filters)` - Get saved items (MOCK for reads)
- `addSavedItem(data)` - Save item (REAL API + localStorage)
- `removeSavedItem(id)` - Remove saved item (REAL API + localStorage)

### Settings (`settingsService.js`)
- `getSettings()` - Get settings (MOCK for reads)
- `updateSettings(section, data)` - Update settings (REAL API + localStorage)
- `changePassword(current, new)` - Change password (REAL API + localStorage)
- `deleteAccount()` - Delete account (REAL API + localStorage)

## Testing Pages

All pages can now be tested with mock data:

1. **Home Page** - Posts feed with pagination
2. **Profile** - User profile with posts, friends, photos
3. **Friends Page** - Friend requests, suggestions, friends list
4. **Groups** - My groups, suggested groups, group details
5. **Chat** - Conversations and messages
6. **Marketplace** - Items with categories and filters
7. **Pages** - Pages list with follow/unfollow
8. **Saved** - Saved items with filtering
9. **Search** - Search users, posts, groups
10. **Settings** - All settings sections

## Switching to Real API

To use real API for all operations:

1. Update `src/config/apiConfig.js`:
```javascript
export const USE_MOCK_DATA_FOR_READS = false;
```

2. Set your API base URL in `.env`:
```
VITE_API_BASE_URL=https://your-real-api.com
```

3. Ensure your API endpoints match those defined in `apiConfig.js`

## LocalStorage Keys Used

The application uses these localStorage keys for data persistence:

- `accessToken` - JWT authentication token
- `mock_user` - Current user data
- `user_posts` - User's posts
- `liked_posts` - IDs of liked posts
- `shared_posts` - Shared post records
- `friend_requests` - Friend requests
- `friends_list` - Friends list
- `user_groups` - User's groups
- `chat_conversations` - Chat conversations
- `chat_messages_{id}` - Messages for specific conversation
- `saved_items` - Saved items
- `user_settings` - User settings
- `page_followed_{id}` - Followed page flags
- `group_joined_{id}` - Joined group flags
- Various verification and state flags

## API Endpoints Reference

All API endpoints are defined in `src/config/apiConfig.js` under `API_ENDPOINTS`.

Example structure:
```javascript
{
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    // ...
  },
  USER: {
    ME: '/user/me',
    UPDATE_PROFILE: '/user/profile',
    // ...
  },
  // ... more endpoints
}
```

## Utilities

### API Helper (`src/utils/apiHelper.js`)
- `handleApiError(error)` - Error handling
- `makeAuthenticatedRequest(url, options)` - Authenticated requests
- `withFallback(apiCall, fallbackData, useMock)` - Fallback pattern
- `saveToLocalStorage(key, data)` - Save to localStorage
- `getFromLocalStorage(key, default)` - Get from localStorage
- `removeFromLocalStorage(key)` - Remove from localStorage
- `clearLocalStorageByPrefix(prefix)` - Clear multiple keys

## Best Practices

1. **Always handle errors** - Services include try-catch with fallbacks
2. **Optimistic updates** - UI updates immediately, syncs with API
3. **LocalStorage persistence** - All write operations save locally
4. **Consistent data shapes** - Mock data matches real API structure
5. **Token management** - JWT tokens handled automatically

## Troubleshooting

### Mock data not showing
- Check `USE_MOCK_DATA_FOR_READS` in `apiConfig.js`
- Verify import paths in your components
- Check browser console for errors

### Write operations failing
- Check network tab for API calls
- Verify token in localStorage
- Check API endpoint URLs
- Inspect localStorage for saved data

### Data not persisting
- Check localStorage quota
- Verify localStorage is enabled
- Clear localStorage and retry
