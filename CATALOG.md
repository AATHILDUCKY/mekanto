# Edit the Mekanto catalog

Edit `products.json` to manage products. Keep the store settings and categories at the top; add product entries inside `products`.

## Add a product

Copy `examples/product.json` into the `products` array, with a comma between entries. A new product only needs four fields:

```json
{
  "id": "device-stand",
  "title": "Device Stand",
  "category": "desk",
  "price": 1200
}
```

`id` is a unique lowercase slug with hyphens. Keep it stable because product links and saved carts use it. `title` is the product name shown on the site. `category` must match a category ID above. `price` is a number in LKR, without a currency symbol.

Add these when ready:

```json
{
  "id": "device-stand",
  "title": "Device Stand",
  "category": "desk",
  "price": 1200,
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

The validator checks IDs, category references, prices and any image or keyword fields you supplied. `products.schema.json` provides editor validation and completion. The same checks run when GitHub Pages publishes the site.
