/**
 * Social Manager
 * Phase 4.2: Handle likes on posts and comments
 * Phase 4.3: Will add follows and bookmarks
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
};
