/**
 * @terence/core - Business logic engines and services
 *
 * This package contains ONLY business logic with NO UI dependencies.
 * It provides:
 * - Engines: State machines and business logic orchestration
 * - Guards: Validation and business rule enforcement
 * - Services: Data access and external integrations
 * - Adapters: Interface adapters for external systems
 * - Utils: Pure utility functions
 *
 * Architecture constraints:
 * - MUST NOT depend on @terence/ui or any UI libraries
 * - MUST NOT depend on React, antd, or any view layer code
 * - MUST be testable in pure Node.js environment
 */

// Re-exports organized by module type
export * from './engines/index.js';
export * from './services/index.js';
export * from './guards/index.js';
export * from './adapters/index.js';
export * from './utils/index.js';
