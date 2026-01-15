/**
 * Comment Manager
 * Phase 4.2: Handle comments on community posts
 *
 * Provides high-level API for comment operations.
 * Uses firebase-init.js for Firestore operations.
 */

window.commentManager = {
  /**
   * Create a new comment on a post
   * @param {string} postId - Post to comment on
   * @param {string} content - Comment text
   * @param {string|null} replyTo - Parent comment ID for replies
   * @returns {Promise<{success: boolean, commentId?: string, error?: string}>}
   */
  async createComment(postId, content, replyTo = null) {
    return window.firestoreCreateComment(postId, content, replyTo);
  },

  /**
   * Get all comments for a post (organized for threaded display)
   * @param {string} postId - Post ID
   * @returns {Promise<{success: boolean, comments?: Array, error?: string}>}
   */
  async getComments(postId) {
    const result = await window.firestoreGetPostComments(postId);
    if (!result.success) return result;

    // Organize into threaded structure
    const topLevel = [];
    const replies = {};

    result.comments.forEach(comment => {
      if (comment.replyTo) {
        if (!replies[comment.replyTo]) {
          replies[comment.replyTo] = [];
        }
        replies[comment.replyTo].push(comment);
      } else {
        topLevel.push(comment);
      }
    });

    // Attach replies to their parent comments
    topLevel.forEach(comment => {
      comment.replies = replies[comment.id] || [];
    });

    return { success: true, comments: topLevel };
  },

  /**
   * Delete a comment
   * @param {string} commentId - Comment ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteComment(commentId) {
    return window.firestoreDeleteComment(commentId);
  },

  /**
   * Format relative time for display
   * @param {string} dateStr - ISO date string
   * @returns {string} Formatted time (e.g., "2h ago")
   */
  formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  },
};
