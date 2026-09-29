# Verification

Verified locally in headless Google Chrome with Playwright on 28 September 2026. The latest checks used a staged deployment at `/mekanto-preview/` to simulate a GitHub Pages repository URL.

## Current mobile navigation

Verified category links, category counts, large controls, body-scroll locking, close button, backdrop dismissal, Escape, restored focus and automatic closing when switching to desktop width. Tab and Shift+Tab cycle through visible menu controls. A 375 × 568 viewport keeps the menu inside the screen, with a scrolling category area and a visible WhatsApp action.

All nine pages (home, shop, product, custom, journal, article, cart, about and 404) passed at **320, 375, 768 and 1440 pixels: 36 combinations**. One H1 per page and no horizontal document overflow. The 320px header, short-screen menu and desktop homepage were visually inspected.

## WhatsApp and text-only requests

The hero's Create something custom action links directly to **94754545398**, opens a new tab and includes a prepared custom-design request. Existing cart items are included when present. The custom page has no image/file input and no reference-filename field in the prepared message.

Verified text-only custom submission and Add-to-cart redirect followed by the cart WhatsApp action under the repository path. Earlier cart checks also covered persistent multi-item selections, quantity changes, invalid quantity blocking, removal, selected colors/materials, dimensions, unit prices, item totals and subtotal. Text downloads remain available.

WhatsApp URLs were inspected or intercepted without sending test messages. Customers review the prepared message and tap Send in WhatsApp. The number's active account status was not independently verified.

## Future catalog changes

An intercepted JSON response added a sixth category and a compact sixth product without editing the real catalog. Verified automatic mobile/footer category links, multiple-category filtering, unique-keyword search, sensible defaults for omitted optional details, product-page navigation and a local image fallback when the product image failed to load. No JavaScript exceptions or unexpected missing local resources were recorded.

The staging validator passed the current catalog and a separate future-product/category fixture. It rejected duplicate IDs, unknown category references, negative prices, missing local images, HTTP external images and malformed keywords with the expected error messages. Fixture edits were isolated outside the site directory.

## Accessibility

Axe-core WCAG 2 A/AA and 2.1 AA checks reported **zero automated violations** on the current home, custom, shop, robotics product and open mobile menu. Earlier desktop/mobile cart and custom checks also passed. Automated checks do not replace a complete manual accessibility audit.

## GitHub Pages preparation

Verified relative links, assets, catalog fetches and checkout navigation under `/mekanto-preview/`. A simulated nested missing URL served the staged 404 page; its configured base path correctly resolved shared styles/scripts, the catalog and home link.

The workflow YAML parses successfully. Action versions, deployment permissions/environment and the Pages base-path output were checked against GitHub's official documentation. `node --check app.js` and `python3 scripts/build-pages.py --check-only` passed. The deployment staging script completed successfully.

No repository was created and no live Actions deployment was run. The user still needs to upload the files and enable GitHub Pages as described in [GITHUB-PAGES.md](GITHUB-PAGES.md).

## Assets and runtime

Local WebP images, explicit image dimensions, lazy loading below the fold, indexed keyword search and map-based product/category lookups remain in use. No new runtime CDN or framework dependency was added. Temporary browser packages, fixtures and screenshots are outside the site directory; the application needs no npm runtime install.


## Latest mobile shop and clean-route checks

The shop category chips are hidden on mobile and replaced with a compact Category/Sort bar. Verified opening the native category dialog, draft selection counts, Apply, cancellation without changing the existing category, Escape, backdrop dismissal, focus restoration, filtering, sorting, live search, clear filters and state preserved on reload. Desktop category controls remain visible and functional.

The clean directory routes passed all **36 page/width combinations** again. Direct product/article refreshes, custom category prefill, Add to cart → `/cart/`, cart WhatsApp, invalid category fallback and seven legacy `.html` redirects passed under the repository prefix. A simulated nested 404 link returned to `/mekanto-preview/shop/`. No page links pointed to old `.html` paths; no JavaScript exceptions or unexpected local 404s occurred.

The shop passed Axe WCAG 2 A/AA and 2.1 AA checks at 375px and 1440px. The open category sheet passed at 320 × 568, 375 × 812 and landscape 667 × 375, with no automated violations. Mobile shop, selected category sheet and desktop shop screenshots were inspected. No live deployment was performed.

Final checks on 29 September 2026 also passed on both root hosting and `/mekanto-preview/`: direct `/shop` and `/shop/` entry, explicit index.html canonicalization, query-preserving skip links, a sort control taller than 44px, and 18 consecutive Tab presses kept inside the category sheet.


## SEO and crawlability

The current staged deploy generated a valid XML sitemap with **23 public URLs**: home, shop, seven category URLs, seven product URLs, custom, gallery, journal, three articles and about. `robots.txt` points to `https://mekanto.com/sitemap.xml`. Sitemap checks verified every current category and product URL and verified that cart and 404 are excluded.

Catalog validation now requires `store.siteUrl` to be a complete HTTPS URL. Static checks passed for `app.js`, catalog validation, SEO staging and the HTTP response for a product URL. Public templates include canonical, Open Graph, Twitter and index/follow tags; cart, 404 and legacy redirect pages are noindex. Runtime page metadata emits Organization, CollectionPage, Product, Blog and BlogPosting JSON-LD as appropriate.


## Gallery

Verified the gallery at 320, 375, 768, 800, 900, 1000 and 1440 pixels with no horizontal overflow. The clean `/gallery/` route and legacy `gallery.html` redirect work under a GitHub Pages repository prefix. The first batch contains exactly 10 images; intersection loading appends the next two 10-image batches and stops at 30 with a clear end state.

Verified keyboard/button semantics, multi-selection, clearing, a 10-image limit and the fixed mobile action bar. The prepared WhatsApp message targets **94754545398** and contains the selected reference IDs, absolute image URLs and optional customer names. The gallery produced no browser exceptions and Axe WCAG 2 A/AA and 2.1 AA reported zero automated violations. The mobile and desktop gallery were visually inspected.

## Wall décor and mobile stands

Added seven-category responsive home navigation, two editorial collection cards, dedicated shop filters and complete product pages for Botanical Wall Triptych and Angle Charge Mobile Stand. Verified at 320, 390, 768 and 1440px with no horizontal overflow. Both optimized WebP assets loaded correctly; category filters returned the expected single product; product WhatsApp links and all four new sitemap URLs passed.
