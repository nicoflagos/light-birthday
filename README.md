# Light Birthday Website

A static birthday website with a countdown, slideshow, music, birthday reveal, and wishes section.

## How It Works

- The site can run directly on GitHub Pages with Supabase as the shared wishes backend.
- The birthday reveal happens on or after June 6, 2026, based on the visitor's browser time.
- Public approved wishes are loaded from the Supabase `wishes` table.
- New wishes entered by a visitor are inserted into Supabase with `status: "approved"`.
- If Supabase is unavailable, the page falls back to the static `wishes_db.json` file for display.

## GitHub Pages

Upload or publish these files from the repository root:

- `index.html`
- `style.css`
- `script.js`
- `wishes_db.json` fallback data
- `images/`
- `music/`

GitHub Pages will display the website as a normal static page. After the birthday date, the page will reveal the approved wishes from Supabase.

## Supabase Setup

The frontend expects a Supabase table named `wishes` with these columns:

```json
{
  "id": "generated-id",
  "name": "Visitor Name",
  "message": "Birthday wish text",
  "created_at": "2026-06-03T12:00:00.000Z",
  "status": "approved"
}
```

The anon key must be allowed to select approved rows and insert new rows. Only wishes with `status` set to `approved` are shown publicly.

## Local Preview

You can open `index.html` directly in a browser. For a closer GitHub Pages-style preview, run any simple static server from the project folder.

The old Node server is not required for the static version.

## Files

- `index.html` - Page structure
- `style.css` - Layout, slideshow, and visual styles
- `script.js` - Countdown, reveal, slideshow, and Supabase wishes logic
- `wishes_db.json` - Static fallback approved wishes
- `images/` - Slideshow photos
- `music/song.mp3` - Birthday music
