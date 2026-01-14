# Phase 4 Full: Social Features Design

**Created:** January 14, 2026
**Status:** Approved for implementation
**Goal:** Community engagement - help fishkeepers connect, share tips, ask questions

---

## Summary

Transform Comparium's community page into a full social platform with posts, comments, likes, follows, and enhanced profiles. Focus on **community engagement** over pure social networking.

### Feature Decisions

| Feature | Decision |
|---------|----------|
| Post format | Text + photos (max 4 images) |
| Categories | 5: Help, Showcase, Tips, Fish ID, Milestones |
| Comments | Threaded replies |
| Likes | Posts and comments |
| Follows | Follow users + bookmark posts |
| Notifications | User-controlled preferences |
| Moderation | Report button (scale later) |
| Profiles | Full: bio, experience, location, stats, bookmarks |
| Feed sorting | User toggle: Newest / Top |
| Feed location | Integrated into existing `community.html` |

---

## Data Architecture

### New Firestore Collections

#### `posts/{postId}`
User-created posts with text and optional images.

```javascript
{
  userId: string,              // Author's UID
  content: string,             // Post text (max 2000 chars)
  imageUrls: string[],         // Firebase Storage URLs (max 4)
  category: string,            // "help" | "showcase" | "tips" | "fishid" | "milestone"

  stats: {
    likeCount: number,         // Updated by Cloud Function
    commentCount: number       // Updated by Cloud Function
  },

  author: {                    // Denormalized for display
    username: string,
    avatarUrl: string | null
  },

  visibility: string,          // "public" (future: "followers", "private")
  created: timestamp,
  updated: timestamp
}
```

**Indexes Required:**
```
posts: category ASC, created DESC       // Category filter + newest
posts: category ASC, stats.likeCount DESC  // Category filter + top
posts: userId ASC, created DESC         // User's posts
posts: visibility ASC, created DESC     // Public feed
```

#### `comments/{commentId}`
Threaded comments on posts.

```javascript
{
  postId: string,              // Parent post
  userId: string,              // Comment author
  content: string,             // Comment text (max 1000 chars)

  replyTo: string | null,      // Parent comment ID (null if top-level)
  replyCount: number,          // Number of direct replies

  stats: {
    likeCount: number
  },

  author: {                    // Denormalized
    username: string,
    avatarUrl: string | null
  },

  created: timestamp,
  updated: timestamp
}
```

**Indexes Required:**
```
comments: postId ASC, created ASC              // Comments on post (chronological)
comments: postId ASC, replyTo ASC, created ASC // Threaded view
comments: userId ASC, created DESC             // User's comments
```

#### `likes/{odId}_{targetId}_{targetType}`
Deduplicated likes using compound document ID.

```javascript
{
visibleodId: string,              // Who liked
  targetId: string,              // Post or comment ID
  targetType: string,            // "post" | "comment"
  created: timestamp
}
```

**Why compound ID?** Prevents duplicate likes - one like per user per target.

**Indexes Required:**
```
likes: targetId ASC, targetType ASC, created DESC  // Likes on a post/comment
likes: odId ASC, created DESC                     // User's likes
```

#### `follows/{followerId}_{followingId}`
User follow relationships.

```javascript
{
  followerId: string,            // Who is following
  followingId: string,           // Who they follow
  created: timestamp
}
```

**Indexes Required:**
```
follows: followerId ASC, created DESC   // "Who do I follow?"
follows: followingId ASC, created DESC  // "Who follows me?"
```

#### `bookmarks/{odId}_{postId}`
Saved posts (private to user).

```javascript
{
visibleodId: string,              // Who bookmarked
  postId: string,                // Saved post
  created: timestamp
}
```

**Indexes Required:**
```
bookmarks: odId ASC, created DESC  // User's bookmarks (newest first)
```

---

## User Document Updates

Add these fields to existing `users/{uid}` documents:

```javascript
{
  // ... existing fields ...

  profile: {
    bio: string,                 // Max 500 chars
    experience: string,          // "beginner" | "intermediate" | "advanced" | "expert"
    location: string             // Optional, freeform (e.g., "California, USA")
  },

  social: {                      // Updated by Cloud Functions only
    followerCount: number,
    followingCount: number,
    postCount: number
  },

  notificationPreferences: {
    onComment: boolean,          // Someone comments on my post (default: true)
    onReply: boolean,            // Someone replies to my comment (default: true)
    onLike: boolean,             // Someone likes my post/comment (default: false)
    onFollow: boolean,           // Someone follows me (default: true)
    onFollowingPost: boolean     // Someone I follow posts (default: false)
  }
}
```

---

## Cloud Functions

### New Functions

#### `onLikeWrite`
**Trigger:** Firestore onCreate/onDelete on `likes/{likeId}`

```javascript
// On create: increment likeCount on target
// On delete: decrement likeCount on target
// Uses transaction for atomic update
```

#### `onCommentWrite`
**Trigger:** Firestore onCreate/onDelete on `comments/{commentId}`

```javascript
// On create:
//   - Increment commentCount on parent post
//   - If replyTo exists, increment replyCount on parent comment
//   - Create notification for post author (if enabled)
//   - Create notification for parent comment author (if reply, if enabled)

// On delete:
//   - Decrement commentCount on parent post
//   - If replyTo exists, decrement replyCount on parent comment
```

#### `onFollowWrite`
**Trigger:** Firestore onCreate/onDelete on `follows/{followId}`

```javascript
// On create:
//   - Increment followerCount on followed user
//   - Increment followingCount on follower
//   - Create notification for followed user (if enabled)

// On delete:
//   - Decrement followerCount on followed user
//   - Decrement followingCount on follower
```

#### `onPostWrite`
**Trigger:** Firestore onCreate/onDelete on `posts/{postId}`

```javascript
// On create:
//   - Increment postCount on author
//   - Create notifications for followers (if they enabled onFollowingPost)

// On delete:
//   - Decrement postCount on author
//   - Delete all comments on post (batch delete)
//   - Delete all likes on post (batch delete)
//   - Delete all bookmarks for post (batch delete)
```

### Updated Functions

#### `sendPushNotification` (existing)
Extend to handle new notification types:
- `comment` - Someone commented on your post
- `reply` - Someone replied to your comment
- `like` - Someone liked your post/comment
- `follow` - Someone followed you
- `followingPost` - Someone you follow created a post

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions (existing)
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Posts
    match /posts/{postId} {
      allow read: if resource.data.visibility == 'public';
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }

    // Comments
    match /comments/{commentId} {
      allow read: if true;  // If post is public, comments are public
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }

    // Likes - compound ID starts with odId
    match /likes/{likeId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
                       likeId.matches(request.auth.uid + '_.*');
      allow delete: if isAuthenticated() &&
                       likeId.matches(request.auth.uid + '_.*');
    }

    // Follows - compound ID starts with followerId
    match /follows/{followId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
                       followId.matches(request.auth.uid + '_.*');
      allow delete: if isAuthenticated() &&
                       followId.matches(request.auth.uid + '_.*');
    }

    // Bookmarks - compound ID starts with odId, private to owner
    match /bookmarks/{bookmarkId} {
      allow read, write: if isAuthenticated() &&
                            bookmarkId.matches(request.auth.uid + '_.*');
    }

    // Reports (minimal moderation)
    match /reports/{reportId} {
      allow create: if isAuthenticated() &&
                       request.resource.data.reporterId == request.auth.uid;
      allow read: if false;  // Admin only via console
    }
  }
}
```

---

## Frontend Architecture

### Modified Pages

#### `community.html`
Add tabs to switch between tanks and posts.

```
[Tanks] [Posts]                    [Sort: Newest ▼]

+------------------------------------------+
| Category Tabs:                           |
| [All] [Help] [Showcase] [Tips] [ID] [🎉] |
+------------------------------------------+

+------------------------------------------+
| Post Card                                |
| @username · Help · 2h ago                |
| "My betta has white spots..."            |
| [image thumbnail]                        |
| ❤️ 12  💬 5                              |
+------------------------------------------+
```

#### `profile.html`
Enhance with social features.

```
+------------------------------------------+
| [Avatar]  @username                      |
| Intermediate · California, USA           |
| "Love my planted tanks!"                 |
|                                          |
| 12 posts · 45 followers · 23 following   |
|                                          |
| [Follow] button (for other users)        |
+------------------------------------------+
| [Tanks] [Posts] [Bookmarks*]             |
|         * only visible to owner          |
+------------------------------------------+
```

### New Page

#### `post.html?id={postId}`
Single post detail view.

```
+------------------------------------------+
| @username · Help · Jan 14, 2026          |
+------------------------------------------+
| Full post content here...                |
|                                          |
| [Full-size images]                       |
|                                          |
| ❤️ 12  🔖 Bookmark  🚩 Report            |
+------------------------------------------+
| Comments (5)                             |
+------------------------------------------+
| @helper · 1h ago                    ❤️ 3 |
| "Looks like ich, here's what to do..."   |
|   ↳ @username · 30m ago             ❤️ 1 |
|     "Thank you! Starting treatment"      |
|   ↳ [Reply box]                          |
+------------------------------------------+
| [Add a comment...]                       |
+------------------------------------------+
```

### New JavaScript Modules

#### `js/post-manager.js`
CRUD operations for posts.
- `createPost(content, imageFiles, category)`
- `getPost(postId)`
- `getFeedPosts(category, sortBy, limit, startAfter)`
- `getUserPosts(userId, limit)`
- `deletePost(postId)`
- `reportPost(postId, reason)`

#### `js/comment-manager.js`
CRUD operations for comments.
- `createComment(postId, content, replyTo)`
- `getPostComments(postId)`
- `deleteComment(commentId)`

#### `js/social-manager.js`
Follows, likes, bookmarks.
- `followUser(userId)` / `unfollowUser(userId)`
- `isFollowing(userId)`
- `getFollowers(userId)` / `getFollowing(userId)`
- `likePost(postId)` / `unlikePost(postId)`
- `likeComment(commentId)` / `unlikeComment(commentId)`
- `bookmarkPost(postId)` / `unbookmarkPost(postId)`
- `getUserBookmarks()`

#### `js/post-composer.js`
Post creation UI component.
- Modal with text input, image upload (max 4), category selector
- Image preview with remove buttons
- Character counter
- Submit validation

---

## Post Categories

| Key | Display Name | Icon | Use Case |
|-----|--------------|------|----------|
| `help` | Help / Questions | ❓ | Getting advice, troubleshooting |
| `showcase` | Tank Showcase | 🐠 | Showing off setups |
| `tips` | Tips & Guides | 💡 | Sharing knowledge |
| `fishid` | Fish ID | 🔍 | Species identification |
| `milestone` | Milestones | 🎉 | Celebrating achievements |

---

## Implementation Phases

### Phase 4.1: Core Posts (Foundation)
**Goal:** Users can create and view posts in the community feed.

**Tasks:**
1. Create `posts` collection with security rules
2. Deploy Firestore indexes for posts
3. Create `js/post-manager.js` with CRUD operations
4. Create `js/post-composer.js` modal component
5. Modify `community.html` - add Posts/Tanks tabs
6. Build post feed with category filter tabs
7. Add sort toggle (Newest / Top)
8. Create `post.html` for single post view
9. Implement image upload to Firebase Storage (`images/posts/{postId}/`)

**Files:**
- `js/post-manager.js` (new)
- `js/post-composer.js` (new)
- `js/community.js` (modify)
- `community.html` (modify)
- `post.html` (new)
- `firestore.rules` (modify)
- `firestore.indexes.json` (modify)

**Validation:**
- [ ] Can create text-only post
- [ ] Can create post with images
- [ ] Posts appear in feed
- [ ] Category filtering works
- [ ] Sort toggle works
- [ ] Single post page loads correctly

---

### Phase 4.2: Comments & Likes
**Goal:** Users can comment on posts and like posts/comments.

**Tasks:**
1. Create `comments`, `likes` collections with security rules
2. Deploy Firestore indexes
3. Create `js/comment-manager.js`
4. Build threaded comment component for `post.html`
5. Add like functionality to `js/social-manager.js`
6. Add like buttons to post cards and comments
7. Deploy `onLikeWrite` Cloud Function
8. Deploy `onCommentWrite` Cloud Function

**Files:**
- `js/comment-manager.js` (new)
- `js/social-manager.js` (new - partial)
- `js/post-detail.js` (new or modify)
- `post.html` (modify)
- `functions/index.js` (modify)
- `firestore.rules` (modify)
- `firestore.indexes.json` (modify)

**Validation:**
- [ ] Can add top-level comment
- [ ] Can reply to comment (threaded)
- [ ] Can like/unlike posts
- [ ] Can like/unlike comments
- [ ] Like counts update correctly
- [ ] Comment counts update correctly

---

### Phase 4.3: Follows & Bookmarks
**Goal:** Users can follow others and bookmark posts.

**Tasks:**
1. Create `follows`, `bookmarks` collections with security rules
2. Deploy Firestore indexes
3. Add follow/bookmark functions to `js/social-manager.js`
4. Add Follow button to `profile.html`
5. Add Bookmark button to post cards and post detail
6. Build Bookmarks tab on own profile
7. Deploy `onFollowWrite` Cloud Function

**Files:**
- `js/social-manager.js` (modify)
- `js/profile.js` (modify)
- `profile.html` (modify)
- `post.html` (modify)
- `functions/index.js` (modify)
- `firestore.rules` (modify)
- `firestore.indexes.json` (modify)

**Validation:**
- [ ] Can follow/unfollow users
- [ ] Follow button state persists
- [ ] Follower/following counts update
- [ ] Can bookmark/unbookmark posts
- [ ] Bookmarks tab shows saved posts
- [ ] Bookmarks only visible to owner

---

### Phase 4.4: Enhanced Profiles
**Goal:** Full social profiles with bio, stats, and settings.

**Tasks:**
1. Add profile fields to user document schema
2. Create profile edit modal/form
3. Display bio, experience, location on profile
4. Display follower/following/post counts
5. Add Posts tab to profile (user's posts)
6. Add notification preferences to settings
7. Deploy `onPostWrite` Cloud Function for post counts

**Files:**
- `js/profile.js` (modify)
- `js/auth-manager.js` (modify for settings)
- `profile.html` (modify)
- `dashboard.html` (modify for settings)
- `functions/index.js` (modify)

**Validation:**
- [ ] Can edit bio, experience, location
- [ ] Profile displays all info correctly
- [ ] Post/follower/following counts accurate
- [ ] Posts tab shows user's posts
- [ ] Notification preferences save correctly

---

### Phase 4.5: Notifications & Polish
**Goal:** Wire up notifications and polish the experience.

**Tasks:**
1. Extend notification system for social events
2. Respect user notification preferences
3. Add notification UI for new types
4. Mobile responsiveness pass
5. Loading states and error handling
6. Empty states (no posts, no followers, etc.)
7. End-to-end testing

**Files:**
- `functions/index.js` (modify)
- `js/community.js` (polish)
- `js/profile.js` (polish)
- `css/naturalist.css` (modify)
- Various HTML files (polish)

**Validation:**
- [ ] Notifications fire correctly
- [ ] User preferences respected
- [ ] Mobile layout works well
- [ ] Empty states display nicely
- [ ] All error cases handled gracefully
- [ ] Full user flow works end-to-end

---

## Testing Checklist

### Unit Tests (npm run test:data equivalent)
- [ ] Post schema validation
- [ ] Comment schema validation
- [ ] Security rules tests for new collections

### Integration Tests
- [ ] Create post → appears in feed
- [ ] Add comment → count updates
- [ ] Like post → count updates
- [ ] Follow user → counts update on both profiles
- [ ] Delete post → cascades to comments/likes/bookmarks

### E2E Tests (Playwright)
- [ ] Full post creation flow with images
- [ ] Comment thread interaction
- [ ] Follow/unfollow flow
- [ ] Bookmark flow
- [ ] Profile editing flow

---

## Migration Notes

### For Existing Users
- `profile` and `social` fields will be added on first edit/interaction
- Default `notificationPreferences` applied on first notification check
- No breaking changes to existing data

### Rollback Plan
If issues arise:
1. Disable new UI tabs (hide Posts tab, show only Tanks)
2. Cloud Functions can be disabled individually
3. Collections can remain (no data loss) while UI is fixed

---

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Separate feed page or integrate into community? | Integrate into `community.html` |
| How many images per post? | Max 4 |
| Comment nesting depth? | Unlimited (but UI shows 2 levels, then "View more") |
| Feed pagination? | Infinite scroll with 20 posts per load |

---

## Dependencies

- Firebase Storage rules update (allow post images)
- Cloud Functions deployment (4 new functions)
- Firestore indexes deployment (before launch)

---

## Success Metrics

After launch, track:
- Posts created per day
- Comments per post (engagement)
- DAU on community page
- Follow graph growth
- Most active categories

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-14 | Initial design created |
