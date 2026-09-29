# Mekanto SEO

The GitHub Pages workflow generates `sitemap.xml` and `robots.txt` inside the published site. The sitemap contains the homepage, shop, every category filter URL, every product URL, custom page, gallery, journal, every article and about page. It updates automatically whenever `products.json`, `posts.json` or `gallery.json` changes and the GitHub Actions workflow publishes the site.

The current public domain is set in `products.json`:

```json
"siteUrl": "https://mekanto.com"
```

Change it only if the final public domain changes. Use a complete HTTPS URL without a trailing path, query or fragment. Canonical links, Open Graph image URLs, structured data, the sitemap and `robots.txt` all use this value.

Each public page has a title, description, canonical URL, Open Graph/Twitter preview tags and JSON-LD structured data. Product pages publish Product data; article pages publish BlogPosting data; category pages publish CollectionPage data. The cart, 404 page and legacy `.html` redirects are marked `noindex` because they should not appear in Google results.

## After deployment

1. Open `https://mekanto.com/sitemap.xml` and `https://mekanto.com/robots.txt`.
2. Add `https://mekanto.com/sitemap.xml` in Google Search Console after verifying your domain.
3. Inspect the home page, one category, one product and one article in Search Console.
4. Use Google's Rich Results Test for a product URL after the site is public.

The GitHub Actions method in [GITHUB-PAGES.md](GITHUB-PAGES.md) is required for automatic sitemap updates. Direct branch publishing serves the files but does not run the catalog validation or sitemap generator.
