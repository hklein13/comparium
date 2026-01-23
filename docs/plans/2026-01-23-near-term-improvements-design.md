# Near-term Improvements Design

**Date:** 2026-01-23
**Status:** Approved for Implementation

---

## Overview

Three near-term improvements to enhance UX:

1. **Tank Form Validation** - Require name and size with inline error messages
2. **Dashboard Nav Visibility** - Show Dashboard only when logged in, style auth buttons distinctly
3. **Compare Tool Expansion** - Allow up to 5 species comparisons (start with 3, add on demand)

---

## 1. Tank Form Validation

### Requirements
- Tank Name: required (cannot be empty or whitespace-only)
- Tank Size: required (must be > 0 gallons)

### Behavior
1. On form submit, validate both fields before saving
2. If invalid:
   - Add `.input-error` class to input (red border)
   - Show error message below field
3. On user input in invalid field, clear error state
4. Block save until both fields valid

### Error Messages
- Empty name: "Tank name is required"
- Empty/zero size: "Tank size must be greater than 0"

### Files to Modify
- `js/tank-manager.js` - Add validation in `saveTank()` function
- `css/naturalist.css` - Add `.input-error` styles
- `dashboard.html` - Add error message `<span>` elements below inputs

---

## 2. Dashboard Navigation Visibility

### Requirements
- Dashboard link hidden for anonymous users
- Dashboard link visible as styled button for logged-in users
- Login and Sign Up both styled as distinct buttons when logged out

### Nav States

**Logged out:**
```
[Home] [Compare] [Glossary] [Community] [FAQ] | [Login] [Sign Up]
                                                 ghost    filled
```

**Logged in:**
```
[Home] [Compare] [Glossary] [Community] [FAQ] | [Dashboard]
                                                  filled
```

### Implementation
1. Add `nav-dashboard` class to Dashboard link
2. CSS hides `.nav-dashboard` by default
3. CSS shows `.nav-dashboard` when `body.logged-in` exists
4. Add `nav-ghost` class to Login link for outlined button style
5. Keep `nav-cta` on Sign Up (already styled as filled)

### Files to Modify
- `index.html`, `compare.html`, `glossary.html`, `community.html`, `faq.html`, `login.html`, `signup.html` - Add classes to nav links
- `dashboard.html` - Keep Dashboard visible (user is logged in)
- `css/naturalist.css` - Add visibility rules and `.nav-ghost` style

---

## 3. Compare Tool Expansion

### Requirements
- Start with 3 species selector panels (current behavior)
- "Add Species" button reveals 4th and 5th panels on demand
- Maximum 5 species for comparison

### Behavior
1. Initial: 3 panels visible, "Add Species" button below grid
2. Click button: 4th panel animates in, button remains
3. Click again: 5th panel appears, button hides (max reached)

### Layout
- CSS grid handles 4-5 columns with responsive wrapping
- Cards maintain consistent sizing across counts

### Implementation
1. Add panels 4, 5 to HTML (hidden by default)
2. Add "Add Species" button below selector grid
3. Extend `selectedSpecies` object: `panel4`, `panel5`
4. Add `addSpeciesSlot()` function to reveal next panel
5. Update `buildPanels()` to handle all 5 panels
6. Update comparison logic to include all selected species

### Files to Modify
- `compare.html` - Add hidden panels 4, 5 and button
- `js/app.js` - Extend selection logic, add reveal function
- `css/naturalist.css` - Responsive grid for 4-5 panels

---

## Implementation Order

1. **Tank Form Validation** - Self-contained, low risk
2. **Dashboard Nav Visibility** - Touches multiple HTML files but simple CSS change
3. **Compare Tool Expansion** - Most complex, requires JS logic updates

---

## Testing Checklist

### Tank Form Validation
- [ ] Empty name shows error, blocks save
- [ ] Zero/empty size shows error, blocks save
- [ ] Valid inputs save successfully
- [ ] Error clears when user types in field
- [ ] Existing tanks still edit correctly

### Dashboard Nav Visibility
- [ ] Logged out: Dashboard hidden, Login/Sign Up visible as buttons
- [ ] Logged in: Dashboard visible as button, Login/Sign Up hidden
- [ ] Dashboard page: Dashboard link stays visible
- [ ] Mobile nav works correctly in both states

### Compare Tool Expansion
- [ ] Initial load shows 3 panels
- [ ] "Add Species" reveals 4th panel
- [ ] Second click reveals 5th panel
- [ ] Button hides after 5th panel
- [ ] All 5 species included in comparison results
- [ ] Responsive layout handles 4-5 panels gracefully
- [ ] Clear selection works for panels 4 and 5
