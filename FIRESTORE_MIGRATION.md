# Firestore Migration Guide

## Overview
This document outlines the strategy for migrating Comparium from localStorage to Firestore.

---

## Firestore Rules

### Security Model
The `firestore.rules` file implements a **strict privacy-first model**:

- ✅ Each user can **only** read/write their own data
- ✅ Username uniqueness enforced via `usernames` collection
- ✅ Comprehensive data validation (types, sizes, formats)
- ✅ Immutable core fields (uid, username, email, created)
- ✅ Prevents profile deletion (for audit trail)

### Collections

#### 1. `users/{uid}` (Primary user data)
```javascript
{
  uid: "firebase-auth-uid",          // Firebase Auth UID
  username: "john_doe",              // 3-30 chars, alphanumeric + _-
  email: "john@example.com",         // Valid email format
  created: "2025-01-15T10:30:00Z",  // ISO-8601 timestamp
  lastLogin: "2025-01-15T14:22:00Z", // ISO-8601 timestamp
  profile: {
    favoriteSpecies: [               // Array of species keys
      "neon-tetra",
      "guppy"
    ],
    comparisonHistory: [             // Array of comparison objects
      {
        id: "1705320000000",
        date: "2025-01-15T10:30:00Z",
        species: ["neon-tetra", "guppy"],
        compatible: true
      }
    ],
    tanks: [                         // Array of tank objects
      {
        id: "1705320000001",
        name: "Living Room 55g",
        size: 55,
        notes: "Community tank",
        species: ["neon-tetra", "guppy"],
        created: "2025-01-15T10:30:00Z",
        updated: "2025-01-15T10:30:00Z"
      }
    ]
  }
}
```

**Rules**:
- ✅ Owner can read/write their own profile
- ✅ Create: Must have valid structure + username registered
- ✅ Update: Cannot change uid/username/email/created
- ❌ Delete: Disabled (soft-delete recommended)

#### 2. `usernames/{username}` (Uniqueness index)
```javascript
{
  uid: "firebase-auth-uid",          // Owner's UID
  created: "2025-01-15T10:30:00Z"   // When claimed
}
```

**Purpose**:
- Enforce username uniqueness across all users
- Enable username → UID lookups for login flow

**Rules**:
- ✅ Any authenticated user can read (for availability checks)
- ✅ Create: Only when registering + username matches pattern
- ❌ Update/Delete: Never allowed (permanent claim)

#### 3. `emails/{email}` (Optional email index)
```javascript
{
  uid: "firebase-auth-uid",          // Owner's UID
  created: "2025-01-15T10:30:00Z"   // When created
}
```

**Purpose**: Email → UID lookup (Firebase Auth already handles this)

**Status**: Optional - only needed if you want custom email lookup

---

## localStorage Usage Analysis

### Current localStorage Keys

| Key | Purpose | Migration Strategy |
|-----|---------|-------------------|
| `user_{username}` | Legacy user profiles | ❌ **Eliminate** - migrate to Firestore |
| `username_map_{username}` | Username → UID mapping | ⚠️ **Replace** - use `usernames` collection |
| `currentUser` | Session username | ⚠️ **Replace** - use Firebase Auth state |
| `theme` | UI theme preference | ✅ **Keep** - UI-only, no need for cloud sync |

### Recommendation: Eliminate localStorage for User Data

**Keep in localStorage**:
- ✅ `theme` - UI preference, no cloud sync needed

**Migrate to Firestore**:
- ❌ `user_{username}` → `users/{uid}` collection
- ❌ `username_map_{username}` → `usernames/{username}` collection

**Replace with Firebase Auth**:
- ❌ `currentUser` → Use `firebase.auth().currentUser`

### sessionStorage Usage

Currently used for:
- Form redirects (`signupRedirect`, `loginRedirect`)
- Species detail state

**Recommendation**: ✅ Keep as-is (temporary UI state only)

---

## Migration Phases

### Phase 1: Enable Firestore (Immediate)
**Goal**: All new users use Firestore, localStorage as fallback

**Steps**:
1. ✅ Deploy `firestore.rules` to Firebase
2. ✅ Enable Firestore in `storage-service.js` (set `useBackend = true`)
3. ✅ Update registration to create `usernames/{username}` doc
4. ✅ Update login to query `usernames/{username}` for UID
5. ✅ Test all CRUD operations with Firestore
6. ✅ Monitor for errors, maintain localStorage fallback

**Timeline**: 1-2 days

---

### Phase 2: Data Migration (Existing Users)
**Goal**: Migrate localStorage users to Firestore

**Steps**:
1. ✅ Create migration function in `storage-service.js`
2. ✅ Detect localStorage data on login
3. ✅ Prompt user: "Migrate to cloud storage?"
4. ✅ Copy tanks, favorites, comparisons to Firestore
5. ✅ Verify data integrity
6. ✅ Clear localStorage user data (keep theme)
7. ✅ Show success message

**Migration Function**:
```javascript
async migrateLocalStorageToFirestore(uid, username) {
  // 1. Get localStorage data
  const localUser = JSON.parse(localStorage.getItem(`user_${username}`));

  // 2. Create Firestore profile
  const firestoreUser = {
    uid: uid,
    username: username,
    email: localUser.email,
    created: localUser.created,
    lastLogin: new Date().toISOString(),
    profile: {
      favoriteSpecies: localUser.profile.favoriteSpecies || [],
      comparisonHistory: localUser.profile.comparisonHistory || [],
      tanks: localUser.profile.tanks || []
    }
  };

  // 3. Save to Firestore
  await window.firestoreSetProfile(uid, firestoreUser);

  // 4. Create username mapping
  await setDoc(doc(firestore, 'usernames', username), {
    uid: uid,
    created: new Date().toISOString()
  });

  // 5. Clear localStorage (keep theme)
  localStorage.removeItem(`user_${username}`);
  localStorage.removeItem(`username_map_${username}`);
  localStorage.removeItem('currentUser');

  return true;
}
```

**Timeline**: 2-3 days

---

### Phase 3: Remove localStorage Fallback (Future)
**Goal**: Full Firestore dependency, no localStorage

**Steps**:
1. ✅ Monitor Phase 2 for 2-4 weeks
2. ✅ Verify 95%+ users migrated
3. ✅ Remove localStorage read/write code
4. ✅ Keep localStorage for theme only
5. ✅ Update documentation

**Timeline**: After 1 month of stable operation

---

## Security Enhancements

### Current Implementation vs. Firestore

| Feature | localStorage | Firestore |
|---------|-------------|-----------|
| **Authentication** | Basic hash | ✅ Firebase Auth (industry-standard) |
| **Privacy** | Local-only | ✅ Private per-user (rules enforced) |
| **Data Validation** | None | ✅ Server-side validation rules |
| **Password Security** | Simple hash | ✅ bcrypt + salting (Firebase) |
| **Cross-device Sync** | ❌ No | ✅ Yes |
| **Backup** | ❌ Manual | ✅ Automatic |
| **Offline Support** | ✅ Native | ✅ Firestore offline persistence |

### Additional Security Measures

1. **Firebase App Check** (Recommended for production):
   - Protects against unauthorized clients
   - Prevents API abuse
   ```javascript
   // Enable App Check (future enhancement)
   import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
   ```

2. **Rate Limiting** (Firebase Extensions):
   - Prevent brute-force attacks
   - Limit writes per user/IP

3. **Audit Logging** (Future):
   - Track profile changes
   - Monitor suspicious activity

---

## Testing Checklist

### Before Deploying Rules

- [ ] Test in Firebase emulator locally
- [ ] Verify user registration creates both `users/{uid}` and `usernames/{username}`
- [ ] Verify user login retrieves correct profile
- [ ] Test tank CRUD operations
- [ ] Test favorites add/remove
- [ ] Test comparison history
- [ ] Verify users cannot read others' data
- [ ] Test username uniqueness enforcement
- [ ] Test invalid data is rejected
- [ ] Test update cannot change uid/username/email

### After Deploying to Production

- [ ] Monitor Firestore usage in console
- [ ] Check for authentication errors
- [ ] Verify new registrations work
- [ ] Test existing users can login
- [ ] Monitor error logs for 48 hours
- [ ] Verify data integrity
- [ ] Test on multiple devices/browsers
- [ ] Test offline behavior

---

## Deployment Commands

### 1. Deploy Firestore Rules
```bash
# Test locally first
firebase emulators:start --only firestore

# Deploy to production
firebase deploy --only firestore:rules
```

### 2. Verify Rules Deployed
```bash
firebase firestore:rules --project comparium-21b69
```

### 3. Monitor Firestore (Console)
```
https://console.firebase.google.com/project/comparium-21b69/firestore
```

---

## Rollback Plan

If issues occur after migration:

### Immediate Rollback (< 1 hour)
1. Set `useBackend = false` in storage-service.js
2. Redeploy app (Firebase Hosting or GitHub Pages)
3. Users fall back to localStorage

### Data Recovery
1. Firestore data is never deleted (rules prevent deletion)
2. Export Firestore data: `firebase firestore:export backup/`
3. Restore: `firebase firestore:import backup/`

### Rule Rollback
```bash
# Revert to previous rules
firebase deploy --only firestore:rules --force
```

---

## Cost Analysis

### Firestore Free Tier (Spark Plan)
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ 20K deletes/day
- ✅ 1GB storage

### Estimated Usage (100 active users/day)
- Reads: ~500/day (5 reads per user session)
- Writes: ~200/day (2 writes per user session)
- Storage: ~10MB (100KB per user)

**Conclusion**: Well within free tier limits

### If Growth Exceeds Free Tier
Upgrade to **Blaze Plan** (pay-as-you-go):
- Reads: $0.06 per 100K
- Writes: $0.18 per 100K
- Storage: $0.18/GB/month

---

## Next Steps

1. **Review `firestore.rules`** - Ensure it matches your requirements
2. **Test in Firebase Emulator** - Validate rules locally
3. **Deploy to Firebase** - `firebase deploy --only firestore:rules`
4. **Enable Firestore in Code** - Modify `storage-service.js`
5. **Test End-to-End** - Create account, save tanks, verify sync
6. **Monitor for 1 Week** - Watch for errors in production
7. **Implement Migration Script** - For existing localStorage users

---

## Support & Documentation

- Firebase Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Firestore Best Practices: https://firebase.google.com/docs/firestore/best-practices
- Firebase Pricing: https://firebase.google.com/pricing

---

**Questions or Issues?**
- Check Firebase Console for errors
- Review browser console logs
- Test with Firebase emulator locally
