## ROOTS Design Tokens - NPM Package Info

This is the foundation for converting the design tokens to a published npm package (future).

### Package Structure

```json
{
  "name": "@roots/design-tokens",
  "version": "1.0.0",
  "description": "Centralized design system tokens for ROOTS marketplace (mobile, web, admin)",
  "main": "tokens.js",
  "types": "tokens.ts",
  "exports": {
    ".": {
      "import": "./tokens.js",
      "require": "./tokens.js",
      "types": "./tokens.ts"
    },
    "./react-native": "./react-native/index.js",
    "./css": "./css/design-tokens.css"
  },
  "keywords": [
    "design-system",
    "tokens",
    "color-palette",
    "typography",
    "spacing",
    "react",
    "react-native",
    "tailwind",
    "css"
  ],
  "author": "ROOTS Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/roots-marketplace/design-tokens"
  }
}
```

### Current Distribution

Currently, tokens are distributed via:

1. **Direct file import** (development mode)

   ```javascript
   // Mobile
   import tokens from "../../../shared/design-tokens/tokens.js";

   // Landing
   const tokens = require("../../shared/design-tokens/tokens.js");
   ```

2. **CSS custom properties** (admin)

   ```css
   @import "../../theme/design-tokens.css";
   ```

3. **Tailwind config** (landing)
   ```javascript
   const tokens = require("../../shared/design-tokens/tokens.js");
   ```

### Future: NPM Publication

When ready to publish as an npm package:

```bash
# Install from registry
npm install @roots/design-tokens

# Usage
import { COLORS, SPACING, Typography } from '@roots/design-tokens';

// Or with Tailwind
import tokens from '@roots/design-tokens';
```

---

### Monorepo Current State

The design tokens are currently managed as a **monorepo shared package**:

```
ROOTS/
├── shared/design-tokens/  ← Package root
│   ├── tokens.js          ← Source of truth
│   ├── tokens.ts          ← TypeScript definitions
│   └── ...
├── mobile/
│   └── depends on: ../shared/design-tokens/
├── admin/
│   └── depends on: ../shared/design-tokens/
└── roots-landing/
    └── depends on: ../shared/design-tokens/
```

Benefits:

- ✅ Single source of truth
- ✅ Easy to update all apps simultaneously
- ✅ No npm publish overhead
- ✅ Works offline
- ✅ Type-safe with TypeScript version included

---

### File Size & Performance

| File              | Size  | Gzipped |
| ----------------- | ----- | ------- |
| tokens.js         | ~4 KB | ~1.2 KB |
| tokens.ts         | ~6 KB | ~1.5 KB |
| design-tokens.css | ~8 KB | ~2 KB   |

When bundled into each app:

- Mobile: Included in React Native bundle (negligible)
- Admin: Inlined in Vite CSS output (~2 KB gzipped)
- Landing: Used via Tailwind (no runtime overhead)

---

### Maintenance Schedule

- **Review:** Quarterly
- **Updates:** As needed for design changes
- **Lock tokens:** Never change #185FA5, #0C447C, #3B6D11, #BA7517, #A32D2D, #1A1A1A
- **Add tokens:** Via pull request with justification

---

**Status:** Ready for production use across all 3 apps
