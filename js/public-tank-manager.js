/**
 * Public Tank Manager - Tank Sharing Feature
 * Phase 4 MVP: Manage public tanks for community gallery
 *
 * This module handles syncing tanks to the publicTanks collection
 * when users toggle the isPublic flag on their tanks.
 *
 * Dependencies: firebase-init.js must be loaded first
 */

// ============================================================================
// PUBLIC TANK MANAGER
// ============================================================================

window.publicTankManager = {
  /**
   * Sync a tank to the publicTanks collection and create a community post
   * Call this when user sets tank.isPublic = true
   *
   * @param {string} uid - Owner's user ID
   * @param {object} tank - Tank object from user's profile
   * @param {string} username - Owner's username for denormalization
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async syncToPublic(uid, tank, username) {
    const firestore = window.firebaseFirestore;
    if (!firestore || !uid || !tank?.id) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      // Import Firestore functions dynamically (ES6 module)
      const { doc, setDoc, addDoc, collection, Timestamp } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const now = Timestamp.now();
      const nowISO = new Date().toISOString();

      // Create a community post for the shared tank
      const tankName = tank.name || 'Unnamed Tank';
      const speciesCount = tank.species?.length || 0;
      const plantCount = tank.plants?.length || 0;

      let postContent = `Shared my tank: ${tankName}`;
      if (tank.size) {
        const unit = tank.sizeUnit === 'liters' ? 'L' : 'gal';
        postContent += ` (${tank.size}${unit})`;
      }
      if (speciesCount > 0 || plantCount > 0) {
        const parts = [];
        if (speciesCount > 0) parts.push(`${speciesCount} species`);
        if (plantCount > 0) parts.push(`${plantCount} plants`);
        postContent += ` - ${parts.join(', ')}`;
      }
      if (tank.description) {
        postContent += `\n\n${tank.description}`;
      }

      // Get user profile for avatar
      const profile = await window.firestoreGetProfile(uid);

      const postData = {
        userId: uid,
        content: postContent,
        category: 'tanks',
        imageUrls: tank.coverPhoto ? [tank.coverPhoto] : [],
        visibility: 'public',
        stats: {
          likeCount: 0,
          commentCount: 0,
        },
        author: {
          username: username,
          avatarUrl: profile?.avatarUrl || null,
        },
        // Link to the tank for rich display
        linkedTank: {
          tankId: tank.id,
          name: tankName,
          size: tank.size || 0,
          sizeUnit: tank.sizeUnit || 'gallons',
          speciesCount: speciesCount,
          plantCount: plantCount,
          coverPhoto: tank.coverPhoto || null,
        },
        created: nowISO,
        updated: nowISO,
      };

      // Create the post
      const postsRef = collection(firestore, 'posts');
      const postDoc = await addDoc(postsRef, postData);
      const postId = postDoc.id;

      // Build the public tank document with denormalized data
      const publicTankData = {
        tankId: tank.id,
        userId: uid,
        username: username,
        isPublic: true,

        // Tank details
        name: tankName,
        size: tank.size || 0,
        sizeUnit: tank.sizeUnit || 'gallons',
        species: tank.species || [],
        plants: tank.plants || [],
        coverPhoto: tank.coverPhoto || null,
        description: tank.description || '',

        // Owner profile (denormalized for future Phase 4 features)
        owner: {
          username: username,
          bio: '',
          avatarUrl: profile?.avatarUrl || null,
        },

        // Stats (ready for Phase 4D likes/views)
        stats: {
          viewCount: 0,
          likeCount: 0,
        },

        // Reference to the community post
        linkedPostId: postId,

        // Timestamps
        created: tank.created ? Timestamp.fromDate(new Date(tank.created)) : now,
        sharedAt: now,
        updated: now,
      };

      // Write to publicTanks collection (use tankId as document ID)
      const publicTankRef = doc(firestore, 'publicTanks', tank.id);
      await setDoc(publicTankRef, publicTankData);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to share tank' };
    }
  },

  /**
   * Remove a tank from the publicTanks collection and delete linked post
   * Call this when user sets tank.isPublic = false or deletes tank
   *
   * @param {string} tankId - Tank ID to remove
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async removeFromPublic(tankId) {
    const firestore = window.firebaseFirestore;
    if (!firestore || !tankId) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      const { doc, getDoc, deleteDoc } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const publicTankRef = doc(firestore, 'publicTanks', tankId);

      // Get the linked post ID before deleting
      const tankDoc = await getDoc(publicTankRef);
      const linkedPostId = tankDoc.data()?.linkedPostId;

      // Delete the publicTank document
      await deleteDoc(publicTankRef);

      // Delete the linked post if it exists
      if (linkedPostId) {
        const postRef = doc(firestore, 'posts', linkedPostId);
        await deleteDoc(postRef).catch(() => {
          // Ignore errors if post doesn't exist
        });
      }

      return { success: true };
    } catch (error) {
      // If document doesn't exist, that's fine - it's already removed
      if (error.code === 'not-found') {
        return { success: true };
      }
      return { success: false, error: error.message || 'Failed to remove tank' };
    }
  },

  /**
   * Update a public tank's data
   * Call this when user updates a tank that's already public
   *
   * @param {string} uid - Owner's user ID
   * @param {object} tank - Updated tank object
   * @param {string} username - Owner's username
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updatePublicTank(uid, tank, username) {
    const firestore = window.firebaseFirestore;
    if (!firestore || !uid || !tank?.id) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      const { doc, setDoc, Timestamp } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const now = Timestamp.now();

      // Use setDoc with merge to handle both create and update
      // This fixes the case where tank.isPublic was set before rules were deployed
      const publicTankData = {
        tankId: tank.id,
        userId: uid,
        username: username,
        isPublic: true,
        name: tank.name || 'Unnamed Tank',
        size: tank.size || 0,
        sizeUnit: tank.sizeUnit || 'gallons',
        species: tank.species || [],
        plants: tank.plants || [],
        coverPhoto: tank.coverPhoto || null,
        description: tank.description || '',
        owner: {
          username: username,
          bio: '',
          avatarUrl: null,
        },
        stats: {
          viewCount: 0,
          likeCount: 0,
        },
        created: tank.created ? Timestamp.fromDate(new Date(tank.created)) : now,
        sharedAt: now,
        updated: now,
      };

      // merge: true creates doc if missing, updates if exists
      const publicTankRef = doc(firestore, 'publicTanks', tank.id);
      await setDoc(publicTankRef, publicTankData, { merge: true });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to update tank' };
    }
  },

  /**
   * Get public tanks for the community gallery
   *
   * @param {object} options - Query options
   * @param {number} options.limit - Max tanks to return (default 24)
   * @param {string} options.sortBy - Sort field: 'newest', 'size' (default 'newest')
   * @param {object} options.lastDoc - Last document for pagination
   * @returns {Promise<{success: boolean, tanks: Array, lastDoc?: object, error?: string}>}
   */
  async getPublicTanks(options = {}) {
    const firestore = window.firebaseFirestore;
    if (!firestore) {
      return { success: false, tanks: [], error: 'Database unavailable' };
    }

    try {
      const { collection, query, where, orderBy, limit, getDocs, startAfter } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const maxResults = options.limit || 24;
      const sortField = options.sortBy === 'size' ? 'size' : 'sharedAt';
      const sortDir = 'desc';

      // Build query
      let q = query(
        collection(firestore, 'publicTanks'),
        where('isPublic', '==', true),
        orderBy(sortField, sortDir),
        limit(maxResults)
      );

      // Add pagination if lastDoc provided
      if (options.lastDoc) {
        q = query(
          collection(firestore, 'publicTanks'),
          where('isPublic', '==', true),
          orderBy(sortField, sortDir),
          startAfter(options.lastDoc),
          limit(maxResults)
        );
      }

      const snapshot = await getDocs(q);
      const tanks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to ISO strings for easier handling
        created: doc.data().created?.toDate?.()?.toISOString() || null,
        sharedAt: doc.data().sharedAt?.toDate?.()?.toISOString() || null,
        updated: doc.data().updated?.toDate?.()?.toISOString() || null,
      }));

      // Get last doc for pagination
      const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

      return { success: true, tanks, lastDoc };
    } catch (error) {
      return { success: false, tanks: [], error: error.message || 'Failed to load tanks' };
    }
  },

  /**
   * Get a single public tank by ID
   *
   * @param {string} tankId - Tank ID to fetch
   * @returns {Promise<{success: boolean, tank?: object, error?: string}>}
   */
  async getPublicTank(tankId) {
    const firestore = window.firebaseFirestore;
    if (!firestore || !tankId) {
      return { success: false, error: 'Missing required parameters' };
    }

    try {
      const { doc, getDoc } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const publicTankRef = doc(firestore, 'publicTanks', tankId);
      const snapshot = await getDoc(publicTankRef);

      if (!snapshot.exists()) {
        return { success: false, error: 'Tank not found' };
      }

      const data = snapshot.data();
      const tank = {
        id: snapshot.id,
        ...data,
        // Convert timestamps
        created: data.created?.toDate?.()?.toISOString() || null,
        sharedAt: data.sharedAt?.toDate?.()?.toISOString() || null,
        updated: data.updated?.toDate?.()?.toISOString() || null,
      };

      return { success: true, tank };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to load tank' };
    }
  },

  /**
   * Get all public tanks for a specific user
   *
   * @param {string} userId - User ID to fetch tanks for
   * @returns {Promise<{success: boolean, tanks: Array, error?: string}>}
   */
  async getPublicTanksByUser(userId) {
    const firestore = window.firebaseFirestore;
    if (!firestore || !userId) {
      return { success: false, tanks: [], error: 'Missing required parameters' };
    }

    try {
      const { collection, query, where, orderBy, getDocs } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const q = query(
        collection(firestore, 'publicTanks'),
        where('userId', '==', userId),
        where('isPublic', '==', true),
        orderBy('sharedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const tanks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created: doc.data().created?.toDate?.()?.toISOString() || null,
        sharedAt: doc.data().sharedAt?.toDate?.()?.toISOString() || null,
        updated: doc.data().updated?.toDate?.()?.toISOString() || null,
      }));

      return { success: true, tanks };
    } catch (error) {
      return { success: false, tanks: [], error: error.message || 'Failed to load tanks' };
    }
  },

  /**
   * Check if a tank is currently public
   *
   * @param {string} tankId - Tank ID to check
   * @returns {Promise<boolean>}
   */
  async isPublic(tankId) {
    if (!tankId) return false;

    try {
      const { doc, getDoc } =
        await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const firestore = window.firebaseFirestore;
      if (!firestore) return false;

      const publicTankRef = doc(firestore, 'publicTanks', tankId);
      const snapshot = await getDoc(publicTankRef);
      return snapshot.exists() && snapshot.data()?.isPublic === true;
    } catch {
      return false;
    }
  },
};
