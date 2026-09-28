# Edit the Mekanto catalog

`products.json` is the single source of store settings, categories and products. It has a linked JSON Schema (`products.schema.json`) for editor completion and validation. The optional staging script checks IDs, category references, prices, keywords and image paths before GitHub Pages publication.

## Add a product

Copy [examples/product.json](examples/product.json) into the `products` array in `products.json`, separated from the previous entry by a comma. Change the ID, description, category, price, keywords and image link. Do not leave a comma after the last entry.

A compact entry works too:

```json
{
  "id": "device-stand",
  "name": "Device Stand",
  "description": "A compact printed stand for a phone or small display.",
  "category": "desk",
  "categories": ["desk", "iot"],
  "keywords": ["phone", "stand", "display", "mount", "gadget"],
  "image": "aseets/device-stand.webp",
  "imageAlt": "Peach 3D printed phone stand",
  "price": 1200,
  "material": "PETG",
  "colors": [
    {"name": "Peach", "hex": "#de7356"},
    {"name": "Graphite", "hex": "#41413e"}
  ]
}
```

Provide your own image file for the example link. If you need a temporary image, use `aseets/product-placeholder.svg`.

## Field reference

| Field | Meaning |
|---|---|
| `id` | Required unique lowercase ID with hyphens. Keep it stable for product links and saved carts. |
| `name` | Required product name. |
| `description` | Required plain-language description. Plain text, not HTML. |
| `category` | Required primary category ID. This is the label shown on cards. |
| `categories` | Optional additional category IDs. The product is discoverable in each category. |
| `keywords` | Required array of search terms, synonyms and hardware names. |
| `image` | Required relative image path or full HTTPS image URL. |
| `imageAlt` | Recommended meaningful description of the image. |
| `price` | Required non-negative number in `store.currency`, without a currency symbol. |
| `material` | Optional material label; defaults to “To discuss”. |
| `colors` | Optional color objects with `name` and six-digit `hex`. A standard finish is used if omitted. |
| `subtitle` | Optional short product benefit. |
| `dimensions` | Optional readable dimensions; defaults to custom sizing. |
| `compatibility` | Optional board, mounting and fit information. |
| `includes` | Optional description of the supplied parts. |
| `features` | Optional array of short feature statements. |
| `badge` | Optional card label. |
| `featured` | Optional true/false; featured entries can appear in the homepage's four-card collection. |
| `imageLayout` | Normally omitted or `single`. `atlas` is only for the existing contact sheet. |
| `imagePosition` | Atlas quadrant only: `0% 0%`, `100% 0%`, `0% 100%`, or `100% 100%`. |

Image links support `aseets/my-photo.webp`, `./aseets/my-photo.webp`, or `https://images.example.com/my-photo.webp`. Relative paths preserve GitHub project-site hosting. Use WebP/AVIF where practical. Product images load lazily, keep a stable footprint, and show a neutral fallback if an image cannot load.

Existing `tags` entries are accepted by the browser for backward compatibility, but use `keywords` for all new entries.

## Add a category

Add an object to the `categories` array:

```json
{
  "id": "device-mounts",
  "name": "Device mounts",
  "description": "A place for your device.",
  "icon": "cube"
}
```

Assign the category ID to the new product. Mobile navigation, homepage categories, shop filters and footer links update automatically. Useful existing icon names: `desk`, `chip`, `drone`, `robot`, `circuit`, `cube`, `tool`, `layers`. Unknown names use a cube.

## Search and performance

Search indexes are built once when the JSON loads. Queries match the name, subtitle, description, material, all assigned category names and keywords. Accents, punctuation and hyphens are normalized, so terms such as `servo-mount` remain easy to find. Product and category IDs use maps for lookups. Multiple-category filtering works without duplicate cards in the All objects view.

## Store settings

`store.whatsappNumber` is `94754545398` and `store.whatsappDisplay` is `075 454 5398`. WhatsApp uses digits in international format. Currency and locale are currently `LKR` and `en-LK`. Confirm real prices and compatibility before publishing; the included products are still sample concepts.

## Check your edits

```sh
python3 scripts/build-pages.py --check-only
```

This reports a clear error for duplicate IDs, unknown categories, invalid pricing, missing local images or malformed keywords. A GitHub Actions build runs the same checks before publishing.
