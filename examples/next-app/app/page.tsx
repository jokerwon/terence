import Link from 'next/link'

export default function Home() {
  return (
    <main className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Business UI Examples</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Explore our business component library with live examples
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/advanced-search"
            className="block p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Advanced Search</h2>
            <p className="text-sm text-muted-foreground">
              Multi-field search with text, select, date, and number inputs
            </p>
          </Link>

          <Link
            href="/data-table"
            className="block p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Data Table</h2>
            <p className="text-sm text-muted-foreground">
              Feature-rich table with sorting, pagination, and selection
            </p>
          </Link>

          <Link
            href="/form-wizard"
            className="block p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Form Wizard</h2>
            <p className="text-sm text-muted-foreground">
              Multi-step form with validation and progress tracking
            </p>
          </Link>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-muted">
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add these components to your project:
          </p>
          <pre className="bg-background p-4 rounded-md text-sm overflow-x-auto">
            <code>npx business-ui add advanced-search data-table form-wizard</code>
          </pre>
        </div>
      </div>
    </main>
  )
}
