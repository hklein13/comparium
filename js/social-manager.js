/**
 * Social Manager
 * Phase 4.2: Handle likes on posts and comments
 * Phase 4.3: Handle follows and bookmarks
 *
 * Provides high-level API for social interactions.
 */

window.socialManager = {
  /**
   * Toggle like on a post
   * @param {string} postId - Post ID
   * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
   */
  async togglePostLike(postId) {
    return window.firestoreToggleLike(postId, 'post');
  },

  /**
   * Toggle like on a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<{success: boolean, liked?: boolean, error?: string}>}
   */
  async toggleCommentLike(commentId) {
    return window.firestoreToggleLike(commentId, 'comment');
  },

  /**
   * Check if current user has liked a post
   * @param {string} postId - Post ID
   * @returns {Promise<boolean>}
   */
  async hasLikedPost(postId) {
    const result = await window.firestoreHasLiked(postId, 'post');
    return result.success && result.liked;
  },

  /**
   * Check if current user has liked a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<boolean>}
   */
  async hasLikedComment(commentId) {
    const result = await window.firestoreHasLiked(commentId, 'comment');
    return result.success && result.liked;
  },

  // ===== FOLLOWS =====

  /**
   * Toggle follow on a user
   * @param {string} userId - User ID to follow/unfollow
   * @returns {Promise<{success: boolean, following?: boolean, error?: string}>}
   */
  async toggleFollow(userId) {
    return window.firestoreToggleFollow(userId);
  },

  /**
   * Check if current user is following a user
   * @param {string} userId - User ID to check
   * @returns {Promise<boolean>}
   */
  async isFollowing(userId) {
    const result = await window.firestoreIsFollowing(userId);
    return result.success && result.following;
  },

  /**
   * Get follower count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getFollowerCount(userId) {
    const result = await window.firestoreGetFollowerCount(userId);
    return result.success ? result.count : 0;
  },

  /**
   * Get following count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getFollowingCount(userId) {
    const result = await window.firestoreGetFollowingCount(userId);
    return result.success ? result.count : 0;
  },

  /**
   * Get list of user IDs that current user follows
   * @param {number} maxResults - Max results (default 30)
   * @returns {Promise<string[]>}
   */
  async getFollowingUserIds(maxResults = 30) {
    const uid = window.getFirebaseUid();
    if (!uid) return [];
    const result = await window.firestoreGetFollowingUserIds(uid, maxResults);
    return result.success ? result.userIds : [];
  },

  /**
   * Get posts from users the current user follows
   * @param {number} maxResults - Max results
   * @returns {Promise<array>}
   */
  async getFollowingFeedPosts(maxResults = 10) {
    const userIds = await this.getFollowingUserIds(30);
    if (userIds.length === 0) return [];
    const result = await window.firestoreGetPostsByUserIds(userIds, maxResults);
    return result.success ? result.posts : [];
  },

  // ===== BOOKMARKS =====

  /**
   * Toggle bookmark on a post
   * @param {string} postId - Post ID to bookmark/unbookmark
   * @returns {Promise<{success: boolean, bookmarked?: boolean, error?: string}>}
   */
  async toggleBookmark(postId) {
    return window.firestoreToggleBookmark(postId);
  },

  /**
   * Check if current user has bookmarked a post
   * @param {string} postId - Post ID to check
   * @returns {Promise<boolean>}
   */
  async isBookmarked(postId) {
    const result = await window.firestoreIsBookmarked(postId);
    return result.success && result.bookmarked;
  },

  /**
   * Get current user's bookmarked posts
   * @returns {Promise<Array>}
   */
  async getBookmarks() {
    const result = await window.firestoreGetUserBookmarks();
    return result.success ? result.bookmarks : [];
  },

  /**
   * Get all bookmarked posts for current user (with full post data)
   * @returns {Promise<array>} - Array of post objects
   */
  async getBookmarkedPosts() {
    const uid = window.getFirebaseUid?.();
    console.log('[DEBUG] getBookmarkedPosts uid:', uid);
    if (!uid) return [];

    try {
      const { collection, query, where, orderBy, getDocs, doc, getDoc } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      // Get user's bookmarks
      const bookmarksRef = collection(window.firebaseFirestore, 'bookmarks');
      const q = query(bookmarksRef, where('userId', '==', uid), orderBy('created', 'desc'));

      console.log('[DEBUG] About to query bookmarks...');
      const snapshot = await getDocs(q);
      console.log('[DEBUG] Bookmarks query succeeded, count:', snapshot.docs.length);
      const bookmarks = snapshot.docs.map(d => d.data());

      // Fetch full post data for each bookmark
      const posts = [];
      for (const bookmark of bookmarks) {
        const postRef = doc(window.firebaseFirestore, 'posts', bookmark.postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          posts.push({ id: postDoc.id, ...postDoc.data() });
        }
      }

      return posts;
    } catch (error) {
      console.error('Error getting bookmarked posts:', error);
      if (typeof Sentry !== 'undefined') {
        Sentry.captureException(error);
      }
      return [];
    }
  },
};
