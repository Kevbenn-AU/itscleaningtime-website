# It's Cleaning Time! website

The one-page website for It's Cleaning Time! (Big Kev), live at https://itscleaningtime.com.au.
It's a plain static site hosted free on GitHub Pages. Anything uploaded to this repository goes live within a few minutes.

## What's where

| File or folder | What it controls |
|---|---|
| `index.html` | All the words, reviews, phone numbers, sections and images on the home page |
| `assets/css/styles.css` | The look: colours, fonts, spacing, layout |
| `assets/js/main.js` | Animations, the rotating hero review, the before/after slider and the quote chat (service, suburb and "how often" options live at the top) |
| `assets/img/` | Photos (WebP format) and the social share image |
| `assets/icons.svg` | Icons |
| `privacy.html`, `thanks.html`, `not-sent.html`, `404.html` | Small extra pages |
| `CNAME` | Connects the domain. Created by GitHub. **Never delete it.** |
| `supabase/` | Copies of the backend (database setup and the email function). Changing these files here does NOT change the live backend; changes must be pasted into the Supabase dashboard. |

## Golden rules

1. Never put passwords or API keys in this repository. It is public.
2. Keep file names exactly the same when replacing a file.
3. Never delete `CNAME`.
4. Change one thing at a time, then check the live site (hard refresh).
