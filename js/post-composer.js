/**
 * Post Composer - Create new posts with images
 * Phase 4 Full: Social features
 */

let composerModal = null;
let selectedImages = [];
let isSubmitting = false;

/**
 * Open the post composer modal
 */
function openPostComposer() {
  const uid = window.getFirebaseUid();
  if (!uid) {
    alert('Please log in to create a post');
    window.location.href = 'login.html';
    return;
  }

  // Create modal if it doesn't exist
  if (!composerModal) {
    createComposerModal();
  }

  // Reset state
  selectedImages = [];
  isSubmitting = false;

  // Reset form
  document.getElementById('post-content').value = '';
  document.getElementById('post-category').value = 'help';
  document.getElementById('image-preview-container').innerHTML = '';
  document.getElementById('char-count').textContent = '0';
  updateImageCount();

  // Show modal
  composerModal.style.display = 'flex';
  document.getElementById('post-content').focus();
}

/**
 * Close the post composer modal
 */
function closePostComposer() {
  if (composerModal) {
    composerModal.style.display = 'none';
  }
  selectedImages = [];
}

/**
 * Create the composer modal DOM structure
 */
function createComposerModal() {
  composerModal = document.createElement('div');
  composerModal.className = 'modal-overlay';
  composerModal.id = 'post-composer-modal';
  composerModal.onclick = e => {
    if (e.target === composerModal) closePostComposer();
  };

  const categories = window.postManager?.POST_CATEGORIES || {
    help: { label: 'Help / Questions' },
    showcase: { label: 'Tank Showcase' },
    tips: { label: 'Tips & Guides' },
    fishid: { label: 'Fish ID' },
    milestone: { label: 'Milestones' },
  };

  const categoryOptions = Object.entries(categories)
    .map(([key, val]) => `<option value="${key}">${val.label}</option>`)
    .join('');

  composerModal.innerHTML = `
    <div class="modal composer-modal">
      <div class="modal-header">
        <h2>Create Post</h2>
        <button class="modal-close" onclick="closePostComposer()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="composer-form">
          <div class="form-group">
            <label for="post-category">Category</label>
            <select id="post-category" class="form-select">
              ${categoryOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="post-content">What's on your mind?</label>
            <textarea
              id="post-content"
              class="form-textarea"
              rows="5"
              maxlength="2000"
              placeholder="Share a question, tip, or update..."
              oninput="updateCharCount()"
            ></textarea>
            <div class="char-counter">
              <span id="char-count">0</span> / 2000
            </div>
          </div>
          <div class="form-group">
            <label>Images (optional, max 4)</label>
            <div id="image-preview-container" class="image-preview-container"></div>
            <div class="image-upload-area">
              <input
                type="file"
                id="image-input"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style="display: none"
                onchange="handleImageSelect(event)"
              >
              <button type="button" class="btn btn-ghost" onclick="document.getElementById('image-input').click()">
                Add Images (<span id="image-count">0</span>/4)
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closePostComposer()">Cancel</button>
        <button class="btn btn-primary" id="submit-post-btn" onclick="submitPost()">Post</button>
      </div>
    </div>
  `;

  document.body.appendChild(composerModal);
}

/**
 * Update character count display
 */
function updateCharCount() {
  const content = document.getElementById('post-content');
  const count = document.getElementById('char-count');
  if (content && count) {
    count.textContent = content.value.length;
  }
}

/**
 * Update image count display
 */
function updateImageCount() {
  const countEl = document.getElementById('image-count');
  if (countEl) {
    countEl.textContent = selectedImages.length;
  }
}

/**
 * Handle image file selection
 */
function handleImageSelect(event) {
  const files = Array.from(event.target.files);

  // Check total count
  if (selectedImages.length + files.length > 4) {
    alert('Maximum 4 images allowed');
    return;
  }

  // Validate and add each file
  files.forEach(file => {
    if (selectedImages.length >= 4) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(`${file.name}: Invalid file type. Use JPEG, PNG, or WebP.`);
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}: File too large. Maximum 5MB.`);
      return;
    }

    selectedImages.push(file);
    addImagePreview(file);
  });

  updateImageCount();
  event.target.value = ''; // Reset input
}

/**
 * Add image preview to the container
 */
function addImagePreview(file) {
  const container = document.getElementById('image-preview-container');
  const index = selectedImages.indexOf(file);

  const preview = document.createElement('div');
  preview.className = 'image-preview';
  preview.dataset.index = index;

  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  preview.appendChild(img);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'image-preview-remove';
  removeBtn.innerHTML = '&times;';
  removeBtn.onclick = () => removeImage(index);
  preview.appendChild(removeBtn);

  container.appendChild(preview);
}

/**
 * Remove an image from selection
 */
function removeImage(index) {
  selectedImages.splice(index, 1);

  // Rebuild previews
  const container = document.getElementById('image-preview-container');
  container.innerHTML = '';
  selectedImages.forEach(file => {
    addImagePreview(file);
  });

  updateImageCount();
}

/**
 * Submit the post
 */
async function submitPost() {
  if (isSubmitting) return;

  const content = document.getElementById('post-content').value.trim();
  const category = document.getElementById('post-category').value;

  // Validate
  if (!content) {
    alert('Please enter some content');
    return;
  }

  isSubmitting = true;
  const submitBtn = document.getElementById('submit-post-btn');
  submitBtn.textContent = 'Posting...';
  submitBtn.disabled = true;

  try {
    // If we have images, we need to create post first to get ID, then upload images
    let imageUrls = [];

    if (selectedImages.length > 0) {
      // Generate a temporary post ID for image paths
      const tempPostId = 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Upload images
      for (let i = 0; i < selectedImages.length; i++) {
        const result = await window.storageUploadPostImage(tempPostId, selectedImages[i], i);
        if (result.success) {
          imageUrls.push(result.url);
        } else {
          throw new Error(`Failed to upload image ${i + 1}: ${result.error}`);
        }
      }
    }

    // Create the post
    const result = await window.postManager.createPost({
      content,
      category,
      imageUrls,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create post');
    }

    // Success - close modal and refresh feed
    closePostComposer();

    // If we're on the posts view, refresh it
    if (typeof window.loadPosts === 'function') {
      window.loadPosts(false);
    }
  } catch (error) {
    alert('Error creating post: ' + error.message);
  } finally {
    isSubmitting = false;
    submitBtn.textContent = 'Post';
    submitBtn.disabled = false;
  }
}

// Expose functions globally
window.openPostComposer = openPostComposer;
window.closePostComposer = closePostComposer;
