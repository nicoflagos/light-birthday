# 🎂 Birthday Wishes Website

A beautiful, interactive birthday celebration website with birthday wish collection, admin moderation, and server-side persistence.

## Features

- **Birthday Countdown** — Live countdown to the birthday (June 6, 2026)
- **Birthday Wish Collection** — Visitors can submit wishes with their name
- **Server Persistence** — Wishes are saved to a database and shared across devices
- **Admin Moderation** — Approve/reject pending wishes before they're revealed
- **Password Protected Admin Panel** — Secure access to moderation features
- **Export Function** — Download all wishes as JSON
- **Surprise Reveal** — Click the surprise button to trigger birthday message, typed text, music, and images
- **Wishes Reveal** — Approved wishes are displayed once the birthday arrives
- **XSS Protection** — All user inputs are escaped to prevent malicious content
- **Responsive Design** — Beautiful animated UI with glassmorphism effects

## Installation & Setup

### Prerequisites
- Node.js (v18+) installed
- npm package manager

### Steps

1. **Navigate to project directory:**
   ```powershell
   cd "c:\Users\DELL\Desktop\Light+Valentine"
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the server:**
   ```powershell
   npm start
   ```

4. **Open in browser:**
   - **Visitor view:** http://localhost:3000
   - **Admin panel:** http://localhost:3000/?admin=1

## Usage

### Visitor Flow

1. Open http://localhost:3000
2. View the birthday countdown (updates live)
3. Scroll down to "Leave a Birthday Wish" section
4. Enter your name and birthday wish message
5. Click "Send Wish"
6. Your wish is saved and will be revealed on June 6, 2026
7. Click "Click for a Surprise 💌" to see the birthday reveal (message, music, images)

### Admin Workflow

1. Open http://localhost:3000/?admin=1
2. Enter admin password: `birthday2026`
3. View all **pending wishes** (awaiting approval)
4. For each wish:
   - Click **✅ Approve** to make it public on birthday
   - Click **🗑️ Delete** to reject
   - Confirm the action in the dialog
5. Click **📥 Export Wishes (JSON)** to download all wishes

## Configuration

### Change Admin Password

Set the environment variable before starting:
```powershell
$env:ADMIN_PASSWORD = "your-secure-password"
npm start
```

Or edit the default in `server.js`:
```javascript
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'birthday2026';
```

## Data Storage

Wishes are stored in `wishes_db.json`. Each wish has:
```json
{
  "id": "unique-id",
  "name": "Visitor Name",
  "message": "Birthday wish text",
  "time": "ISO timestamp",
  "status": "pending|approved"
}
```

## Features Explained

### Badge Counter
- Shows count of **approved wishes** only
- Appears next to the surprise button
- Updates in real-time

### Admin Moderation
- All new wishes start as **pending**
- Admin must approve before they're revealed
- Approved wishes are shown on the birthday
- Delete permanently removes wishes

### Reveal Timing
- **Before birthday (June 6):** Wishes remain hidden in public view, only admins can see them
- **On/after birthday:** Approved wishes are automatically revealed to all visitors
- **Surprise click:** Shows birthday takeover screen with message, music, and images regardless of date

### Security
- Admin password required for moderation
- XSS protection: all inputs escaped
- Password stored in browser session (not persistent after closing browser)
- Exported JSON contains all wish data including status

## Files

- `index.html` — Page structure with wish form and birthday UI
- `script.js` — Frontend logic, API calls, admin panel
- `style.css` — Responsive styling with animations
- `server.js` — Express server with API endpoints
- `wishes_db.json` — Database file (auto-created)
- `package.json` — Node.js dependencies

## API Endpoints

- `GET /api/wishes?status=approved` — List approved wishes
- `GET /api/wishes?status=pending` — List pending wishes (admin only)
- `GET /api/wishes?status=all` — List all wishes (admin only)
- `POST /api/wishes` — Submit new wish
- `POST /api/wishes/:id/approve` — Approve a wish (admin + password required)
- `DELETE /api/wishes/:id` — Delete a wish (admin + password required)
- `GET /api/wishes/export/json` — Export all wishes (admin + password required)

## Troubleshooting

**Port 3000 already in use:**
```powershell
# Kill the process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
npm start
```

**Music file not found:**
- Ensure `music/song.mp3` exists in the project folder
- The site works without it (no error)

**Images not loading:**
- Add image files to the `images/` folder as `photo1.jpg` through `photo10.jpg`

## Customization

### Change Birthday Date
Edit `script.js`:
```javascript
const targetDate = new Date("Jun 6, 2026 00:00:00").getTime();
```

### Change Messages
- Edit `index.html` for the main heading, subtitle, and takeover screen text
- Edit button text and form placeholders in `index.html`

### Change Styles
- Edit `style.css` to customize colors, fonts, animations
- Current theme uses soft pink/purple gradient with gold accents

## Future Enhancements

- Email notifications for approved wishes
- Social media share integration
- Photo uploads with wishes
- Guest book view with wish count
- Admin analytics dashboard
- Scheduled email reminders
