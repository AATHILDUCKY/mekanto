# Edit the Mekanto catalog

Edit `products.json` to manage products. Keep the store settings and categories at the top; add product entries inside `products`.

## Add a product

Copy `examples/product.json` into the `products` array, with a comma between entries. A new product only needs three fields:

```json
{
  "id": "device-stand",
  "title": "Device Stand",
  "category": "desk"
}
```

`id` is a unique lowercase slug with hyphens. Keep it stable because product links and saved carts use it. `title` is the product name shown on the site. `category` must match a category ID above. Prices are not displayed; customers request a quote on WhatsApp.

Add these when ready:

```json
{
  "id": "device-stand",
  "title": "Device Stand",
  "category": "desk",
  "description": "A compact printed stand for small devices.",
  "image": "https://example.com/device-stand.webp",
  "keywords": ["phone stand", "desk accessory"]
}
```

`image` can be a complete HTTPS URL or a path to a file in this site, such as `aseets/device-stand.webp`. If omitted, the site shows its neutral placeholder. If `description` is omitted, the site uses a short generic sentence. Search already checks the title, description, category and material, so `keywords` is only for extra terms or synonyms.

Optional fields for products include `featured` (show on the homepage), `imageAlt`, `subtitle`, `material`, `dimensions`, `compatibility`, `includes`, `features`, `badge`, and `colors`. `categories` can list additional category IDs. The existing shared image sheet uses `imageLayout: "atlas"` and `imagePosition` to select a quadrant; individual photos need neither.

## Add a category

Add an entry inside `categories` with a unique `id` and a `name`. You can also add `description` and `icon`. Products must use that category ID. Navigation and filters update automatically.

## Check your edits

```sh
python3 scripts/build-pages.py --check-only
```

The validator checks IDs, category references, optional prices and any image or keyword fields you supplied. `products.schema.json` provides editor validation and completion. The same checks run when GitHub Pages publishes the site.

## Supplied product posters

The original PNGs remain in `aseets/products/`. Run `python3 scripts/optimize-products.py` (requires Pillow) to regenerate 480px and 960px WebPs in `aseets/products/optimized/`. Use `imageLayout: "poster"` to display the full poster without cropping. The deployment stages optimized assets and excludes the source posters.

## Product-only images

Generated transparent source PNGs are saved in `aseets/products/generated/`; optimized square WebPs live in `aseets/products/cutouts/`. Run `python3 scripts/optimize-products.py --cutouts` to rebuild their 480px and 960px versions while preserving alpha. Use `imageLayout: "cutout"` for square product cards and responsive images. The catalog and gallery use these clean images instead of the supplied posters. Source PNGs are excluded from deployment; the originals remain available locally. Generation prompts are recorded in `scripts/product-image-prompts.json`.
