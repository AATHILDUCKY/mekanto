# Publish Mekanto on GitHub Pages

The site is static HTML, CSS, JavaScript and JSON. It works at a repository URL such as `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`, or at a configured custom domain. No backend, API key, npm runtime install or frontend bundle is required.

## Recommended: included GitHub Actions workflow

1. Create a GitHub repository and upload this folder's contents to its root. Include the `shop/`, `blog/`, `product/`, `article/`, `custom/`, `about/`, `cart/` and `aseets/` folders, plus hidden `.github` and `.nojekyll` files. `index.html` must be at the repository root, not inside another project folder.
2. Use a branch named `main`. If your branch has a different name, edit the `branches` value in `.github/workflows/pages.yml`.
3. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Publish Mekanto to GitHub Pages → Run workflow**, or push a change to `main`.
5. After the workflow succeeds, open the URL shown in the deployment or Pages settings.

The workflow validates catalog data, stages public files in `.site`, generates `sitemap.xml` and `robots.txt`, uploads the artifact, and deploys it. The `github-pages` environment and normal GitHub permissions are used; no personal access token is needed. It follows [GitHub's custom Pages workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Public files include index.html, 404.html, the seven route folders with index.html entries, legacy .html redirect files, app.js, styles.css, products.json, posts.json, products.schema.json, .nojekyll and aseets/. Developer notes, examples, validation scripts and workflow source are not included in the deployment artifact.

## Alternative: publish directly from a branch

For a simpler deployment, choose **Settings → Pages → Source → Deploy from a branch → main → /(root) → Save**. The included `.nojekyll` file avoids a Jekyll build. See [GitHub's publishing source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

The application works without running the staging script. The Actions workflow is recommended because it validates edits before publishing, generates the sitemap and robots rules, limits the deployed files, and adjusts the 404 page's base path for nested missing URLs. Direct branch publishing does not regenerate SEO files when the catalog changes.

## Preview the deployment locally

```sh
python3 scripts/build-pages.py --check-only
python3 scripts/build-pages.py --output .site
python3 -m http.server 8080 --directory .site
```

Open `http://localhost:8080/`.

To simulate a GitHub project path:

```sh
python3 scripts/build-pages.py --output /tmp/mekanto-preview/my-repo --base-path /my-repo
python3 -m http.server 8081 --directory /tmp/mekanto-preview
```

Open `http://localhost:8081/my-repo/`. The site's HTML links and asset paths are relative, so no repository name needs to be hard-coded into normal pages. The workflow obtains the path from GitHub Pages metadata for the 404 page.

## Clean page URLs

The pages use real directories with an `index.html` file inside each:

| Page | URL on mekanto.com | GitHub project URL suffix |
|---|---|---|
| Shop | `/shop/` | `/YOUR-REPOSITORY/shop/` |
| Blog | `/blog/` | `/YOUR-REPOSITORY/blog/` |
| Custom project | `/custom/` | `/YOUR-REPOSITORY/custom/` |
| About | `/about/` | `/YOUR-REPOSITORY/about/` |
| Cart | `/cart/` | `/YOUR-REPOSITORY/cart/` |
| Product | `/product/?id=PRODUCT-ID` | `/YOUR-REPOSITORY/product/?id=PRODUCT-ID` |
| Article | `/article/?id=POST-ID` | `/YOUR-REPOSITORY/article/?id=POST-ID` |

The trailing slash identifies a directory and avoids displaying `.html`. These pages can be opened directly or refreshed because the HTML files actually exist at those paths. No history-only URL trick or catch-all redirect is used. This follows [GitHub's static publishing directory structure](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

Nested pages use a relative `<base href="../">` to load shared assets and navigate within the site. Keep the route directory one level below the root. The old root `.html` files are small compatibility redirects that preserve query strings and fragments. If an explicit `index.html` URL is opened, the application normalizes it to the equivalent directory URL. The standard error document remains root `404.html`, as specified in [GitHub's custom 404 guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site).

## Update products after launch

Edit `products.json`, add the product image to `aseets/` or provide a complete HTTPS image URL, then commit and push. With the Actions source configured, the workflow validates and publishes the update. [CATALOG.md](CATALOG.md) explains the fields and includes a copyable example.

Keep local image links relative, e.g. `aseets/device-stand.webp`. A leading `/aseets/...` would point outside a repository subpath. Filename case matters on GitHub Pages. For external image links, use HTTPS and a host that permits displaying its images on other sites.

## Optional custom domain

Configure `mekanto.com` in **Settings → Pages → Custom domain** and follow GitHub's DNS instructions for your domain provider. This project does not preconfigure DNS or assume your GitHub username. Using the included workflow, GitHub Pages settings supply the proper base path for a custom domain as well.

After a successful deployment, open `/sitemap.xml` and `/robots.txt` on the final domain, then submit the sitemap in Google Search Console. [SEO.md](SEO.md) contains the exact checks.

No repository was created and no live deployment was performed during this change.
