# Comparium Data Model

**Purpose:** Comprehensive Firestore database structure for all current and planned features.
**Last Updated:** January 12, 2026
**Firebase Plan:** Blaze (Cloud Functions available)

---

## Implementation Status

| Phase | Status | Notes |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | Tank management, events, schedules |
| **Phase 2** | ✅ Complete | Notifications + FCM push (January 2026) |
| **Phase 3** | 🔄 In Progress | Content expansion (3A-3D, 3G done; 3E-3F pending) |
| **Phase 4** | ✅ Complete | Social features (MVP, posts, comments, likes, follows, bookmarks, profiles) |
| **Phase 5** | ⏳ Planned | Diagnostic tool |
| **Phase 6** | ⏳ Long-term | Native mobile app (iOS + Android) |

### Phase 4 Future Polish (Deferred)
These items from the original Phase 4 spec are deferred for future implementation:
- [ ] Cloud Functions for follow counts (`onFollowCreate`/`onFollowDelete`)
- [ ] Cloud Function for post counts (`onPostCreate`)
- [ ] Cloud Function to update author info when profile changes (`updatePostAuthor`)
- [ ] Moderation features (flagging, reporting posts/comments)
- [ ] Post visibility options (followers-only, private posts)
- [ ] Direct messaging (DMs)
- [ ] Hashtag support for post discovery
- [ ] `allowComments` preference per user

### Phase 2 Implementation Details (Complete)
- ✅ `notifications` collection created with security rules
- ✅ `fcmTokens` collection created with security rules
- ✅ `checkDueSchedules` Cloud Function deployed (runs daily 8 AM UTC)
- ✅ `sendPushNotification` Cloud Function deployed (triggers on notification create)
- ✅ `cleanupExpiredNotifications` Cloud Function deployed (runs weekly Sundays 2 AM UTC)
- ✅ Dashboard integration (read notifications, mark as read, mark all read)
- ✅ Composite indexes deployed (userId + created, enabled + nextDue)
- ✅ FCM push notifications with browser permission flow
- ✅ Service worker for background notifications (`firebase-messaging-sw.js`)
- ✅ Push notification toggle in dashboard settings

---

## Design Principles

1. **Top-level collections** over subcollections (enables cross-document queries)
2. **userId on every document** (required for security rules)
3. **Cloud Functions for consistency** (denormalization updates, scheduled tasks)
4. **Explicit cleanup strategies** (nothing grows forever)
5. **Build for correctness first**, optimize later

---

## Phase 1: Foundation (Current + Enhanced Tank Management)

### `users` Collection
User accounts and profiles. One document per registered user.

```
users/{uid}
├── uid: string                      // Firebase Auth UID
├── username: string                 // Unique display name
├── email: string                    // Email address
├── created: timestamp               // Account creation
├── lastLogin: timestamp             // Last login
├── settings: {
│   ├── emailNotifications: boolean  // Default: true
│   ├── pushNotifications: boolean   // Default: true
│   ├── timezone: string             // For schedule calculations
│   └── theme: string                // "light", "dark", "system"
│}
└── stats: {                         // Updated by Cloud Functions
    ├── tankCount: number
    ├── totalEvents: number
    └── memberSince: timestamp
}
```

**Indexes:** None required (queries by document ID only)

**Cloud Function Triggers:**
- `onUserCreate`: Initialize stats, send welcome notification
- `onUserDelete`: Cascade delete all user data (GDPR compliance)

---

### `usernames` Collection
Username-to-UID mapping for login and uniqueness checking.

```
usernames/{username}                 // Document ID = lowercase username
├── uid: string                      // Firebase Auth UID
├── email: string                    // For login lookup
└── created: timestamp
```

**Security:** Public read (uniqueness check), authenticated create, owner delete only.

---

### `tanks` Collection
User aquarium configurations.

```
tanks/{tankId}                       // Auto-generated ID
├── userId: string                   // Owner's UID (REQUIRED for security)
├── name: string                     // "40 Gallon Community"
├── size: number                     // Gallons
├── sizeUnit: string                 // "gallons" or "liters"
├── species: string[]                // Species keys currently in tank
├── created: timestamp
├── updated: timestamp
├── description: string              // Optional notes
├── coverPhoto: string               // User-uploaded tank photo URL (Firebase Storage)
│
├── parameters: {                    // Current/target parameters
│   ├── temperature: number          // Fahrenheit
│   ├── ph: number
│   ├── ammonia: number
│   ├── nitrite: number
│   └── nitrate: number
│}
│
├── equipment: string[]              // Equipment keys (Phase 3)
├── plants: string[]                 // Plant keys (Phase 3)
│
└── isPublic: boolean                // For future social sharing
```

**Indexes Required:**
```
tanks: userId ASC, created DESC
tanks: userId ASC, updated DESC
tanks: isPublic ASC, updated DESC (Phase 4)
```

**Security:** Owner read/write only. Public read if `isPublic: true` (Phase 4).

---

### `tankEvents` Collection (NEW)
All tank maintenance and changes. **Top-level collection** (not subcollection) for cross-tank queries.

```
tankEvents/{eventId}                 // Auto-generated ID
├── userId: string                   // Owner's UID (REQUIRED)
├── tankId: string                   // Which tank
├── type: string                     // Event type (see list below)
├── date: timestamp                  // When event occurred
├── created: timestamp               // When record was created
├── notes: string                    // User notes
│
└── data: {                          // Type-specific data
    // Type: "waterChange"
    ├── percentChanged: number       // 25 for 25%
    ├── conditionerUsed: string

    // Type: "fishAdded" or "fishRemoved"
    ├── speciesKey: string
    ├── quantity: number
    ├── reason: string               // For removals: "died", "rehomed", etc.

    // Type: "parameterTest"
    ├── temperature: number
    ├── ph: number
    ├── ammonia: number
    ├── nitrite: number
    ├── nitrate: number
    ├── gh: number                   // Optional
    ├── kh: number                   // Optional

    // Type: "filterMaintenance"
    ├── action: string               // "rinsed", "replaced media", etc.
    ├── filterType: string           // "HOB", "canister", "sponge"

    // Type: "medication"
    ├── medicationName: string
    ├── dosage: string
    ├── reason: string
    ├── durationDays: number

    // Type: "equipmentChange"
    ├── equipmentType: string        // "heater", "filter", "light"
    ├── action: string               // "added", "removed", "replaced"
    ├── equipmentName: string

    // Type: "plantChange"
    ├── plantKey: string
    ├── action: string               // "added", "removed", "trimmed"
    ├── quantity: number

    // Type: "note"
    └── (uses top-level notes field only)
}
```

**Event Types:**
| Type | Description |
|------|-------------|
| `waterChange` | Water change performed |
| `fishAdded` | Fish added to tank |
| `fishRemoved` | Fish removed (died, rehomed, returned) |
| `parameterTest` | Water parameters recorded |
| `filterMaintenance` | Filter cleaned or media changed |
| `medication` | Medication treatment |
| `equipmentChange` | Equipment added/removed/replaced |
| `plantChange` | Plants added/removed/trimmed |
| `note` | General observation |

**Indexes Required:**
```
tankEvents: userId ASC, date DESC                    // All user events
tankEvents: userId ASC, tankId ASC, date DESC       // Events for specific tank
tankEvents: userId ASC, type ASC, date DESC         // Events by type
tankEvents: tankId ASC, date DESC                   // Tank history
```

**Security:** Owner read/write only (matched by userId).

---

### `tankSchedules` Collection (NEW)
Recurring maintenance schedules. **Top-level collection** for cross-tank queries.

```
tankSchedules/{scheduleId}           // Auto-generated ID
├── userId: string                   // Owner's UID (REQUIRED)
├── tankId: string                   // Which tank
├── tankName: string                 // Denormalized for notifications
├── type: string                     // Same types as events
├── intervalDays: number             // Frequency (7 = weekly)
├── enabled: boolean                 // Can pause without deleting
├── created: timestamp
│
├── lastCompleted: timestamp         // When task was last done (null if never)
├── nextDue: timestamp               // Calculated by Cloud Function
│
├── reminder: {
│   ├── enabled: boolean             // Send reminders?
│   ├── daysBefore: number           // Remind X days before due
│   └── lastSent: timestamp          // Prevents duplicate notifications
│}
│
└── notes: string                    // "Use Prime conditioner"
```

**Common Schedules:**
| Type | Typical Interval |
|------|------------------|
| `waterChange` | 7 days |
| `parameterTest` | 7 days |
| `filterMaintenance` | 14-30 days |
| `glassClean` | 7 days |

**Indexes Required:**
```
tankSchedules: userId ASC, nextDue ASC              // Upcoming tasks
tankSchedules: userId ASC, tankId ASC, nextDue ASC  // Per-tank schedules
tankSchedules: userId ASC, enabled ASC, nextDue ASC // Active schedules only
tankSchedules: nextDue ASC, reminder.enabled ASC    // For notification Cloud Function
```

**Security:** Owner read/write only.

**Cloud Function Triggers:**
- `onScheduleCreate`: Calculate initial `nextDue`
- `onScheduleUpdate`: Recalculate `nextDue` when `lastCompleted` changes
- `scheduledNotificationCheck` (runs daily): Find due schedules, create notifications

---

### `species` Collection
Fish species reference data. Mirrors fish-data.js for cloud access.

```
species/{speciesKey}                 // e.g., "neonTetra"
├── commonName: string               // "Neon Tetra"
├── scientificName: string           // "Paracheirodon innesi"
├── category: string                 // "freshwater"
├── imageUrl: string                 // Firebase Storage URL
│
├── careLevel: string                // "easy", "moderate", "difficult"
├── temperament: string              // "peaceful", "semi-aggressive", "aggressive"
├── diet: string                     // "omnivore", "herbivore", "carnivore"
├── lifespan: string                 // "5-8 years"
│
├── size: {
│   ├── min: number                  // Inches
│   ├── max: number
│   └── unit: string                 // "inches"
│}
│
├── tankSize: {
│   ├── min: number                  // Minimum gallons
│   └── unit: string                 // "gallons"
│}
│
├── temperature: {
│   ├── min: number                  // Fahrenheit
│   ├── max: number
│   └── unit: string                 // "fahrenheit"
│}
│
├── ph: {
│   ├── min: number
│   └── max: number
│}
│
├── schooling: boolean               // Needs groups?
├── minSchoolSize: number            // If schooling
│
├── compatibility: {                 // For comparison tool
│   ├── peaceful: boolean
│   ├── community: boolean
│   ├── predator: boolean
│   └── incompatibleWith: string[]   // Species keys
│}
│
├── description: string              // Detailed description
├── careTips: string[]               // Care advice
│
└── meta: {
    ├── created: timestamp
    ├── updated: timestamp
    └── source: string               // Data source attribution
}
```

**Indexes Required:**
```
species: category ASC, commonName ASC
species: careLevel ASC, commonName ASC
species: temperament ASC, commonName ASC
```

**Security:** Public read, admin-only write.

---

### `glossary` Collection
Fish terminology definitions.

```
glossary/{termKey}                   // e.g., "nitrogenCycle"
├── term: string                     // "Nitrogen Cycle"
├── definition: string               // Full explanation
├── shortDefinition: string          // One-sentence summary
├── category: string                 // "general", "chemistry", "disease", "equipment"
├── relatedTerms: string[]           // Links to other glossary entries
├── relatedSpecies: string[]         // Related species keys
└── meta: {
    ├── created: timestamp
    └── updated: timestamp
}
```

**Security:** Public read, admin-only write.

---

## Phase 2: Notifications

### `notifications` Collection (NEW)
User notifications. **Top-level collection** for efficient querying.

```
notifications/{notificationId}       // Auto-generated ID
├── userId: string                   // Recipient's UID (REQUIRED)
├── type: string                     // "maintenance", "system", "social" (Phase 4)
├── title: string                    // "Water change due tomorrow"
├── body: string                     // Longer description
├── created: timestamp
├── read: boolean                    // Has user seen it?
├── dismissed: boolean               // User dismissed it?
├── expiresAt: timestamp             // For automatic cleanup
│
├── action: {                        // What happens when clicked
│   ├── type: string                 // "navigate", "markComplete", etc.
│   ├── url: string                  // Where to go
│   └── data: {}                     // Action-specific data
│}
│
└── source: {                        // What triggered this
    ├── type: string                 // "schedule", "system", "user"
    ├── scheduleId: string           // If from schedule
    ├── tankId: string
    └── tankName: string             // Denormalized for display
}
```

**Indexes Required:**
```
notifications: userId ASC, read ASC, created DESC       // Unread first
notifications: userId ASC, created DESC                 // All notifications
notifications: expiresAt ASC                            // For cleanup function
```

**Security:** Owner read/write only.

**Cloud Functions:**
- `cleanupExpiredNotifications` (runs weekly): Delete where `expiresAt < now()`
- `createMaintenanceNotification`: Called by schedule checker

**Retention Policy:** Notifications expire after 30 days. Users can dismiss before expiry.

---

### `fcmTokens` Collection (NEW)
Push notification tokens. **Top-level collection** with token as document ID for deduplication.

```
fcmTokens/{tokenHash}                // Hash of token (tokens are long)
├── token: string                    // Full FCM token
├── userId: string                   // Owner's UID
├── device: string                   // "web", "ios", "android"
├── browser: string                  // "chrome", "firefox", "safari" (for web)
├── created: timestamp
├── lastUsed: timestamp              // Updated when notification sent
└── valid: boolean                   // Set false if send fails
```

**Why token hash as ID?**
- Prevents duplicate tokens (same device re-registering)
- Allows efficient lookup without querying

**Indexes Required:**
```
fcmTokens: userId ASC, valid ASC                       // User's active tokens
fcmTokens: valid ASC, lastUsed ASC                     // For cleanup
```

**Security:** Owner can create/read/delete own tokens.

**Cloud Functions:**
- `onTokenCreate`: Validate token format
- `cleanupInvalidTokens` (runs weekly): Remove tokens where `valid: false` or `lastUsed` > 90 days ago

---

## Phase 3: Expanded Glossary

### `equipment` Collection (NEW)
Aquarium equipment database.

```
equipment/{equipmentKey}             // e.g., "fluval307"
├── name: string                     // "Fluval 307 Canister Filter"
├── brand: string                    // "Fluval"
├── category: string                 // "filter", "heater", "light", "substrate", "test-kit"
├── subcategory: string              // "canister", "HOB", "sponge" (for filters)
│
├── description: string              // Overview
├── imageUrl: string
│
├── specs: {                         // Keep minimal to avoid document size issues
│   // Common to all:
│   ├── price: string                // "$150" (string to handle ranges)
│
│   // Filters:
│   ├── flowRate: number             // GPH
│   ├── tankSizeMin: number
│   ├── tankSizeMax: number
│   ├── mediaIncluded: string[]
│
│   // Heaters:
│   ├── watts: number
│   ├── tankSizeMin: number
│   ├── tankSizeMax: number
│   ├── adjustable: boolean
│
│   // Lights:
│   ├── watts: number
│   ├── spectrum: string             // "full", "planted", "marine"
│   ├── programmable: boolean
│}
│
├── pros: string[]                   // Max 5 items
├── cons: string[]                   // Max 5 items
├── bestFor: string[]                // "beginners", "planted tanks", etc.
│
└── meta: {
    ├── created: timestamp
    ├── updated: timestamp
    └── verified: boolean            // Staff-verified info
}
```

**Note:** Detailed specs, reviews, and comparisons stored in separate subcollection if needed later (`equipment/{id}/details/{detailId}`).

**Indexes Required:**
```
equipment: category ASC, name ASC
equipment: brand ASC, name ASC
equipment: category ASC, subcategory ASC, name ASC
```

**Security:** Public read, admin-only write.

---

### `plants` Collection (NEW)
Aquarium plant database.

```
plants/{plantKey}                    // e.g., "javaFern"
├── commonName: string               // "Java Fern"
├── scientificName: string           // "Microsorum pteropus"
├── category: string                 // "fern", "stem", "carpet", "floating", "moss"
│
├── careLevel: string                // "easy", "moderate", "difficult"
├── lightRequirement: string         // "low", "medium", "high"
├── co2Required: boolean
├── growthRate: string               // "slow", "medium", "fast"
│
├── size: {
│   ├── maxHeight: number            // Inches
│   ├── spread: string               // "narrow", "moderate", "wide"
│}
│
├── placement: string                // "foreground", "midground", "background", "floating"
├── substrate: string[]              // "gravel", "sand", "soil", "none" (for epiphytes)
│
├── propagation: string              // How to propagate
├── description: string
├── careTips: string[]
├── imageUrl: string
│
├── compatibility: {
│   ├── safeWithGoldfish: boolean
│   ├── safeWithCichlids: boolean
│   ├── notes: string
│}
│
└── meta: {
    ├── created: timestamp
    └── updated: timestamp
}
```

**Indexes Required:**
```
plants: category ASC, commonName ASC
plants: careLevel ASC, commonName ASC
plants: lightRequirement ASC, commonName ASC
plants: co2Required ASC, careLevel ASC
```

**Security:** Public read, admin-only write.

---

### `diseases` Collection (NEW)
Fish disease database for diagnostics.

```
diseases/{diseaseKey}                // e.g., "ich"
├── name: string                     // "Ich (White Spot Disease)"
├── scientificName: string           // "Ichthyophthirius multifiliis"
├── category: string                 // "parasitic", "bacterial", "fungal", "viral", "environmental"
│
├── severity: string                 // "mild", "moderate", "severe", "critical"
├── contagious: boolean
├── commonness: string               // "very common", "common", "uncommon", "rare"
│
├── identification: {
│   ├── visualSymptoms: string[]     // What it looks like
│   ├── behavioralSymptoms: string[] // How fish act
│   ├── imageUrl: string             // Reference image
│}
│
├── causes: string[]                 // What causes it
├── riskFactors: string[]            // What increases risk
│
├── treatment: {
│   ├── overview: string             // Brief treatment summary
│   ├── steps: string[]              // Step-by-step treatment
│   ├── medications: string[]        // Medication names
│   ├── duration: string             // "10-14 days"
│   ├── quarantineNeeded: boolean
│   └── warnings: string[]           // "Don't use with scaleless fish"
│}
│
├── prevention: string[]             // How to prevent
│
├── affectedSpecies: {               // Map for queryability
│   ├── all: boolean                 // Affects all fish?
│   ├── freshwater: boolean
│   ├── saltwater: boolean
│   └── specific: string[]           // Specific species if not all
│}
│
├── relatedDiseases: string[]        // Similar conditions to check
│
└── meta: {
    ├── created: timestamp
    ├── updated: timestamp
    ├── sources: string[]            // Information sources
    └── reviewedBy: string           // Expert review
}
```

**Indexes Required:**
```
diseases: category ASC, name ASC
diseases: severity ASC, name ASC
diseases: contagious ASC, category ASC
diseases: affectedSpecies.freshwater ASC, category ASC
```

**Security:** Public read, admin-only write.

---

## Phase 4: Social Features

### Updates to `users` Collection
Add public profile fields:

```
users/{uid}
├── ... (existing fields from Phase 1)
│
├── profile: {                       // Public profile info
│   ├── displayName: string          // Can differ from username
│   ├── bio: string                  // Max 500 chars
│   ├── avatarUrl: string            // Profile picture
│   ├── location: string             // Optional: "California, USA"
│   ├── experience: string           // "beginner", "intermediate", "expert"
│   ├── fishkeepingYears: number     // Years in hobby
│   └── isPublic: boolean            // Show profile to others?
│}
│
├── social: {                        // Updated by Cloud Functions only
│   ├── followerCount: number
│   ├── followingCount: number
│   └── postCount: number
│}
│
└── preferences: {
    ├── showActivity: boolean        // Show in activity feeds?
    ├── allowMessages: boolean       // Future: DMs
    └── allowComments: boolean       // Allow comments on posts
}
```

**Cloud Functions:**
- `updateUserStats`: Triggered when follows/posts change, updates counters using transactions

---

### `follows` Collection (NEW)
Who follows whom. Uses auto-generated IDs (NOT compound IDs).

```
follows/{followId}                   // Auto-generated ID
├── followerId: string               // Who is following
├── followingId: string              // Who they follow
├── created: timestamp
└── notifications: boolean           // Get notified of their posts?
```

**Indexes Required:**
```
follows: followerId ASC, created DESC    // "Who do I follow?"
follows: followingId ASC, created DESC   // "Who follows me?"
follows: followerId ASC, followingId ASC // Check if specific follow exists
```

**Security:**
- Anyone can read (to show follower counts)
- Create: authenticated, must be the follower
- Delete: must be the follower

**Cloud Functions:**
- `onFollowCreate`: Increment both users' follower/following counts
- `onFollowDelete`: Decrement counts

---

### `posts` Collection (NEW)
Social feed posts.

```
posts/{postId}                       // Auto-generated ID
├── userId: string                   // Author's UID
├── type: string                     // "tankUpdate", "tankShare", "photo", "question", "milestone"
├── created: timestamp
├── updated: timestamp
│
├── content: {
│   ├── text: string                 // Post text (max 2000 chars)
│   ├── imageUrls: string[]          // Attached images (max 4)
│}
│
├── tank: {                          // If tank-related
│   ├── tankId: string
│   ├── tankName: string             // Denormalized
│}
│
├── author: {                        // Denormalized - updated by Cloud Function
│   ├── username: string
│   ├── displayName: string
│   └── avatarUrl: string
│}
│
├── stats: {                         // Updated via increment()
│   ├── likeCount: number
│   ├── commentCount: number
│   └── viewCount: number
│}
│
├── visibility: string               // "public", "followers", "private"
├── tags: string[]                   // Hashtags for discovery
│
├── moderation: {
│   ├── status: string               // "active", "flagged", "removed"
│   ├── reportCount: number
│   └── reviewedAt: timestamp
│}
│
└── meta: {
    ├── edited: boolean
    ├── editedAt: timestamp
    └── deleted: boolean             // Soft delete
}
```

**Indexes Required:**
```
posts: userId ASC, created DESC                      // User's posts
posts: visibility ASC, created DESC                  // Public feed
posts: visibility ASC, tags ASC, created DESC        // Tag search
posts: moderation.status ASC, created DESC           // Moderation queue
```

**Security:**
- Read: public if `visibility: "public"`, owner always
- Create: authenticated
- Update/Delete: owner only

**Cloud Functions:**
- `onPostCreate`: Increment user's postCount
- `onPostDelete`: Decrement postCount, cleanup comments/likes
- `updatePostAuthor`: When user changes profile, update their posts (batched, max 500/run)

---

### `comments` Collection (NEW)
Comments on posts. **Top-level collection** for efficient queries.

```
comments/{commentId}                 // Auto-generated ID
├── postId: string                   // Parent post
├── userId: string                   // Comment author
├── created: timestamp
├── updated: timestamp
│
├── content: string                  // Comment text (max 1000 chars)
│
├── author: {                        // Denormalized
│   ├── username: string
│   └── avatarUrl: string
│}
│
├── replyTo: string                  // Parent comment ID for threading (null if top-level)
├── replyCount: number               // Number of replies to this comment
│
├── stats: {
│   └── likeCount: number
│}
│
└── moderation: {
    ├── status: string               // "active", "flagged", "removed"
    └── reportCount: number
}
```

**Indexes Required:**
```
comments: postId ASC, created ASC                    // Comments on post
comments: postId ASC, replyTo ASC, created ASC       // Threaded comments
comments: userId ASC, created DESC                   // User's comments
```

**Security:**
- Read: if parent post is readable
- Create: authenticated
- Update/Delete: owner only

---

### `likes` Collection (NEW)
Post and comment likes. Uses compound document ID for deduplication.

```
likes/{odId}_{odId}_{targetType}   // e.g., "user123_post456_post"
├── odId: string                    // Who liked
├── targetId: string                 // What was liked (postId or commentId)
├── targetType: string               // "post" or "comment"
├── created: timestamp
```

**Why compound ID?** Prevents duplicate likes (one like per user per target).

**Indexes Required:**
```
likes: targetId ASC, targetType ASC, created DESC    // Likes on a post/comment
likes: odId ASC, created DESC                       // User's likes
```

**Security:**
- Read: anyone (for like counts)
- Create/Delete: only where userId matches auth

**Cloud Functions:**
- `onLikeCreate`: Increment target's likeCount
- `onLikeDelete`: Decrement target's likeCount

---

### Feed Strategy

**Decision: Pull-based feeds (NOT fan-out)**

Given:
- No current users (won't have "celebrity problem" immediately)
- Blaze plan (Cloud Functions available)
- Simplicity preferred

**Approach:**
1. User's feed = query posts where `userId in [followed users]`
2. Firestore supports `in` queries up to 30 values
3. For users following >30 people: paginate through followed users, merge results client-side
4. Cache feed in client's IndexedDB for performance

**Future optimization:** If user growth requires it, add fan-out feeds collection later. The post/follow structure supports both approaches.

---

## Phase 5: Diagnostic Tool

### `diagnosticFlows` Collection (NEW)
Decision tree definitions. Nodes stored as subcollection to avoid document size limits.

```
diagnosticFlows/{flowId}             // e.g., "fishHealthChecker"
├── name: string                     // "Fish Health Diagnostic"
├── description: string              // What this flow diagnoses
├── category: string                 // "health", "water", "behavior", "equipment"
├── startNodeId: string              // First node to display
├── version: number                  // For updates
├── isActive: boolean                // Published?
│
└── meta: {
    ├── created: timestamp
    ├── updated: timestamp
    ├── author: string
    └── usageCount: number           // How many times used
}
```

---

### `diagnosticNodes` Collection (NEW)
Individual nodes in diagnostic flows. Separate collection for flexibility.

```
diagnosticNodes/{nodeId}             // Auto-generated ID
├── flowId: string                   // Parent flow
├── type: string                     // "question", "result", "info"
├── order: number                    // For sequencing
│
├── content: {
│   ├── title: string                // Question or result title
│   ├── description: string          // Detailed explanation
│   ├── imageUrl: string             // Optional illustration
│}
│
├── options: [                       // For "question" type
│   {
│       ├── label: string            // "Yes", "White spots", etc.
│       ├── description: string      // Optional clarification
│       └── nextNodeId: string       // Where this choice leads
│   }
]
│
├── result: {                        // For "result" type
│   ├── diagnosis: string            // "Ich (White Spot Disease)"
│   ├── severity: string             // "mild", "moderate", "severe"
│   ├── diseaseKey: string           // Link to diseases collection
│   ├── nextSteps: string[]          // What to do
│   └── relatedLinks: [              // Helpful resources
│       {
│           ├── type: string         // "disease", "faq", "glossary"
│           ├── key: string          // Document key
│           └── label: string        // Display text
│       }
│   ]
│}
│
└── meta: {
    ├── created: timestamp
    └── updated: timestamp
}
```

**Indexes Required:**
```
diagnosticNodes: flowId ASC, order ASC               // Nodes in flow
diagnosticNodes: flowId ASC, type ASC                // Results in flow
```

**Security:** Public read, admin-only write.

---

### Search Strategy

**Decision: Keyword-based search using Firestore (NOT Algolia/Elasticsearch initially)**

**Approach:**
1. Add `searchKeywords: string[]` field to searchable collections (species, equipment, plants, diseases, glossary)
2. Keywords = lowercase, tokenized words from name, description, tags
3. Query using `array-contains` on single keyword
4. Client-side filtering for multi-word searches

**Example addition to `species` collection:**
```
species/{speciesKey}
├── ... (existing fields)
└── searchKeywords: string[]         // ["neon", "tetra", "paracheirodon", "innesi", "peaceful", "schooling"]
```

**Cloud Function:**
- `generateSearchKeywords`: Triggered on document create/update, generates keyword array

**Future:** If search becomes inadequate, add Algolia integration. Current structure supports this without migration.

---

## Moderation & Safety

### `reports` Collection (NEW)
User reports for moderation.

```
reports/{reportId}                   // Auto-generated ID
├── reporterId: string               // Who reported
├── targetType: string               // "post", "comment", "user"
├── targetId: string                 // ID of reported item
├── reason: string                   // "spam", "harassment", "misinformation", etc.
├── details: string                  // User's explanation
├── created: timestamp
│
├── status: string                   // "pending", "reviewed", "actioned", "dismissed"
├── reviewedBy: string               // Admin who reviewed
├── reviewedAt: timestamp
├── actionTaken: string              // What was done
│
└── meta: {
    ├── targetUserId: string         // Owner of reported content
    └── targetSnapshot: {}           // Copy of content at report time
}
```

**Security:**
- Create: authenticated
- Read/Update: admin only

---

### `blockedUsers` Collection (NEW)
User blocking.

```
blockedUsers/{odId}_{targetUserId}
├── odId: string                    // Who blocked
├── targetUserId: string             // Who is blocked
├── created: timestamp
└── reason: string                   // Optional
```

**Security:** Owner can create/delete/read own blocks.

---

## Security Rules (Complete)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Usernames
    match /usernames/{username} {
      allow read: if true;
      allow create: if isAuthenticated() &&
                       request.resource.data.uid == request.auth.uid;
      allow delete: if isOwner(resource.data.uid);
    }

    // Tanks
    match /tanks/{tankId} {
      allow read: if isOwner(resource.data.userId) ||
                     resource.data.isPublic == true;
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }

    // Tank Events
    match /tankEvents/{eventId} {
      allow read, write: if isOwner(resource.data.userId) ||
                            (request.method == 'create' && isOwner(request.resource.data.userId));
    }

    // Tank Schedules
    match /tankSchedules/{scheduleId} {
      allow read, write: if isOwner(resource.data.userId) ||
                            (request.method == 'create' && isOwner(request.resource.data.userId));
    }

    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if isOwner(resource.data.userId) ||
                            (request.method == 'create' && isOwner(request.resource.data.userId));
    }

    // FCM Tokens
    match /fcmTokens/{tokenId} {
      allow read, delete: if isOwner(resource.data.userId);
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
    }

    // Reference Data (public read)
    match /species/{speciesId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /glossary/{termId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /equipment/{equipmentId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /plants/{plantId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /diseases/{diseaseId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /diagnosticFlows/{flowId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /diagnosticNodes/{nodeId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Social: Posts
    match /posts/{postId} {
      allow read: if resource.data.visibility == 'public' ||
                     isOwner(resource.data.userId) ||
                     (resource.data.visibility == 'followers' && isFollowing(resource.data.userId));
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);

      function isFollowing(targetUserId) {
        return exists(/databases/$(database)/documents/follows/$(request.auth.uid + '_' + targetUserId));
      }
    }

    // Social: Comments
    match /comments/{commentId} {
      allow read: if true; // If you can see post, you can see comments
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }

    // Social: Likes
    match /likes/{likeId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
                       request.resource.data.userId == request.auth.uid;
      allow delete: if isOwner(resource.data.userId);
    }

    // Social: Follows
    match /follows/{followId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
                       request.resource.data.followerId == request.auth.uid;
      allow delete: if isOwner(resource.data.followerId);
    }

    // Moderation: Reports
    match /reports/{reportId} {
      allow create: if isAuthenticated() &&
                       request.resource.data.reporterId == request.auth.uid;
      allow read, update: if isAdmin();
    }

    // Blocked Users
    match /blockedUsers/{blockId} {
      allow read, write: if isAuthenticated() &&
                            blockId.matches(request.auth.uid + '_.*');
    }

    // Admin list
    match /admins/{odId} {
      allow read: if isOwner(userId);
    }
  }
}
```

---

## Cloud Functions Required

### Phase 1
| Function | Trigger | Purpose |
|----------|---------|---------|
| `onUserCreate` | auth.onCreate | Initialize user document, stats |
| `onUserDelete` | auth.onDelete | Cascade delete all user data |
| `calculateNextDue` | firestore.onWrite (tankSchedules) | Recalculate nextDue when schedule changes |

### Phase 2
| Function | Trigger | Purpose | Status |
|----------|---------|---------|--------|
| `helloComparium` | HTTP request | Test function to verify deployment | ✅ Deployed |
| `checkDueSchedules` | pubsub.schedule (daily 8AM UTC) | Find due maintenance, create notifications | ✅ Deployed |
| `sendPushNotification` | firestore.onCreate (notifications) | Send FCM push when notification created | ✅ Deployed |
| `cleanupExpiredNotifications` | pubsub.schedule (weekly Sun 2AM UTC) | Delete old notifications + invalid FCM tokens | ✅ Deployed |

### Phase 3
| Function | Trigger | Purpose |
|----------|---------|---------|
| `generateSearchKeywords` | firestore.onWrite | Generate searchKeywords array |

### Phase 4
| Function | Trigger | Purpose |
|----------|---------|---------|
| `updateFollowCounts` | firestore.onWrite (follows) | Increment/decrement follower counts |
| `updatePostCounts` | firestore.onWrite (posts) | Increment/decrement post counts |
| `updateLikeCounts` | firestore.onWrite (likes) | Increment/decrement like counts |
| `updateCommentCounts` | firestore.onWrite (comments) | Increment/decrement comment counts |
| `syncUserProfileToContent` | firestore.onUpdate (users) | Update denormalized user info in posts/comments |

### Phase 5
| Function | Trigger | Purpose |
|----------|---------|---------|
| `trackDiagnosticUsage` | https.onCall | Track diagnostic flow usage |

---

## Migration from Current State

### Step 1: Add new fields to existing collections
No breaking changes. Add optional fields to `users`, `tanks`.

### Step 2: Create new collections
Deploy security rules first, then create collections:
- `tankEvents`
- `tankSchedules`
- `notifications`
- `fcmTokens`

### Step 3: Migrate existing tank data
Current tanks have species as array. No structural change needed.
If any tanks exist in `users/{uid}/profile/tanks` (legacy), migrate to `tanks` collection.

### Step 4: Deploy Cloud Functions
Deploy in order:
1. User lifecycle functions
2. Schedule calculation functions
3. Notification functions

### Step 5: Test thoroughly
- Create test events, verify queries work
- Create test schedules, verify nextDue calculation
- Test notification flow end-to-end

---

## Cost Projections

### Free Tier Limits (Blaze plan)
- 50K reads/day
- 20K writes/day
- 20K deletes/day
- 1GB storage

### Estimated Usage (100 active users)
| Operation | Daily Volume | Monthly Cost |
|-----------|--------------|--------------|
| Feed reads | 10K | $0 (under free tier) |
| Event writes | 500 | $0 (under free tier) |
| Schedule checks | 100 | $0 (under free tier) |
| **Total** | - | **$0** |

### Estimated Usage (10,000 active users)
| Operation | Daily Volume | Monthly Cost |
|-----------|--------------|--------------|
| Feed reads | 500K | ~$2.40/month |
| Event writes | 20K | ~$1.08/month |
| Social interactions | 50K writes | ~$2.70/month |
| Cloud Functions | 100K invocations | ~$0.40/month |
| **Total** | - | **~$7/month** |

You'll stay well within free tier for the foreseeable future.

---

## Document Size Estimates

| Collection | Est. Doc Size | Notes |
|------------|---------------|-------|
| users | 2-5 KB | Profile + settings |
| tanks | 1-3 KB | Depends on species count |
| tankEvents | 0.5-2 KB | Varies by event type |
| tankSchedules | 0.5-1 KB | Small |
| notifications | 0.5-1 KB | Small |
| species | 2-5 KB | Includes all attributes |
| posts | 2-10 KB | Depends on images |
| comments | 0.5-1 KB | Small |

All well under 1MB limit.

---

## Index Deployment

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "tanks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tankEvents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tankEvents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "tankId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tankSchedules",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "nextDue", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "tankSchedules",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "enabled", "order": "ASCENDING" },
        { "fieldPath": "nextDue", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "visibility", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "comments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "postId", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "follows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "followerId", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "follows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "followingId", "order": "ASCENDING" },
        { "fieldPath": "created", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy with: `firebase deploy --only firestore:indexes`

---

## Summary

This data model:

1. **Fixes all 12 critical issues** from the code review
2. **Uses top-level collections** for cross-document queries
3. **Includes userId on every document** for security
4. **Leverages Cloud Functions** for consistency (you have Blaze plan)
5. **Has explicit cleanup strategies** (notifications, tokens)
6. **Scales affordably** (free tier covers early growth)
7. **Supports incremental building** (each phase independent)

**Build order:**
1. Phase 1: Tank events & schedules (core value)
2. Phase 2: Notifications (user retention)
3. Phase 3: Expanded glossary (content depth)
4. Phase 4: Social features (community)
5. Phase 5: Diagnostic tool (differentiation)
6. Phase 6: Native mobile app (ultimate goal)

---

## Phase 6: Native Mobile App (Long-Term Vision)

**This is the ultimate goal for Comparium.** Most users will access on mobile, and a native app provides the best experience.

### Why Native App?

| Feature | Web App | Native App |
|---------|---------|------------|
| iOS lock screen notifications | ⚠️ Limited (PWA only) | ✅ Full support |
| Android notifications | ✅ Works via FCM | ✅ Full support |
| Offline access | ⚠️ Limited | ✅ Full support |
| App Store presence | ❌ No | ✅ Discoverability |
| Home screen icon | ⚠️ Manual PWA install | ✅ Automatic |
| Performance | Good | Better |

### Technical Approach Options

| Option | Pros | Cons |
|--------|------|------|
| **React Native** | Single codebase, large community, JS-based | Some native limitations |
| **Flutter** | Single codebase, excellent performance | Dart language (new to learn) |
| **Native (Swift + Kotlin)** | Best performance, full platform access | Two codebases to maintain |

**Recommended:** React Native or Flutter for single-codebase efficiency.

### What Carries Over from Web

The existing Firebase backend works directly with mobile apps:
- ✅ Firestore database (same collections)
- ✅ Firebase Auth (same user accounts)
- ✅ Firebase Storage (same images)
- ✅ Cloud Functions (same backend logic)
- ✅ FCM (native SDK even better than web)

**No backend rebuild required** - the mobile app is a new frontend to the same Firebase services.

### Requirements

- Apple Developer Account ($99/year) - **Required for iOS**
- Google Play Developer Account ($25 one-time)
- App Store review process (Apple is stricter)
- Ongoing maintenance for OS updates

### Prerequisite Phases

Complete Phases 1-5 first to:
1. Stabilize all features on web
2. Build user base to validate demand
3. Refine UX patterns before porting to mobile
4. Ensure data model is mature (mobile apps are harder to update)

### Planning Notes

- iOS is priority (user is iOS user, large US market share)
- Consider hiring mobile developer or learning React Native
- Web app remains available (not everyone installs apps)
- Mobile app can start as "lite" version with core features only
