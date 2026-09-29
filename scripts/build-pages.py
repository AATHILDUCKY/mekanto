#!/usr/bin/env python3
"""Validate editable site data and stage only public files for GitHub Pages."""
import argparse
import html
import json
import math
import re
import shutil
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
ID = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
ROUTES = ('shop', 'product', 'custom', 'gallery', 'blog', 'article', 'about', 'cart')
PAGES = ('index', *ROUTES, '404')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def check_image(value, label):
    require(isinstance(value, str) and value.strip(), f'{label}: provide an image link.')
    parsed = urlparse(value)
    if parsed.scheme or parsed.netloc:
        require(parsed.scheme == 'https' and bool(parsed.netloc), f'{label}: external images must use a complete HTTPS URL.')
    else:
        require(not value.startswith('/'), f'{label}: use a relative path such as aseets/product.webp, without a leading slash.')
        path = (ROOT / unquote(parsed.path)).resolve()
        require(path.is_relative_to(ROOT) and path.is_file(), f'{label}: local image not found: {value}')


def public_site_url(store):
    value = store.get('siteUrl', '')
    parsed = urlparse(value)
    require(parsed.scheme == 'https' and bool(parsed.netloc), 'store.siteUrl must be a complete HTTPS URL, such as https://mekanto.com.')
    require(not parsed.query and not parsed.fragment, 'store.siteUrl cannot include a query string or fragment.')
    return value.rstrip('/')


def write_seo_files(output, catalog, posts):
    """Create crawlable URLs for stable pages, categories, products and articles."""
    site_url = public_site_url(catalog['store'])
    urls = [(f'{site_url}/', None), (f'{site_url}/shop/', None)]
    urls += [(f'{site_url}/shop/?category={item["id"]}', None) for item in catalog['categories']]
    urls += [(f'{site_url}/product/?id={item["id"]}', None) for item in catalog['products']]
    urls += [(f'{site_url}/custom/', None), (f'{site_url}/gallery/', None), (f'{site_url}/blog/', None)]
    urls += [(f'{site_url}/article/?id={item["id"]}', item.get('date')) for item in posts]
    urls += [(f'{site_url}/about/', None)]
    entries = []
    for loc, lastmod in urls:
        entries.extend(['  <url>', f'    <loc>{html.escape(loc, quote=True)}</loc>'])
        if lastmod: entries.append(f'    <lastmod>{html.escape(str(lastmod), quote=True)}</lastmod>')
        entries.append('  </url>')
    (output / 'sitemap.xml').write_text('\n'.join(['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', *entries, '</urlset>', '']))
    (output / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {site_url}/sitemap.xml\n')


def validate_catalog():
    data = json.loads((ROOT / 'products.json').read_text())
    require(data.get('schemaVersion') == 1, 'products.json: schemaVersion must be 1.')
    require(isinstance(data.get('store'), dict), 'products.json: store settings are required.')
    require(re.fullmatch(r'\d{8,15}', data['store'].get('whatsappNumber', '')), 'Store WhatsApp number must use digits in international format.')
    categories = data.get('categories', [])
    require(isinstance(categories, list) and categories, 'Add at least one category.')
    category_ids = set()
    for category in categories:
        cid = category.get('id', '')
        require(ID.fullmatch(cid) and cid not in category_ids, f'Invalid or duplicate category ID: {cid}')
        require(isinstance(category.get('name'), str) and category['name'].strip(), f'{cid}: add a category name.')
        category_ids.add(cid)
    products = data.get('products')
    require(isinstance(products, list), 'products must be an array.')
    product_ids = set()
    for product in products:
        pid = product.get('id', '')
        require(ID.fullmatch(pid) and pid not in product_ids, f'Invalid or duplicate product ID: {pid}')
        product_ids.add(pid)
        for field in ('name', 'description', 'category'):
            require(isinstance(product.get(field), str) and product[field].strip(), f'{pid}: {field} is required.')
        require(product['category'] in category_ids, f'{pid}: unknown primary category.')
        extra = product.get('categories', [])
        require(isinstance(extra, list) and all(c in category_ids for c in extra), f'{pid}: categories must contain existing category IDs.')
        price = product.get('price')
        require(isinstance(price, (int, float)) and not isinstance(price, bool) and math.isfinite(price) and price >= 0, f'{pid}: price must be a non-negative number.')
        keywords = product.get('keywords')
        require(isinstance(keywords, list) and all(isinstance(k, str) for k in keywords), f'{pid}: keywords must be an array of strings.')
        check_image(product.get('image'), pid)
        require(product.get('imageLayout', 'single') in ('single', 'atlas'), f'{pid}: imageLayout must be single or atlas.')
        if product.get('imageLayout') == 'atlas':
            require(product.get('imagePosition') in ('0% 0%', '100% 0%', '0% 100%', '100% 100%'), f'{pid}: atlas imagePosition must identify a quadrant.')
        for color in product.get('colors', []):
            require(isinstance(color.get('name'), str) and color['name'].strip() and re.fullmatch(r'#[0-9a-fA-F]{6}', color.get('hex', '')), f'{pid}: colors need a name and six-digit hex.')
    posts = json.loads((ROOT / 'posts.json').read_text()).get('posts', [])
    require(isinstance(posts, list) and posts, 'posts.json must contain at least one post.')
    post_ids = set()
    for post in posts:
        pid = post.get('id', '')
        require(ID.fullmatch(pid) and pid not in post_ids, f'Invalid or duplicate post ID: {pid}')
        post_ids.add(pid)
        require(post.get('relatedCategory') in category_ids, f'{pid}: unknown relatedCategory.')
        check_image(post.get('image'), pid)
    gallery = json.loads((ROOT / 'gallery.json').read_text())
    require(gallery.get('schemaVersion') == 1 and isinstance(gallery.get('images'), list), 'gallery.json must contain schemaVersion 1 and an images array.')
    gallery_ids = set()
    gallery_images = set()
    for item in gallery['images']:
        gid = item.get('id', '')
        require(ID.fullmatch(gid) and gid not in gallery_ids, f'Invalid or duplicate gallery ID: {gid}')
        gallery_ids.add(gid)
        require(isinstance(item.get('alt'), str) and item['alt'].strip(), f'{gid}: meaningful alt text is required.')
        require(not item.get('customerName') or isinstance(item['customerName'], str), f'{gid}: customerName must be text when provided.')
        image = item.get('image', '').strip()
        require(image not in gallery_images, f'{gid}: duplicate gallery image: {image}')
        gallery_images.add(image)
        check_image(image, gid)
    public_site_url(data['store'])
    return data, posts, len(products), len(categories), len(gallery_ids)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default='.site', help='Staging folder; never the project root.')
    parser.add_argument('--base-path', default='', help='GitHub Pages repository path, such as /mekanto.')
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    try:
        catalog, posts, products, categories, gallery_count = validate_catalog()
        if args.check_only:
            print(f'Catalog valid: {products} products, {categories} categories, {gallery_count} gallery images.')
            return
        output = Path(args.output).resolve()
        require(output != ROOT and not ROOT.is_relative_to(output), 'Choose a separate staging folder, not the project root or a parent.')
        output.mkdir(parents=True, exist_ok=True)
        for name in PAGES:
            source = ROOT / f'{name}.html'
            require(source.is_file(), f'Missing page: {source.name}')
            content = source.read_text()
            if name == '404':
                base = '/' + args.base_path.strip('/') + '/' if args.base_path.strip('/') else '/'
                content = content.replace('<head>', f'<head>\n  <base href="{html.escape(base, quote=True)}">', 1)
            (output / source.name).write_text(content)
        for name in ROUTES:
            source = ROOT / name / 'index.html'
            require(source.is_file(), f'Missing clean route: {name}/index.html')
            target = output / name
            target.mkdir(exist_ok=True)
            shutil.copy2(source, target / 'index.html')
        for name in ('app.js', 'styles.css', 'products.json', 'posts.json', 'gallery.json', 'products.schema.json', 'gallery.schema.json', '.nojekyll'):
            shutil.copy2(ROOT / name, output / name)
        shutil.copytree(ROOT / 'aseets', output / 'aseets', dirs_exist_ok=True)
        write_seo_files(output, catalog, posts)
        print(f'Ready: {products} products, {categories} categories, {gallery_count} gallery images. Public files staged in {output}.')
    except (ValueError, OSError, json.JSONDecodeError) as error:
        parser.exit(1, f'Site preparation failed: {error}\n')


if __name__ == '__main__':
    main()
