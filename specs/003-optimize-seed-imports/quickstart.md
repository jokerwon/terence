# Quickstart Guide: 优化 Seed 项目组件引入方式

**Feature**: 003-optimize-seed-imports
**Branch**: `003-optimize-seed-imports`
**Estimated Time**: 15-20 minutes
**Difficulty**: Beginner

## Overview

本指南将带你完成将 seed 项目从"复制源码"模式改为"workspace 依赖"模式的过程。这是一个简单但重要的优化,可以减少代码冗余并简化维护。

---

## Prerequisites

Before starting, ensure:

- ✅ You are on the `003-optimize-seed-imports` branch
- ✅ You have read the [feature specification](./spec.md)
- ✅ You have read the [research document](./research.md)
- ✅ You understand the [package export structure](./data-model.md)

---

## Phase 1: Prepare Workspace (2 min)

### Step 1.1: Verify Current State

Check the current structure:

```bash
# Check that seed project has local UI components
ls -la apps/seed/src/ui/OrderForm/

# Expected output:
# OrderForm.adapter.js
# OrderForm.logic.js
# OrderForm.view.jsx
# index.js
```

Check current imports in seed:

```bash
# View current import statement
grep "import.*OrderForm" apps/seed/src/pages/OrderPage.jsx

# Expected output:
# import { OrderFormView } from '../ui/OrderForm';
```

### Step 1.2: Verify Workspace Dependencies

Ensure pnpm workspace is configured:

```bash
# Check pnpm workspace configuration
cat pnpm-workspace.yaml

# Expected output:
# packages:
#   - 'packages/*'
#   - 'apps/*'

# Verify seed package.json has workspace dependencies
cat apps/seed/package.json | grep -A2 "dependencies"

# Expected output (should include):
# "@terence/core": "workspace:*",
# "@terence/ui": "workspace:*",
```

If workspace dependencies are missing, add them:

```bash
cd apps/seed
pnpm add @terence/core @terence/ui
cd ../..
```

---

## Phase 2: Update @terence/ui Package Exports (5 min)

### Step 2.1: Update components/index.js

Edit `packages/ui/src/components/index.js` to export OrderForm components:

```bash
# Open the file
nano packages/ui/src/components/index.js
# OR use your preferred editor
code packages/ui/src/components/index.js
```

Replace the content with:

```javascript
/**
 * UI Components - Reusable presentational components
 */

// OrderForm 组件
export {
  OrderFormView,
  useOrderFormAdapter
} from './OrderForm/index.js';

export {
  formatAmount,
  validateItemInput,
  calculateItemSubtotal
} from './OrderForm/OrderForm.logic.js';
```

**Save the file** (Ctrl+O, Enter, Ctrl+X in nano; or Cmd+S in VS Code).

### Step 2.2: Verify Top-Level Export

Check that `packages/ui/src/index.js` re-exports components:

```bash
cat packages/ui/src/index.js

# Expected output should include:
# export * from './components/index.js';
# export * from './adapters/index.js';
# export * from './hooks/index.js';
# export * from './shared/index.js';
```

If it doesn't, update it to match the expected output above.

### Step 2.3: Validate Exports

Test that the exports work:

```bash
# Test @terence/core exports (should already work)
node -e "const { createOrderEngine } = require('@terence/core'); console.log('✅ Core export:', typeof createOrderEngine)"

# Test @terence/ui exports (should now work)
node -e "const { OrderFormView } = require('@terence/ui'); console.log('✅ UI export:', typeof OrderFormView)"
```

Expected output:
```
✅ Core export: function
✅ UI export: function
```

If you see errors, check:
- Did you save the file?
- Did you run `pnpm install`?
- Check for typos in the export statements

---

## Phase 3: Update Seed Project Imports (5 min)

### Step 3.1: Update Import Statement in OrderPage.jsx

Edit `apps/seed/src/pages/OrderPage.jsx`:

```bash
# Open the file
nano apps/seed/src/pages/OrderPage.jsx
# OR
code apps/seed/src/pages/OrderPage.jsx
```

Find this line (around line 14):

```javascript
import { OrderFormView } from '../ui/OrderForm';
```

Replace with:

```javascript
import { OrderFormView } from '@terence/ui';
```

**Save the file**.

### Step 3.2: Verify Import Changes

Check that all imports are now from workspace packages:

```bash
grep "import.*from.*@terence" apps/seed/src/pages/OrderPage.jsx

# Expected output:
# import { createOrderEngine } from '@terence/core';
# import { OrderFormView } from '@terence/ui';
```

Verify there are no local imports:

```bash
grep "import.*from.*\.\./ui" apps/seed/src/pages/OrderPage.jsx

# Expected output: (empty - no results)
```

---

## Phase 4: Cleanup - Delete Local UI Components (3 min)

### Step 4.1: Delete the ui/ Directory

Remove the copied UI components from seed:

```bash
# Remove the entire ui directory
rm -rf apps/seed/src/ui/

# Verify deletion
ls apps/seed/src/

# Expected output: (should NOT include 'ui' directory)
# App.jsx
# main.jsx
# pages/
```

### Step 4.2: Verify Code Reduction

Check the reduction in lines of code:

```bash
# Count lines in seed project
find apps/seed/src -name "*.js" -o -name "*.jsx" | xargs wc -l

# Expected: ~200 lines (down from ~500 lines)
```

---

## Phase 5: Build and Test (5 min)

### Step 5.1: Reinstall Dependencies

Ensure workspace links are created:

```bash
pnpm install
```

You should see output indicating workspace dependencies are linked:
```
... @terence/core -> packages/core
... @terence/ui -> packages/ui
```

### Step 5.2: Build Seed Project

Test that the build succeeds:

```bash
pnpm --filter @terence/seed build
```

**Expected**: Build completes without errors.

**If you see errors**:
1. Check that `@terence/ui` is in `apps/seed/package.json` dependencies
2. Check that `packages/ui/src/components/index.js` has the exports
3. Check for typos in import statements

### Step 5.3: Start Dev Server

Start the development server:

```bash
pnpm --filter @terence/seed dev
```

**Expected**: Server starts at http://localhost:3000

### Step 5.4: Manual Testing

Open your browser and go to http://localhost:3000

**Test Checklist**:
- [ ] Page loads without errors
- [ ] OrderForm component renders correctly
- [ ] "添加示例商品" button works
- [ ] Order items display correctly
- [ ] "提交订单" button works
- [ ] Engine state displays correctly
- [ ] No console errors

If any test fails:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed imports
4. Verify the import path is correct

---

## Phase 6: Verification and Cleanup (5 min)

### Step 6.1: Run ESLint

Check for linting errors:

```bash
pnpm --filter @terence/seed lint
```

**Expected**: No linting errors related to imports.

### Step 6.2: Verify Git Changes

Check what files changed:

```bash
git status

# Expected changes:
# modified:   packages/ui/src/components/index.js
# modified:   apps/seed/src/pages/OrderPage.jsx
# deleted:    apps/seed/src/ui/OrderForm/OrderForm.adapter.js
# deleted:    apps/seed/src/ui/OrderForm/OrderForm.logic.js
# deleted:    apps/seed/src/ui/OrderForm/OrderForm.view.jsx
# deleted:    apps/seed/src/ui/OrderForm/index.js
```

View the diff:

```bash
git diff packages/ui/src/components/index.js
git diff apps/seed/src/pages/OrderPage.jsx
```

### Step 6.3: Verify Success Criteria

Check against success criteria from the spec:

- [ ] **SC-001**: Code reduced by ~60% (verify with `wc -l`)
- [ ] **SC-002**: 100% of imports use `@terence/ui` and `@terence/core`
- [ ] **SC-003**: Build succeeds with 0 errors
- [ ] **SC-004**: All components exported from `@terence/ui`
- [ ] **SC-005**: Uses latest code automatically (test by modifying a component in packages/ui)

Test SC-005:

```bash
# In one terminal, start dev server
pnpm --filter @terence/seed dev

# In another terminal, modify a component in packages/ui
echo "console.log('Test change')" >> packages/ui/src/components/OrderForm/OrderForm.view.jsx

# Refresh browser - you should see the console.log
# Verify that the change appears without any manual copying
```

---

## Troubleshooting

### Issue: Module not found: '@terence/ui'

**Solution**:
```bash
# Ensure dependencies are installed
pnpm install

# Check that @terence/ui is in package.json
cat apps/seed/package.json | grep "@terence/ui"

# If missing, add it
cd apps/seed && pnpm add @terence/ui && cd ../..
```

### Issue: OrderFormView is not exported from @terence/ui

**Solution**:
```bash
# Check the exports file
cat packages/ui/src/components/index.js

# Should contain:
# export { OrderFormView } from './OrderForm/index.js';

# If missing, follow Phase 2, Step 2.1
```

### Issue: Build succeeds but component doesn't render

**Solution**:
```bash
# Check browser console for errors
# Look for:
# - Failed to resolve module
# - React component errors
# - Missing imports

# Common issue: Import statement typo
# Correct: import { OrderFormView } from '@terence/ui';
# Wrong:   import { OrderFormView } from '@terance/ui';  (typo)
```

### Issue: Vite cannot resolve @terence/ui

**Solution**:
```bash
# Check vite.config.js has path aliases
cat apps/seed/vite.config.js

# Should contain:
# resolve: {
#   alias: {
#     '@terence/core': path.resolve(__dirname, '../../packages/core/src'),
#     '@terence/ui': path.resolve(__dirname, '../../packages/ui/src')
#   }
# }

# If missing, add the aliases
```

---

## Next Steps

After completing this quickstart:

1. ✅ **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: optimize seed imports to use workspace dependencies

   - Update @terence/ui to export OrderForm components
   - Update seed to import from @terence/ui instead of local files
   - Delete redundant ui/ directory from seed project
   - Reduce code by ~60% while maintaining functionality

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

2. ⏭️ **Run the task generator**: `/speckit.tasks`
   - This will generate a detailed task list for review
   - Tasks will be organized by user story
   - You can track progress through the implementation

3. ⏭️ **Execute the tasks**: `/speckit.implement`
   - This will execute all tasks automatically
   - Or you can execute them manually following the task list

---

## Summary

What you accomplished:

✅ **Phase 1**: Verified workspace configuration
✅ **Phase 2**: Updated @terence/ui package exports
✅ **Phase 3**: Updated seed project imports
✅ **Phase 4**: Cleaned up redundant code
✅ **Phase 5**: Built and tested the changes
✅ **Phase 6**: Verified success criteria

**Results**:
- ✅ Code reduced by ~60%
- ✅ All imports use workspace packages
- ✅ Build succeeds with 0 errors
- ✅ Components are automatically synchronized
- ✅ Architecture principles maintained

**Impact**:
- 🎯 Reduced code duplication
- 🎯 Simplified maintenance
- 🎯 Automatic updates from packages/ui
- 🎯 Better monorepo practices
- 🎯 No breaking changes for external projects

---

**Questions?** Refer to:
- [Feature Specification](./spec.md) - User stories and requirements
- [Research Document](./research.md) - Technical decisions
- [Data Model](./data-model.md) - Package export structure
- [Package Exports Contract](./contracts/package-exports.yaml) - Export validation
