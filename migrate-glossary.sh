#!/bin/bash
# ============================================================================
# Glossary Migration Script
# ============================================================================
# This script safely migrates glossary data to Firebase with proper security
# ============================================================================

set -e  # Exit on any error

echo "🚀 Comparium Glossary Migration"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Backup current rules
echo "📋 Step 1: Backing up current security rules..."
cp firestore.rules firestore.rules.backup
echo -e "${GREEN}✓ Backup created: firestore.rules.backup${NC}"
echo ""

# Step 2: Deploy temporary migration rules
echo "🔓 Step 2: Deploying temporary migration rules..."
echo -e "${YELLOW}⚠️  WARNING: Temporarily allowing public writes to glossary${NC}"
cp firestore.rules.migration firestore.rules
firebase deploy --only firestore:rules
echo -e "${GREEN}✓ Migration rules deployed${NC}"
echo ""

# Step 3: Wait for user to run migration
echo "📊 Step 3: Run the migration"
echo ""
echo "NOW DO THIS:"
echo "1. Open: https://comparium-21b69.web.app/migrate-to-firebase.html"
echo "2. Click 'Check Firebase Connection'"
echo "3. Click 'Preview Data to Migrate'"
echo "4. Click 'Start Migration'"
echo "5. Wait for: 'Migration complete! Success: 143'"
echo ""
read -p "Press ENTER after migration completes..."
echo ""

# Step 4: Restore secure rules
echo "🔒 Step 4: Restoring secure rules..."
cp firestore.rules.backup firestore.rules
firebase deploy --only firestore:rules
echo -e "${GREEN}✓ Secure rules restored${NC}"
echo ""

# Step 5: Cleanup
echo "🧹 Step 5: Cleaning up..."
rm firestore.rules.backup
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

echo "================================================================"
echo -e "${GREEN}✅ MIGRATION COMPLETE!${NC}"
echo "================================================================"
echo ""
echo "Your glossary is now in Firebase with secure rules restored."
echo "The database is locked again - only admins can write."
echo ""
