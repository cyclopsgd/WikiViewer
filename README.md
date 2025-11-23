# Azure DevOps Wiki Viewer

A standalone desktop application for browsing Azure DevOps wiki documentation offline. Built with Electron and Node.js.

## Features

### Core Functionality
- **Two-panel layout**: File tree navigator on the left, markdown content viewer on the right
- **Azure DevOps visual styling**: Familiar colors, fonts, and spacing matching Azure DevOps
- **Theme support**: Light mode, dark mode, and automatic system theme detection
- **Smart navigation**:
  - Click folders to expand/collapse and view index files
  - Click files to view their markdown content
  - Breadcrumb navigation for easy path tracking
- **Fast search**: Search files and folders by name with keyboard navigation
- **Settings persistence**: Remembers your preferences between sessions
- **File watching**: Optional auto-reload when files change on disk

### Markdown Support

**Standard Markdown:**
- Headers (H1-H6)
- Paragraphs and line breaks
- Bold, italic, strikethrough
- Ordered and unordered lists (including nested)
- Tables with column alignment
- Links (relative, absolute, anchor)
- Images with error handling
- Block quotes
- Horizontal rules
- Code blocks with syntax highlighting (PowerShell, Python, C#, JavaScript, JSON, YAML, and more)
- Inline code

**Mermaid Diagrams:**
- Sequence diagrams
- Flowcharts
- Gantt charts
- Class diagrams
- State diagrams
- User journey diagrams
- Pie charts
- Requirements diagrams
- Gitgraph diagrams
- Entity Relationship diagrams
- Timeline diagrams

**Azure DevOps-specific Features:**
- `[[_TOC_]]` - Auto-generated table of contents
- `[[_TOSP_]]` - Table of subpages (lists all pages in current directory)
- `[[Page-Name]]` or `[[Page-Name|Display Text]]` - Wiki-style internal links
- `$equation$` and `$$equation$$` - KaTeX mathematical notation
- `:emoji_name:` - Emoji shortcodes (`:smile:`, `:tada:`, etc.)
- `@username` - Styled user mentions
- `#123` - Work item links (styled, non-functional offline)
- `[[attachment:filename]]` - Attachment links
- HTML tags support (`<font>`, `<details>`, `<video>`, etc.)
- Collapsible sections with `<details><summary>` tags
- Task lists with `- [ ]` and `- [x]` checkboxes

## Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Development Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd WikiViewer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application in development mode:**
   ```bash
   npm start
   ```

   Or with developer tools enabled:
   ```bash
   npm run dev
   ```

### Building the Windows Executable

To create a standalone `.exe` file:

```bash
npm run build
```

The executable will be created in the `dist` folder. You can distribute this file to other computers - it does not require Node.js to be installed.

**Alternative build (for testing without installer):**
```bash
npm run build:dir
```

This creates an unpacked application in `dist/win-unpacked` for quick testing without running the installer.

## Usage

### First Launch

1. When you first launch the application, you'll see a welcome screen
2. Click "Select Wiki Folder" to choose the root directory of your wiki
3. The application will load the file tree and attempt to display the root `index.md` or `README.md` file

### Navigation

**File Tree:**
- Click a folder to expand/collapse it
- If a folder contains `index.md` or `README.md`, clicking it will display that file
- Click any markdown file to view its content

**Search:**
- Use the search bar in the top-right to find files and folders by name
- Results appear in a dropdown as you type
- Use arrow keys to navigate results, Enter to open
- Press Escape to close the search results

**Breadcrumbs:**
- The breadcrumb trail shows your current location
- Click any breadcrumb item to navigate to that location

**Links in Content:**
- External links (HTTP/HTTPS) open in your default browser
- Internal wiki links open in the viewer
- Broken links are highlighted in red with strikethrough

### Settings

Click the gear icon in the top-right to access settings:

- **Wiki Folder Path**: View current folder and change it if needed
- **Theme**: Choose between Light, Dark, or System (auto-detects your OS theme)
- **Remember last viewed page**: When enabled, reopens the last file you were viewing
- **Auto-reload on file changes**: When enabled, automatically refreshes content when files change

## File Organization

The application expects a standard markdown wiki structure:

```
wiki-root/
├── index.md (or README.md) - Root landing page
├── Getting-Started.md
├── Configuration/
│   ├── index.md
│   └── Advanced.md
└── Tutorials/
    ├── index.md
    ├── Tutorial-1.md
    └── Tutorial-2.md
```

**Supported file extensions:**
- `.md`
- `.markdown`

## Keyboard Shortcuts

- **Escape**: Close search results or settings modal
- **Arrow Up/Down**: Navigate search results
- **Enter**: Open selected search result

## Mermaid Diagram Syntax

Use the `::: mermaid` syntax for diagrams:

```markdown
::: mermaid
graph LR
    A[Start] --> B[Process]
    B --> C[End]
:::
```

Supported diagram types match Azure DevOps wiki capabilities.

## Project Structure

```
WikiViewer/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # Application entry point
│   │   └── fileSystem.js  # File operations
│   ├── renderer/          # UI and rendering
│   │   ├── index.html     # Main HTML structure
│   │   ├── renderer.js    # Main renderer coordination
│   │   ├── markdown-renderer.js  # Markdown processing
│   │   ├── file-tree.js   # File tree component
│   │   ├── search.js      # Search functionality
│   │   └── settings.js    # Settings panel
│   ├── styles/            # CSS styling
│   │   ├── main.css       # Base styles
│   │   ├── azure-devops-light.css  # Light theme
│   │   └── azure-devops-dark.css   # Dark theme
│   └── assets/            # Icons and images
├── package.json
└── README.md
```

## Technical Details

### Dependencies

**Core:**
- `electron` - Desktop application framework
- `electron-store` - Settings persistence

**Markdown Processing:**
- `markdown-it` - Markdown parser
- `markdown-it-anchor` - Heading anchors
- `markdown-it-task-lists` - Task list checkboxes
- `highlight.js` - Code syntax highlighting
- `mermaid` - Diagram rendering

**File System:**
- `chokidar` - File watching for auto-reload

### Build Configuration

The application uses `electron-builder` to create Windows installers. Configuration is in `package.json` under the `build` section.

## Known Limitations

1. **Task list checkboxes**: Currently read-only (clicking shows a message). File editing may be added in future versions.
2. **Full-text search**: Only searches file/folder names. Content search is planned for future versions.
3. **Image paths**: Only supports local file paths and HTTP/HTTPS URLs. Relative paths are resolved from the current file's location.
4. **Performance**: Very large wikis (500+ files) may take a few seconds to load the initial file tree.

## Troubleshooting

### Application won't start
- Ensure Node.js is installed (run `node --version`)
- Try deleting `node_modules` and running `npm install` again

### File tree is empty
- Check that you selected the correct wiki root folder
- Ensure the folder contains `.md` or `.markdown` files
- Check the developer console (run with `npm run dev`) for errors

### Markdown not rendering correctly
- Ensure the file is valid markdown
- Check for malformed Mermaid diagram syntax
- View the developer console for specific error messages

### Styles look wrong
- Try switching themes in settings
- Check that all CSS files are present in `src/styles/`

### Build fails
- Ensure all dependencies are installed: `npm install`
- Check that `electron-builder` is in devDependencies
- Windows Defender may interfere - try temporarily disabling it during build

## Future Enhancements

Possible future additions based on user needs:
- Full-text search across file contents
- Task list editing capabilities
- Export to PDF or HTML
- Bookmark/favorites system
- Recent files history
- Font size customization
- Print support
- `[[_TOSP_]]` (Table of subpages) support
- Mathematical notation with KaTeX
- Emoji shortcode support

## License

MIT

## Support

For issues, questions, or feature requests, please contact the development team or file an issue in your project repository.
