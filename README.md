# SpeedRead - Spritz Style Speed Reader

A production-quality web application for speed reading using the Spritz-style "one word at a time" technique with Optimal Recognition Point (ORP) alignment.

## Features

- **Spritz-style reading**: One word at a time with fixed focus letter (ORP) position
- **Night mode UI**: Black background, white text, red focus letter
- **Two reading modes**:
  - **Autoplay**: Continuous reading at chosen WPM
  - **Hold Space**: Reading advances only while spacebar is held (deadman switch)
- **Speed control**: 50-1000 WPM in 50 WPM increments
- **Soft rewind**: Automatically rewind 3-7 words when resuming (configurable)
- **Page pane**: Side panel showing full text with current position highlighted
- **Click-to-seek**: Click any word in the page pane to jump to that position
- **Library management**: Import PDF, DOCX, and EPUB documents
- **Progress persistence**: Remembers reading position per document
- **Export/Import**: Share your library across devices via JSON export

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Dexie (IndexedDB) for persistence
- pdf.js, mammoth.js, epub.js for document parsing
- @tanstack/react-virtual for virtualized scrolling
- Vitest for testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Usage

1. Open the app in your browser (default: http://localhost:5173)
2. Click "Add Document" to import a PDF, DOCX, or EPUB file
3. Click on a document to start reading
4. Use the controls or keyboard shortcuts to navigate

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause (Autoplay) or Hold to read (Hold Space mode) |
| `←` / `→` | Step back/forward 1 word |
| `Shift + ←` / `→` | Jump back/forward 10 words |
| `↑` / `↓` | Increase/decrease speed by 50 WPM |
| `Esc` | Return to library |

## Architecture

```
src/
├── core/           # Core logic (framework-agnostic)
│   ├── types.ts    # Type definitions
│   ├── orp.ts      # ORP calculation
│   ├── timing.ts   # Timing/delay calculations
│   ├── tokenizer.ts # Text tokenization
│   └── readerEngine.ts # State machine for reading
├── storage/        # Persistence layer
│   ├── db.ts       # Dexie database setup
│   └── documentsRepo.ts # Document CRUD operations
├── ingest/         # Document parsing
│   └── ingest.ts   # PDF/DOCX/EPUB extraction
├── ui/             # React components
│   ├── AppShell.tsx
│   ├── LibraryView.tsx
│   ├── ReaderView.tsx
│   ├── WordRenderer.tsx
│   ├── Controls.tsx
│   ├── PagePane.tsx
│   └── hooks/      # Custom React hooks
└── test/           # Test setup
```

## ORP (Optimal Recognition Point)

The focus letter position is calculated based on word length:
- 1 character: position 0
- 2-5 characters: position 1
- 6-9 characters: position 2
- 10-13 characters: position 3
- 14+ characters: position 4

## Timing Model

Base interval: `60000 / WPM` milliseconds

Punctuation multipliers (when enabled):
- Comma, semicolon, colon: 1.5x
- Period, question mark, exclamation: 2.0x
- Paragraph break: 2.5x

## Sharing

### Export/Import Library
- Export your entire library as a JSON file
- Import on another device to restore documents and progress

### Share Reading Position
- Click the share button to copy a URL with your current position
- Note: The recipient must have the same document in their library

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Project Structure

The codebase follows clean architecture principles:
- **Core**: Pure TypeScript, no React dependencies, fully testable
- **Storage**: Dexie wrapper for IndexedDB
- **Ingest**: Document parsing with dynamic imports
- **UI**: React components with hooks for state management

## License

MIT
