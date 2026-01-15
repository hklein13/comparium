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
};
