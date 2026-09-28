# Mekanto

A responsive static storefront for custom 3D printing: drone frames, robotic arm parts, IoT enclosures and practical tech gadgets. Peach-orange, warm ivory, charcoal and sage form the minimal theme.

## Preview

```sh
python3 -m http.server 8080
```

Open **http://localhost:8080**. JSON content needs an HTTP server; do not double-click the HTML file.

## Publish on GitHub Pages

The included `.github/workflows/pages.yml` validates the catalog and publishes the static site. Upload this folder's contents to the repository root, then choose **Settings → Pages → Source → GitHub Actions** and push to `main` or run the workflow manually.

See [GITHUB-PAGES.md](GITHUB-PAGES.md) for complete deployment and project-path preview instructions. See [SEO.md](SEO.md) for sitemap, canonical URL and Google Search Console guidance. Relative links support both repository URLs and custom domains. No frontend build tool, npm runtime package, backend or API key is required.

## Mobile and WhatsApp

The mobile navigation uses a full-width dialog with large category rows, scrolling for short screens, a close button, backdrop dismissal, Escape support and keyboard focus wrapping and restoration. Its categories come from `products.json`.

The shop uses a compact Category/Sort toolbar on mobile. Categories open in an accessible bottom sheet with icons, counts, a selected state and an Apply button; desktop keeps the visible category row. Search, sorting and categories remain shareable through URL parameters.

**Create something custom** in the hero opens WhatsApp directly to **0754545398**, with a prepared design request and existing cart items. Product Add to cart saves the chosen finish and quantity, then opens the cart; Send cart on WhatsApp includes every item and subtotal. The optional custom page offers a text-only project brief. No image or file upload control is included.

Customers review the prepared message and tap Send in WhatsApp. The website does not automatically deliver a message. Text downloads remain available for keeping a copy.

## Edit content

- [products.json](products.json): store settings, descriptions, categories, keywords, image links, prices and details.
- [CATALOG.md](CATALOG.md): complete field reference and instructions for adding products/categories.
- [examples/product.json](examples/product.json): copyable product entry.
- [products.schema.json](products.schema.json): editor validation and completion.
- [posts.json](posts.json): journal headings and ordinary paragraphs. The first post is featured.
- [SEO.md](SEO.md): sitemap, crawlability and public-domain setup.

Navigation categories and footer category links update automatically. New products may belong to several categories. Keyword search is indexed once. Missing product images receive a local fallback.

## Shared application

`index.html`, the route folders (`shop/`, `product/`, `custom/`, `blog/`, `article/`, `about/`, `cart/`) and the required root `404.html` share `app.js`, `styles.css`, and assets in `aseets/`. Each route folder contains its own `index.html`; page URLs are `/shop/`, `/blog/`, and so on. Product links use `/product/?id=PRODUCT-ID`; articles use `/article/?id=POST-ID`. The site keeps its GitHub repository prefix automatically. Old root `.html` URLs redirect to the clean page while preserving query parameters and fragments. No SPA rewrite is required.

## Image-generation prompts

Use these prompts when making new product photos or website visuals. Keep the Mekanto look consistent: warm ivory background, peach orange **#DE7356**, graphite **#41413E**, muted sage **#8F9C83**, matte FDM layer texture, soft afternoon shadows, premium industrial-design photography, no text, logos, watermarks, borders or UI.

### Product image

```text
Premium ecommerce studio photograph of a [PRODUCT NAME], a compact useful 3D printed [PRODUCT TYPE]. The product is [PRIMARY COLOR] with visible fine matte FDM print layers, accurate functional details and believable proportions. Place it centered on a warm ivory seamless studio background, three-quarter isometric view, soft afternoon light from upper left, subtle grounded shadow, refined industrial design catalog styling. Leave generous clean margins around the product. No people, hands, text, logos, labels, watermark, packaging, UI, border or extra objects. Square 1:1 composition, high-detail realistic product photography.
```

### Drone / FPV product

```text
Premium studio photograph of a compact charcoal graphite 3D printed FPV drone frame, open X-shaped quadcopter layout with four arms and clear circular motor mounting holes. Add two separate peach-orange #DE7356 propellers beside the frame only if they help show scale; no motors, batteries or electronics. Warm pale ivory matte surface, soft natural afternoon shadows, three-quarter top-down camera angle, tactile FDM layer lines, precise hobby-maker engineering details, minimal premium product catalog style. No text, logos, watermark, person, hands, UI or border. Square 1:1 image with generous margin around the complete frame.
```

### Robotics part

```text
Premium industrial-design studio photograph of a compact desktop robotic arm component kit, made from terracotta peach #DE7356 3D printed linkage parts with graphite pivot housings and small metal fasteners. Show practical modular parts such as a gripper, servo mount, joint link and base plate arranged neatly, not a full-size factory robot. Warm ivory seamless background, soft directional afternoon light, subtle shadows, realistic matte polymer and fine FDM layers, three-quarter isometric view, calm minimal Mekanto visual language. No text, logos, watermark, person, UI or decorative objects. Square 1:1 composition.
```

### IoT / Raspberry Pi enclosure

```text
Premium studio product photograph of a compact sage green #8F9C83 3D printed electronics enclosure for a [BOARD NAME]. Show accurate port cutouts, ventilation slots, a removable lid and optional internal mounting posts. The enclosure is on a warm ivory seamless background with a small graphite detail for contrast, soft afternoon shadows, visible matte FDM print texture, three-quarter isometric camera angle, refined minimal maker-brand styling. No visible brand logos, text, labels, people, hands, UI, watermark or border. Square 1:1 composition with clear space around the product.
```

### Homepage feature image

```text
Premium custom 3D printing storefront feature photograph, landscape 16:10 composition. Arrange a charcoal FPV drone frame, peach-orange #DE7356 robotic arm parts, a sage green IoT enclosure and one useful desk gadget on a warm ivory studio surface. Keep the arrangement realistic, compact and beautifully spaced, with soft long afternoon shadows, matte FDM print layers and refined industrial design art direction. Leave clean negative space on the [LEFT OR RIGHT] third for website copy. No text, logos, watermarks, people, UI, borders or clutter. High-detail, photorealistic product photography.
```

Save product photos as WebP in `aseets/`, use a square image where possible, then set the relative image path and meaningful `imageAlt` text in `products.json`. See [CATALOG.md](CATALOG.md) for the product fields and [DESIGN-NOTES.md](DESIGN-NOTES.md) for the original image references.

## Lightweight assets

Optimized WebP images, explicit dimensions, lazy loading below the fold, deferred scripts, local component CSS, native dialogs/accordions and inline SVG icons. Tailwind Browser CDN 4.3.0 and Google Fonts remain included as requested, with local CSS and system-font fallbacks. No analytics or animation framework is included.

## Business details

Prices, dimensions, compatibility and imagery remain sample concepts to confirm before launch. WhatsApp is the quote/order discussion channel; this site does not collect online payment. No repository or live deployment was created during this work.

[Research and image provenance](DESIGN-NOTES.md) · [Verification](TESTING.md)
