# BIKE24 Bundle Builder

A small Next.js bike configurator built for the BIKE24 frontend challenge. Customers choose a bike, configure compatible accessories, review a persisted cart, and place a simulated order after a final stock check.

## Quick start

Requirements: Node.js 20+, pnpm 11.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The main flow is:

1. `/bikes` — browse the server-loaded bike catalog.
2. `/bikes/[id]` — configure accessory quantities for a selected bike.
3. Add a bundle and choose whether to continue shopping or view the cart.
4. `/cart` — review bundles, totals, and place a simulated order.

Useful verification commands:

```bash
pnpm run test             # unit/component/API tests
pnpm run test:e2e         # Playwright browser journey
pnpm run lint
pnpm exec tsc --noEmit
pnpm run build
```

The Playwright web server sets `STOCK_FAILURE_RATE=0` so browser tests are deterministic. To exercise the failure state manually, use `STOCK_FAILURE_RATE=1 pnpm dev`.

## Architecture

### Server and client boundaries

- `src/lib/catalog/catalog.ts` is the typed catalog abstraction. Its JSON adapter is server-only, so the product catalog is loaded by Server Components rather than fetched into the browser.
- `/bikes` and `/bikes/[id]` are Server Component routes. They load catalog data, generate metadata, and compose the interactive configurator.
- `BundleConfigurator`, quantity controls, the add-to-cart dialog, `CartProvider`, and `CartView` are Client Components because they own browser interaction, localStorage, or client navigation.
- `src/app/api/stock/route.ts` and `src/app/api/orders/route.ts` are Route Handlers. The unstable stock service and final order validation stay on the server boundary.

### Catalog caching

Both catalog pages use `revalidate = 3600` and the detail route uses `generateStaticParams`, so catalog content can be statically generated and refreshed hourly. The catalog source is currently the supplied JSON fixtures; replacing it with an API-backed adapter would not change the page components.

Stock and order responses deliberately use `dynamic = "force-dynamic"` and `Cache-Control: no-store`. Availability is request-time data and must not be served from ISR or a shared response cache.

### Stock resilience

The simulated stock service has a fixed inventory map, approximately 450ms latency, and a default 10% failure rate. The configurator requests bike and accessory availability together, aborts stale requests when the selection changes, preserves a previous response during retries, and exposes a retry action.

The cart stores a snapshot under `bike24:cart:v1`. This keeps navigation and refreshes usable without requiring an account. The cart is not treated as authoritative inventory: `POST /api/orders` first validates product ids, compatibility, and per-bundle accessory limits against the server catalog, then aggregates quantities across all bundles and atomically reserves the requested stock. A successful reservation decrements the in-memory inventory; a shortage leaves inventory unchanged and returns the existing shortage response. The cart is cleared only after success.

## Testing strategy

- Pure unit tests cover compatibility, stock behavior, pricing, reducer transitions, storage validation, and order quantity aggregation.
- Component tests cover quantity controls, the add-to-cart dialog, cart totals, order success, and failed-order cart preservation.
- Route Handler tests cover request validation, response status codes, no-store headers, shortages, and stock-service errors.
- Playwright covers the catalog entry, compatibility journey, add-to-cart decision dialog, persisted cart, and successful simulated order.

## Deployment notes

The app can be deployed to Vercel with the standard Next.js build and start flow. The JSON catalog can be replaced by an API or database adapter behind the existing server catalog functions.

- Keep `STOCK_FAILURE_RATE` as a server-side environment variable. Production should use the default resilience behavior; tests and preview checks can set it to `0`.
- Do not cache `/api/stock` or `/api/orders`. Catalog pages may use the one-hour ISR window, while availability and order validation must remain request-time.
- Use Vercel preview deployments for review, promote only a verified build to production, and roll back by selecting the previous deployment if a release fails verification.
- A production inventory service would own durable reservation/decrement semantics and transactional order writes. This challenge keeps the service deterministic and in-memory, so reservations are race-safe during the server process lifetime but reset when the server process restarts.

## Deliberate scope decisions

The challenge prioritizes a complete, testable bundle flow over a full commerce platform. The following are intentionally simplified:

- The catalog is fixture-backed JSON rather than a real commerce API.
- Checkout is simulated; there is no payment provider, authentication, address form, or order database.
- Inventory reservations decrement stock during the server process lifetime but do not persist across restarts; there is no durable inventory or order database.
- There is no i18n switcher, optimistic rollback, ten-product-type cart limit, or advanced analytics because those are optional bonuses and were kept out to protect the core flow.
