# PCOS, Made Simple: sales page

A single-page, responsive sales site for the book. Plain HTML, CSS and JavaScript. There is nothing to install and no build step.

## Run it on your computer

Open `index.html` in a browser. Or, for a closer match to a real website, run this in the folder and open http://localhost:8000:

    python3 -m http.server 8000

## Before you launch

1. **Checkout link.** Every "Get the book" button opens the Superprofile page. To change it, replace that address in `index.html` (search for `superprofile`). The price in the buy section (₹499, was ₹699) is plain text in `index.html`: search for `price__now` and keep it in step with Superprofile.

2. **Check the "What format is the book?" answer** in the FAQ (search `What format` in `index.html`). It currently says "a digital book you can read on your phone, tablet or computer". Change it if you deliver a PDF, an ePub or something else.

3. **Share-image address (done).** The site lives at `https://pcos-made-simple.vercel.app/`, and the share image, `og:url` and canonical link in the `<head>` of `index.html` use that address. If you move to your own domain, search `pcos-made-simple.vercel.app` in `index.html` and replace all three.

4. **Add legal pages** (privacy policy, terms, refund policy) and a contact email in the footer. Meta and most payment providers ask for them.

## Put it online

Any static host works: Netlify (drag the whole folder onto their deploy page), Cloudflare Pages, Vercel or GitHub Pages. Upload everything in this folder, keeping the `assets` folder as it is.

## What is where

    index.html            the page (all the copy is here)
    assets/css/styles.css colours, type, layout, animation
    assets/js/main.js     tabs, checklist, parallax, checkout link
    assets/img/           images in AVIF and WebP, each in 2 or 3 sizes, plus share image and icons
    assets/img/pages/     book pages for Look inside and the cheat sheets (480, 900 and 1400 wide)
    favicon.svg           browser tab icon
    _headers              cache rules (used by Netlify and Cloudflare Pages)

## Images and speed

- Every photo comes in AVIF (smallest) with WebP as a fallback, in 2 or 3 sizes. Each phone or computer downloads only the size it needs.
- The book cover loads first (it is preloaded). Every image further down loads only when the visitor scrolls near it.
- About 0.3 MB loads for the first screen, and about 0.6 MB for the whole page.
- One small font file (Carlito, about 35 KB) is preloaded; the bold weight loads only when needed.
- **To replace a photo**, keep the same file names and sizes (for example `food-01-600.avif`, `food-01-1000.avif`, `food-01-1400.avif` plus the `.webp` versions). Squoosh (squoosh.app) can export both formats.

## Look inside and cheat sheets

The page images come from the final book PDF: contents (PDF page 6), Introduction (7), Chapter 1 opener (14), In Simple Words (17), balanced plate (47), quick recipes (56), calming tools (87), Starter Checklist (145), Grocery List (165–166), Quick Meal Ideas (167), Questions to Ask Your Doctor (168–169) and the first 2 glossary pages (170–171). If the book changes, re-export those pages and keep the same file names.

## Notes


- **Fonts:** headings use Georgia, like the book. Everything else uses Carlito, the open-source twin of Calibri (the book's body font), self-hosted in `assets/fonts/` (about 35 KB per weight, SIL Open Font License). Visitors who already have Calibri, such as most Windows users, download nothing.
- **Colours** follow the book's style guide: Soft Rose `#C9727E`, Sage `#8FA98F`, Warm Peach `#F6E3D9`, Charcoal `#333333`, Georgia for headings. Buttons use a deeper rose (`#A9515F`) so white text stays easy to read.
- **Motion** is gentle: one landing animation in the hero, light parallax on photos and flowers, and a book that follows the mouse on desktop. Everything switches off for visitors who have "reduce motion" turned on.
- **The Starter Checklist** on the page remembers ticks on that visitor's own device. Nothing is sent anywhere.
- **Meta Pixel** (ID `2067695027270790`) is installed. Its code is in the `<head>` of `index.html` and sends **PageView** when the page opens. `assets/js/main.js` sends **InitiateCheckout** (INR, value read from the `price__now` price) when someone taps any "Get the book" button. **Purchase** is not sent from this site: the sale happens on Superprofile, so paste the same Pixel ID into Superprofile's Meta Pixel setting. Because the Pixel is installed, the privacy policy should say the site uses the Meta Pixel.
- **Ad rules:** the page never says "Do you have PCOS?" or "Your PCOS", uses no before-and-after images and promises no cure.
