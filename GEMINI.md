# STAR TEAM — Robot Management System Project Context

This project is a centralized web interface for managing and monitoring heterogeneous robots across multiple sites, developed by the KETI STAR TEAM.

## Project Overview

- **Purpose**: A "Heterogeneous Robot Operations Manual & Remote Control Web Interface" for real-time monitoring, manual access, and remote operation.
- **Main Interface**: `public/index_apple.html` (Single HTML SPA).
- **Architecture**: Static web application that loads data from CSV/JSON and documentation from Markdown/PDF.
- **Target Environments**: Incheon Cheongna Robot Land, Seoul Gangnam Robot Plus, Gangwon Yeongwol Bit-Dream Power Plant.

## Core Technologies

- **Frontend**: HTML5, Vanilla CSS (Apple-inspired design), JavaScript (ES6+).
- **Data Management**: CSV and JSON files in `public/data/`.
- **Documentation**: 
  - `marked.js` for Markdown manuals.
  - `highlight.js` for code snippets.
  - `html2pdf.js` for PDF exports.
- **Automation**: Python scripts for asset synchronization and manifest generation.

## Key Directory Structure

```text
.
├── public/                 # Web root (deploy this directory)
│   ├── index_apple.html    # Main application entry (all-in-one UI/logic)
│   ├── data/               # Project data (robots.csv, contacts.csv, etc.)
│   ├── generate_manifest.py # Script to scan vendor PDFs and update manifest.json
│   └── sync_docs_to_public.py # Script to mirror docs/ to public/docs/
├── docs/                   # Documentation source
│   ├── manuals/            # Robot-specific Markdown manuals
│   ├── vendor_docs/        # Vendor-provided PDF datasheets and IFUs
│   └── design/             # UI/UX design specifications for various brands
├── src/                    # Static assets
│   └── assets/
│       ├── fonts/          # Local fonts (Pretendard, IBM Plex Mono)
│       └── images/         # Robot photos, team headshots, and logos
└── scripts/                # Utility scripts (mostly empty, use public/ scripts)
```

## Maintenance & Operations

### Running the Project
The application is purely static. For the best experience (avoiding CORS issues with local files), use a static server:
```bash
cd public
python3 -m http.server 8080
# Open http://localhost:8080/index_apple.html
```

### Updating Data & Documentation
1.  **Adding a Robot**: 
    - Update `public/data/robots.csv`.
    - Add images to `src/assets/images/robots/{folder}/`.
    - Create manuals in `docs/manuals/{folder}/`.
2.  **Adding Vendor Docs**:
    - Place PDF in `docs/vendor_docs/{folder}/`.
    - Run `python3 public/generate_manifest.py` to update the searchable index.
3.  **Synchronizing Assets**:
    - Run `python3 public/sync_docs_to_public.py` to ensure all Markdown and PDF files are accessible by the web server.

## Development Conventions

- **Surgical UI Updates**: `index_apple.html` is a large file. Edits should be precise to maintain the complex CSS and JS logic.
- **Markdown Support**: Supports GFM with extensions for callouts (e.g., `> [!NOTE]`) and details blocks (`:::details`).
- **Image Naming**: Follow the convention `로봇_{Name}.png` for robot photos and `증명사진_{Name}.jpg` for staff.
- **Login Credentials**:
    - Admin: `admin` / `admin`
    - Staff: `itp_user` / `1234`
    - Viewer: `viewer` / `view`

## AI Interaction Guidelines
- When asked to add or modify robot information, check `public/data/robots.csv`.
- When modifying UI, refer to the extensive CSS variables defined in the `:root` of `index_apple.html`.
- Always verify if a `sync` or `manifest` generation is required after file additions.
