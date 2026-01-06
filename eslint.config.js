import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        URLSearchParams: 'readonly',
        URL: 'readonly',
        location: 'readonly',
        history: 'readonly',
        navigator: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        FormData: 'readonly',
        FileReader: 'readonly',
        Image: 'readonly',
        Notification: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        // Firebase globals (loaded via CDN/modules)
        firebase: 'readonly',

        // Project globals (shared across script tags)
        fishDatabase: 'writable',
        fishDescriptions: 'readonly',
        authManager: 'writable',
        storageService: 'writable',
        tankManager: 'writable',
        maintenanceManager: 'writable',
        generateGlossaryEntry: 'readonly',
        generateGlossaryEntries: 'readonly',
        selectedSpecies: 'writable',
        compareSpecies: 'writable',
        toggleFavorite: 'writable',
        filterSpecies: 'writable',
        displayResults: 'writable',
        updateSelectedCount: 'writable',
        getCompatibilityClass: 'writable',
        initDashboard: 'writable',
        showSpeciesDetail: 'writable',
        addToTankPlan: 'writable',
        showNewTankForm: 'writable',
        cancelForm: 'writable',
        addSpeciesToTank: 'writable',
        saveTank: 'writable',
        filterSpeciesSelector: 'writable',
        searchGlossary: 'writable',
        showContributeInfo: 'writable',
        filterCategory: 'writable',
        searchFAQ: 'writable',
        addFavoriteStarsToResults: 'writable',
        buildPanels: 'writable',

        // Node.js CommonJS (for dual-environment files)
        module: 'readonly',
      },
    },
    rules: {
      // Catch real bugs
      'no-undef': 'error',
      // Disabled: too many false positives with HTML onclick handlers
      'no-unused-vars': 'off',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-func-assign': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-unexpected-multiline': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',

      // Best practices that prevent bugs
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-fallthrough': 'error',
      'no-global-assign': 'error',
      'no-redeclare': 'error',
      'no-self-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-useless-escape': 'warn',

      // Relaxed rules for this project
      'no-prototype-builtins': 'off', // Common in simple JS
    },
  },
  {
    // Ignore patterns
    ignores: ['node_modules/**', 'functions/node_modules/**', 'scripts/temp-images/**', '*.min.js'],
  },
];
