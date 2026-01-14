/**
 * Post Manager - CRUD operations for community posts
 * Phase 4 Full: Social features
 */

// Post categories
const POST_CATEGORIES = {
  help: { label: 'Help / Questions', icon: '?' },
  showcase: { label: 'Tank Showcase', icon: '' },
  tips: { label: 'Tips & Guides', icon: '' },
  fishid: { label: 'Fish ID', icon: '' },
  milestone: { label: 'Milestones', icon: '' },
};

/**
 * Create a new post
 * @param {object} postData - { content, category, imageUrls }
 * @returns {Promise<{success: boolean, postId?: string, error?: string}>}
 */
async function createPost(postData) {
  const uid = window.getFirebaseUid();
  if (!uid) {
    return { success: false, error: 'Must be logged in to post' };
  }

  // Validate content
  if (!postData.content || postData.content.trim().length === 0) {
    return { success: false, error: 'Post content is required' };
  }
  if (postData.content.length > 2000) {
    return { success: false, error: 'Post content must be under 2000 characters' };
  }

  // Validate category
  if (!postData.category || !POST_CATEGORIES[postData.category]) {
    return { success: false, error: 'Invalid category' };
  }

  // Validate images (max 4)
  const imageUrls = postData.imageUrls || [];
  if (imageUrls.length > 4) {
    return { success: false, error: 'Maximum 4 images allowed' };
  }

  try {
    // Get user profile for author info
    const profile = await window.firestoreGetProfile(uid);
    const username = profile?.username || 'Anonymous';

    const post = {
      userId: uid,
      content: postData.content.trim(),
      category: postData.category,
      imageUrls: imageUrls,
      visibility: 'public',
      stats: {
        likeCount: 0,
        commentCount: 0,
      },
      author: {
        username: username,
        avatarUrl: profile?.profile?.avatarUrl || null,
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    const result = await window.firestoreCreatePost(post);
    return result;
  } catch (error) {
    return { success: false, error: error.message || 'Failed to create post' };
  }
}

/**
 * Get posts for the community feed
 * @param {object} options - { category, sortBy, limit, lastDoc }
 * @returns {Promise<{success: boolean, posts: array, lastDoc: any}>}
 */
async function getFeedPosts(options = {}) {
  const {
    category = null,
    sortBy = 'newest',
    limit = 20,
    lastDoc = null,
  } = options;

  try {
    const result = await window.firestoreGetPosts({
      category,
      sortBy,
      limit,
      lastDoc,
    });
    return result;
  } catch (error) {
    return { success: false, posts: [], error: error.message };
  }
}

/**
 * Get a single post by ID
 * @param {string} postId
 * @returns {Promise<{success: boolean, post?: object, error?: string}>}
 */
async function getPost(postId) {
  if (!postId) {
    return { success: false, error: 'Post ID required' };
  }

  try {
    const result = await window.firestoreGetPost(postId);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a post (owner only)
 * @param {string} postId
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deletePost(postId) {
  const uid = window.getFirebaseUid();
  if (!uid) {
    return { success: false, error: 'Must be logged in' };
  }

  try {
    const result = await window.firestoreDeletePost(uid, postId);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get posts by a specific user
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<{success: boolean, posts: array}>}
 */
async function getUserPosts(userId, limit = 20) {
  try {
    const result = await window.firestoreGetUserPosts(userId, limit);
    return result;
  } catch (error) {
    return { success: false, posts: [], error: error.message };
  }
}

// Expose globally
window.postManager = {
  POST_CATEGORIES,
  createPost,
  getFeedPosts,
  getPost,
  deletePost,
  getUserPosts,
};
