# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-15

### Added

- Initial release of Business UI
- CLI tool with `add` and `list` commands
- Advanced Search component
  - Support for text, select, date, and number fields
  - Configurable column layouts (1-4 columns)
  - Search and reset functionality
  - useAdvancedSearch hook for custom implementations
- Data Table component
  - Based on TanStack Table v8
  - Sorting, pagination, and row selection
  - Customizable columns and cell rendering
  - Responsive design
- Form Wizard component
  - Multi-step form navigation
  - Step validation support
  - Visual step indicator
  - useFormWizard hook for custom implementations
- Complete documentation
  - Getting Started guide
  - Component API documentation
  - Customization examples
- Next.js example application
- Registry system for component distribution
- Monorepo structure with pnpm workspaces

### Dependencies

- React 18+
- TypeScript 5+
- Tailwind CSS 3+
- shadcn/ui base components
- @tanstack/react-table for DataTable
- Commander.js for CLI
- Enquirer for interactive prompts

## [Unreleased]

### Planned Features

- More business components
  - Dashboard widgets
  - File uploader
  - Rich text editor
  - Date range picker
  - Multi-select with tags
- Enhanced CLI features
  - Component updates
  - Version management
  - Custom templates
- Additional examples
  - Dashboard example
  - Admin panel example
  - E-commerce example
- Testing infrastructure
  - Unit tests with Vitest
  - Component tests with Testing Library
  - E2E tests with Playwright
- Documentation improvements
  - Video tutorials
  - Interactive playground
  - More customization guides

---

[0.1.0]: https://github.com/yourusername/business-ui/releases/tag/v0.1.0
