# Phase 4.4: Enhanced Profiles Design

**Created:** January 15, 2026
**Status:** Approved for implementation
**Goal:** Restructure Dashboard with profile management, social features, and notification settings

---

## Summary

Restructure the Dashboard into a tabbed interface that balances personal tank management with social/community profile features. Users can edit their profile (bio, experience, location), view their posts and bookmarks, and control notification preferences.

### Key Decisions

| Decision | Choice |
|----------|--------|
| Profile editing location | Dashboard (not profile page) |
| Dashboard organization | Tab-based: My Tanks, My Profile, Settings |
| My Profile structure | Sub-tabs: Overview, My Posts, Bookmarks |
| Avatar | Letter placeholder (no upload for now) |
| Notification scope | In-app only (push support later) |
| Password change | Link to existing forgot-password flow |

---

## Dashboard Restructure

### New Tab Layout

```
┌─────────────────────────────────────────────────────┐
│  Dashboard                                          │
├─────────────────────────────────────────────────────┤
│  [My Tanks]    [My Profile]    [Settings]           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  (Tab content appears here)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### My Tanks Tab

Restructured from current dashboard:
- Tank cards grid with add/edit/delete
- Maintenance section (quick log, schedules)

**Removed sections:**
- Recent Comparisons (low value)
- Favorites (accessible via Glossary)
- Bookmarked Posts (moves to My Profile)

### My Profile Tab

```
[Overview]    [My Posts]    [Bookmarks]
```

#### Overview Sub-tab

```
┌───────────────────────────────────────────────┐
│  [H]  @username                               │
│       Intermediate · California, USA          │
│       "Love my planted community tanks!"      │
│                                               │
│       3 posts · 12 followers · 8 following    │
│                                               │
│       [Edit Profile]    [View Public Profile] │
└───────────────────────────────────────────────┘
```

#### My Posts Sub-tab

- List of user's own posts (newest first)
- Shows: content preview, category, date, like/comment counts
- Click to view full post
- Delete button on each post

#### Bookmarks Sub-tab

- List of bookmarked posts
- Same card format as My Posts
- Click to view, option to unbookmark

### Settings Tab

```
┌─────────────────────────────────────────────────────┐
│  Notification Preferences                           │
│  ─────────────────────────────────────────────────  │
│  Control what appears in your notification bell.    │
│                                                     │
│  ☑ Someone comments on my post                      │
│  ☑ Someone replies to my comment                    │
│  ☐ Someone likes my post or comment                 │
│  ☑ Someone follows me                               │
│  ☐ Someone I follow creates a post                  │
│                                                     │
│  [Save Preferences]                                 │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  Account                                            │
│  ─────────────────────────────────────────────────  │
│  Email: user@example.com                            │
│  Password: ••••••••  [Change Password]              │
└─────────────────────────────────────────────────────┘
```

---

## Profile Edit Modal

Opens from "Edit Profile" button on Overview sub-tab.

| Field | Input Type | Validation |
|-------|------------|------------|
| Bio | Textarea | Max 500 characters, optional |
| Experience | Dropdown | Beginner / Intermediate / Advanced / Expert |
| Location | Text input | Max 100 characters, optional |

---

## Data Model

### User Document Updates (`users/{uid}`)

```javascript
{
  // ... existing fields ...

  // NEW: Profile fields
  profile: {
    bio: "",              // Max 500 chars
    experience: "",       // "beginner" | "intermediate" | "advanced" | "expert"
    location: ""          // Max 100 chars
  },

  // NEW: Social stats (Cloud Functions update these)
  social: {
    postCount: 0,
    followerCount: 0,
    followingCount: 0
  },

  // NEW: Notification preferences
  notificationPreferences: {
    onComment: true,
    onReply: true,
    onLike: false,
    onFollow: true,
    onFollowingPost: false
  }
}
```

### Migration Strategy

- New fields added on first profile edit or notification check
- Defaults applied when fields are missing
- No breaking changes to existing users

---

## Cloud Function Updates

### `onPostWrite` (new)

**Trigger:** Firestore onCreate/onDelete on `posts/{postId}`

```javascript
// On create: increment social.postCount on author
// On delete: decrement social.postCount on author
```

### Future: Notification preference checks

When creating social notifications, check user's `notificationPreferences` before creating notification document. Not implemented in this phase.

---

## Files to Modify

| File | Changes |
|------|---------|
| `dashboard.html` | Add tab structure, remove old sections |
| `js/dashboard.js` (or inline) | Tab switching, profile/settings UI |
| `js/firebase-init.js` | Profile update functions |
| `functions/index.js` | `onPostWrite` Cloud Function |
| `firestore.rules` | Ensure profile fields owner-writable |
| `css/naturalist.css` | Tab styles, modal styles |

### Sections Removed from Dashboard

- Recent Comparisons
- Favorites
- Bookmarked Posts (relocated to My Profile > Bookmarks)

---

## Security Rules

Profile fields are owner-writable only:

```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

No changes needed - existing rules already support this.

---

## Validation Checklist

### Dashboard Structure
- [ ] Three tabs display correctly: My Tanks, My Profile, Settings
- [ ] Tab switching works without page reload
- [ ] Active tab state persists visually

### My Tanks Tab
- [ ] Tank cards display correctly
- [ ] Maintenance section works
- [ ] Old sections removed (comparisons, favorites)

### My Profile Tab
- [ ] Sub-tabs work: Overview, My Posts, Bookmarks
- [ ] Overview shows profile card with stats
- [ ] Edit Profile button opens modal
- [ ] My Posts shows user's posts
- [ ] Bookmarks shows saved posts
- [ ] Can delete own posts
- [ ] Can unbookmark posts

### Profile Edit Modal
- [ ] Bio field accepts up to 500 chars
- [ ] Experience dropdown has 4 options
- [ ] Location field accepts up to 100 chars
- [ ] Save updates Firestore correctly
- [ ] Cancel closes without saving
- [ ] Changes reflect on Overview immediately

### Settings Tab
- [ ] All 5 notification checkboxes display
- [ ] Checkboxes reflect saved preferences
- [ ] Save Preferences updates Firestore
- [ ] Change Password links to forgot-password page
- [ ] Email displays (read-only)

### Public Profile Integration
- [ ] Edited bio/experience/location show on public profile
- [ ] Post count accurate on public profile
- [ ] "View Public Profile" button works

### Cloud Functions
- [ ] postCount increments on post create
- [ ] postCount decrements on post delete

---

## Future Enhancements (Not This Phase)

- Avatar image upload
- Push notification preference controls
- Delete account option
- Follower/following list modals
- Profile privacy settings

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-15 | Initial design created via brainstorming |
