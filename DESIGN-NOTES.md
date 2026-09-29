# Design and research

## Visual direction

The supplied reference sets the exact accent: **#DE7356**. Warm ivory, charcoal, muted sage, fine dividers and generous spacing keep the site quiet. Darker orange **#A8452C** is used for small colored text; the large hero accent uses **#D76A4E** to clear the 3:1 large-text contrast threshold. Surfaces use flat colors; product imagery supplies texture and depth. Manrope headlines pair with DM Sans body copy.

The design skill's initial generic luxury recommendation was not a good match. A narrower Minimalism & Swiss Style search supported the final lightweight direction. The user's palette takes precedence over generic palette recommendations.

## Research

- [Baymard: visible mobile product categories](https://baymard.com/research-articles/main-navigation-product-categories) informed direct category links in mobile navigation.
- [Baymard: mobile search and navigation](https://baymard.com/research-articles/mobile-ecommerce-search-and-navigation) informed prominent search and useful query terms.
- [Prusa filament material guide](https://help.prusa3d.com/filament-material-guide) informed the plain-language material discussion.
- [Prusa on ASA](https://blog.prusa3d.com/asa-prusament-is-here-learn-everything-about-the-successor-to-abs_30636/) informed outdoor material notes.
- [Tailwind Play CDN](https://tailwindcss.com/docs/installation/play-cdn) verified the requested CDN approach and its production limitation.

The retrieved mekanto.com page showed unrelated water-sports template content at research time, so no business facts were taken from it. The user's 3D-printing description is the source of the business direction.

Categories reflect how people shop: Desk & everyday, Raspberry Pi, Drones & FPV, IoT & electronics. Product information includes material, dimensions, compatibility and included items. Blog posts are original, editable prose with source links. No testimonials, order counts or delivery guarantees were fabricated.

## Asset provenance

The built-in image generation tool produced `aseets/hero.webp` and `aseets/products.webp`. They represent product concepts. Original PNGs remain in the tool's generated-image folder; project copies are encoded as smaller WebP assets without creative modifications. `materials.svg`, `favicon.svg` and inline icons are original code-native vectors.

### Hero generation prompt

Use case: product-mockup. Asset type: premium 3D printing storefront hero photograph, square composition. A beautiful minimalist studio still life of three real FDM 3D printed desktop and electronics objects on a warm pale sand matte surface and matching background: back right a large terracotta peach orange (#DE7356) sculptural cylindrical pencil cup with deep vertical fluting, containing three dark graphite pencils; front left a small dark charcoal rectangular Raspberry Pi electronics enclosure with fine horizontal 3D print layer lines, rounded corners, accurate ventilation slot grid and little port cutouts; front right a peach orange low curved cable organizer with three slots holding one off-white cable looping elegantly. Objects arranged like a premium industrial design brand catalog, dramatic but soft afternoon sunlight from upper left, believable soft long shadows, tactile matte plastic microtexture. Camera three-quarter view from slightly above, 70mm lens, editorial product photography, refined art direction, warm muted color palette. Objects occupy center and lower two thirds, generous clear warm beige negative space across upper 15 percent for website annotation added later. No text, letters, numbers, logos, watermarks, UI or borders. Output high quality square image.

### Catalog generation prompt

Use case: product-mockup. Asset: a precise 2 by 2 contact sheet for a premium 3D printed product catalog. Square overall image divided into four exactly equal square quadrants with no visible dividing lines. Each quadrant is an independent beautiful studio product photograph, subject centered with generous margins, three-quarter isometric view, matte FDM print lines, soft shadows, NO text or logos. TOP LEFT quadrant: charcoal black low Raspberry Pi enclosure with rounded corners, ventilation slots on top, realistic USB and ethernet openings, on light warm gray background. TOP RIGHT quadrant: terracotta peach #DE7356 triple arch cable organizer with a white cable threading through one arch, on pale peach ivory background. BOTTOM LEFT quadrant: charcoal gray open X shaped quadcopter drone frame only, four robust arms ending in circular mounting holes, no propellers, no motors, industrial plastic construction, on pale cool gray background. BOTTOM RIGHT quadrant: sage green small rectangular IoT electronics enclosure with lid beside it, showing empty inner mounting posts and ventilation slots on lid, on pale sage gray background. Precise 2x2 layout equal quadrant sizes, product objects remain strictly in their own quadrant with at least 12% margin on every edge of each quadrant. Consistent camera, realistic 3D print plastic textures, premium industrial design catalog photographic quality, no borders or labels.


## Maker homepage and WhatsApp update

The new homepage uses three original technical concept photographs from the built-in image generation tool: `aseets/maker-hero.webp`, `aseets/robotics.webp`, and `aseets/iot.webp`. Generated outputs were inspected and encoded as WebP; the original desktop hero is reused for the gadget section. Below-the-fold images remain lazy-loaded. New topics have direct category links and context-prefilled custom forms.

WhatsApp requests use the supplied Sri Lankan number 0754545398 in international format, 94754545398. [WhatsApp's official click-to-chat guide](https://faq.whatsapp.com/5913398998672934) describes encoded, pre-filled messages. Customers tap Send in WhatsApp; reference files are attached in chat. Both cart and custom messages include the full saved cart.

### Final maker-hero generation prompt

Use case: product-mockup. Asset type: a premium custom 3D printing storefront hero photograph, square, no text. Warm pale sand studio surface and matching background, generous negative space in the upper left, refined product design photography with believable soft afternoon shadows. A precisely detailed charcoal gray open X-shaped 3D printed quadcopter drone frame lying at front left, four arms and motor mounting holes clearly recognizable; beside it two loose peach-orange two-blade propellers lying flat and separate from the frame. Back right a compact desktop robotic arm assembled from terracotta peach #DE7356 FDM printed linkage parts with graphite circular pivot housings, sitting on a dark round base, two articulated links and a small open parallel gripper. Foreground right a sage green small IoT enclosure with ventilated lid and tiny visible USB opening. Entire arrangement grounded on one matte surface. Clearly visible tactile fine print layers, matte polymer, accurate product edges, premium realistic studio photograph, three-quarter camera angle, warm muted palette, fully visible objects with ample margins. No text, logos, watermark, person, UI or decorative typography. Product subjects not full-size industrial machines, compact hobby maker components.

### Final robotics generation prompt

Use case: product-mockup. Asset type: premium 3D printing website robotics feature photography. Square composition. A compact desktop robotic arm made of beautiful matte terracotta peach-orange #DE7356 FDM printed structural links and charcoal pivot housings, mounted on a round charcoal base. Two articulated arm segments ending in a small symmetrical open parallel gripper, credible joint geometry and visible small dark fasteners. At its base lie two loose peach printed servo brackets and a separate charcoal gripper finger part. Warm ivory studio backdrop and surface, fine print-layer texture, close refined industrial design still life, three-quarter view, natural afternoon light, soft believable shadows, spacious clear framing with complete object and parts visible, understated premium design. No text, logo, watermark, people, complex machinery or electronic cables.

### Final iot generation prompt

Use case: product-mockup. Asset type: premium IoT 3D enclosure feature photograph, square. Precisely photographed custom FDM printed electronics project objects on a pale muted sage-gray matte tabletop and matching background: a sage green rounded rectangular sensor enclosure open with an attractive green development circuit board mounted on four inner posts, small simple electronic components and a dark USB connector; its sage slotted removable lid lying to the right. Behind left a compact charcoal Raspberry Pi case with horizontal ventilation slots. Foreground a peach orange printed sensor mounting bracket with two circular screw holes and a small graphite sensor module next to it. A short ivory USB cable arcs naturally near the edge. Camera three-quarter from above, tactile fine print lines, restrained orange charcoal sage palette, premium studio product photography with soft daylight and believable shadows, lots of breathing room, compact hobby electronics scale. No text, logos, watermarks, UI, hands or people.


## Mobile navigation and static hosting update

The mobile dropdown is now a native modal dialog below the header, with a scrollable category area and a pinned WhatsApp action. Large rows, category descriptions/counts, a close control, backdrop dismissal and explicit focus wrapping keep navigation usable on small touch screens and keyboards. The 320px header retains 44px search/menu controls without horizontal overflow.

Categories and footer links are generated from products.json. Products can use multiple categories, indexed keywords and their own image links; image errors receive a local neutral placeholder. The custom hero action opens a prepared WhatsApp message directly, and the optional custom brief contains text fields only.

GitHub Pages uses real HTML routes and relative asset links. The included workflow validates the catalog, stages public files, supplies the repository base path to the 404 page, and deploys through the standard Pages artifact flow. Deployment research: [GitHub publishing sources](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and [configure-pages outputs](https://github.com/actions/configure-pages/blob/v5/action.yml). No live deployment was performed.


## Compact mobile filtering and clean routes

The mobile shop replaces wrapped category chips with a two-cell Category/Sort bar. A native bottom-sheet dialog reveals dynamic category options, counts and draft selection; Apply updates the product grid and shareable query string, while closing cancels the draft. The sort select fills its entire cell for touch input. Desktop keeps the category row. Targeted skill searches returned mobile-first and responsive visibility guidance; no specific progressive-disclosure match was found, so the dialog behavior uses the skill's general touch, focus and form guidance.

Clean URLs use real one-level page directories with index.html files, relative base paths for shared assets and compatibility redirects from old root .html URLs. Direct entry and refresh remain static-server operations. Hosting references: [GitHub site creation and directory structure](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) and [custom 404 pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site).


## Image-only gallery

The new gallery follows the existing Mekanto palette and type rather than adopting the generic palette returned by the design search. The UI/UX guidance supported a minimal grid, responsive object-fit images, reserved image space, visible keyboard focus, 44px controls, subtle motion and explicit submission feedback. The gallery uses a stable CSS Grid masonry effect instead of rearranging CSS columns, then appends ten JSON entries near the scroll boundary. No visible captions compete with the images; selection state uses both a peach outline and check icon. Reduced-motion users receive static image states.
