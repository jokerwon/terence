/**
 * @terence/ui - UI component adapters and views
 *
 * This package contains UI components with Adapter-View separation:
 * - Views: Pure presentation components (NO core imports)
 * - Components: Reusable UI elements
 * - Hooks: Custom React hooks
 * - Shared: Shared utilities and types
 *
 * Architecture constraints:
 * - CAN depend on @terence/core (in adapters only)
 * - MUST NOT depend on @terence/seed
 * - Views MUST be pure presentational (no core imports)
 */

// Re-exports organized by module type
export * from './components/index.js'
export * from './hooks/index.js'
export * from './shared/index.js'
