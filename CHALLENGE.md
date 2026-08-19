# BIKE24 Frontend Coding Challenge (Senior) — Bike Bundle Configurator

Welcome to the BIKE24 Frontend Coding Challenge! It's about a small **bike configurator**: customers select a bike, get compatible accessories suggested, see stock levels, and complete an order.

> ⏱ **Time budget:** Plan for **no more than 5 days alongside your regular work** — realistically more like 8–12 hours of total effort, spread across the week. In this short amount of time, we do **not** expect everything to be finished down to the last detail at the end. Prioritization is explicitly part of the evaluation: document in the README what you deliberately left out or simplified, and why.

---

## The Rules of the Game

- **Next.js (App Router) is mandatory.** Make deliberate use of Server Components, Client Components, and at least one Route Handler.
- **TypeScript is mandatory.**
- We expect unit tests and at least one integration/E2E test. Framework of your choice.
- Deliver the code in a GitHub repository. We will run it locally and test it.
- Avoid a single commit at the end — we will also look at the commit history.
- You may use libraries, but be prepared to justify why you chose them specifically.
- A simulated **stock service** provides the information how many items are available — deliberately with artificial latency and an error rate of about 10%, to test resilience. How exactly you build this service is up to you.
- Briefly note in the README how you would deploy the app on a cloud provider (caching, environment variables, rollback strategy).

*Note: You'll find the product and accessory data in the `data` folder (details below).*

---

## Provided Data

- `bikes.json` — list of bikes (id, name, frameType, price, taxRate)
- `accessories.json` — accessories (id, name, price, taxRate, compatibleFrameTypes[], maxAmount)

---

## Core Requirements (Must-have)

These points should work in the end:

1. As a customer, I want to be able to select a bike from a list.
2. As a customer, I want to see matching accessories for it — incompatible accessories (wrong frame type) must not be selectable.
3. As a customer, I want to set the quantity of an accessory via a slider, limited by its `maxAmount`.
4. As a customer, I want to add a bike + accessories as a bundle to the cart, with net and gross price (via `taxRate`).
5. As a customer, I want to view my cart and be able to delete individual items or the entire cart.
6. As a customer, I want the cart to be preserved when navigating between the configurator and the cart page.
7. As a customer, I want to see a clear success or error message when completing an order — including the case where the stock service is currently failing.
8. The product catalog (bikes/accessories) should be loaded server-side.

## Bonus Requirements (optional — choose 2–3 if time allows)

These points are **not** mandatory, but an opportunity to show senior-level signal. Better to implement 2 of these cleanly than all of them halfway.

- **Optimistic UI:** "Add to cart" responds immediately, and performs a clean rollback with user feedback in case of a stock error.
- **Race conditions:** Rapidly dragging the quantity slider or adding items multiple times in quick succession does not lead to inconsistent state.
- **i18n:** Product names/prices in German and English, switchable.
- **A11y:** Slider and progress indicator fully operable via keyboard, cart total announced via `aria-live`.
- **Caching strategy:** Deliberate use of ISR/`revalidate` or tag-based revalidation for the product catalog, justified in the README.
- **Limit of max. 10 different product types in the cart**, with a visual progress indicator.

---

## What We Look At

Brief and honest, without claim to completeness:

- Whether the boundary between Server and Client Components feels deliberate or arbitrary.
- How the unstable stock service is handled (happy path only vs. real error handling).
- Whether state architecture decisions (e.g. cart persistence) are justified.
- Whether tests check behavior, not just implementation details.
- Whether the commit history shows comprehensible, meaningful steps.
- Whether the README transparently states what was deliberately not implemented due to time constraints.

---

### Good luck 🚲
