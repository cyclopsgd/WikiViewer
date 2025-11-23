# Development Guide

This guide provides additional information for developers working on the Azure DevOps Wiki Viewer.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run in development mode:**
   ```bash
   npm start
   ```

3. **Run with DevTools open:**
   ```bash
   npm run dev
   ```

## Development Workflow

### File Structure

- **Main Process** (`src/main/`):
  - `main.js` - Electron main process, window management, IPC handlers
  - `fileSystem.js` - All file system operations (read, search, watch)

- **Renderer Process** (`src/renderer/`):
  - `index.html` - Main HTML structure
  - `renderer.js` - Main coordination, app initialization, theme management
  - `markdown-renderer.js` - Markdown parsing and rendering
  - `file-tree.js` - File tree component
  - `search.js` - Search functionality
  - `settings.js` - Settings modal

- **Styles** (`src/styles/`):
  - `main.css` - Base layout and component styles
  - `azure-devops-light.css` - Light theme variables
  - `azure-devops-dark.css` - Dark theme variables

### Key Technologies

- **Electron**: Desktop app framework
  - Main process: Node.js environment, system access
  - Renderer process: Browser environment, UI
  - IPC: Communication between main and renderer

- **markdown-it**: Fast markdown parser with plugin support
- **Mermaid**: Diagram rendering from text
- **highlight.js**: Syntax highlighting for code blocks
- **chokidar**: File system watching

## Adding Features

### Adding a new markdown feature

1. Update `markdown-renderer.js`
2. Add preprocessing in `processAzureDevOpsSyntax()` if needed
3. Add custom rendering rule to `md.renderer.rules` if needed
4. Update CSS in `main.css` for styling
5. Update README.md documentation

### Adding a new setting

1. Add UI control in `index.html` (settings modal)
2. Add load/save logic in `settings.js`
3. Add default value in `main.js` `get-all-settings` handler
4. Implement the setting behavior in appropriate module
5. Update README.md

### Adding a new theme

1. Create new CSS file in `src/styles/`
2. Define all CSS variables (see existing theme files)
3. Add `<link>` tag in `index.html`
4. Update theme switching logic in `renderer.js` `applyTheme()`
5. Add option to settings select in `index.html`

## Testing

### Manual Testing Checklist

- [ ] File tree loads correctly
- [ ] Clicking folders expands/collapses
- [ ] Clicking files loads content
- [ ] Index files load when clicking folders
- [ ] Search finds files by name
- [ ] Search results are clickable
- [ ] Breadcrumbs show correct path
- [ ] Breadcrumbs are clickable
- [ ] Theme switching works (light/dark/system)
- [ ] Settings persist after restart
- [ ] Auto-reload works when files change
- [ ] Internal links work
- [ ] External links open in browser
- [ ] Broken links are styled correctly
- [ ] Images load correctly
- [ ] Missing images show placeholder
- [ ] Code blocks have syntax highlighting
- [ ] Mermaid diagrams render
- [ ] `[[_TOC_]]` generates table of contents
- [ ] `[[Page-Name]]` links work
- [ ] Task lists display correctly
- [ ] HTML tags render (if supported)
- [ ] `<details>` collapsible sections work

### Test Markdown Files

Create test files to verify features:

**test-basic.md:**
```markdown
# Heading 1
## Heading 2

**Bold** *italic* ~~strikethrough~~

- List item 1
- List item 2

[Internal Link](./other-file.md)
[External Link](https://example.com)
```

**test-mermaid.md:**
```markdown
::: mermaid
graph LR
    A[Start] --> B[End]
:::
```

**test-toc.md:**
```markdown
[[_TOC_]]

# Section 1
## Subsection 1.1
# Section 2
```

## Debugging

### Enable DevTools

Run with dev flag to open DevTools automatically:
```bash
npm run dev
```

Or press `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac) in the running app.

### Common Issues

**File tree not loading:**
- Check console for errors
- Verify folder path is correct
- Check file permissions

**Markdown not rendering:**
- Check for JavaScript errors in console
- Verify markdown syntax is valid
- Check if specific plugin is loaded

**Styles not applied:**
- Verify CSS file paths in HTML
- Check if theme variables are defined
- Clear cache and restart

**Mermaid diagrams not rendering:**
- Check diagram syntax
- Verify Mermaid library loaded
- Check console for Mermaid errors
- Ensure theme is initialized before rendering

### Logging

Add debug logging as needed:

```javascript
console.log('Debug info:', data);
console.error('Error occurred:', error);
```

## Building

### Development Build

Quick build without installer (for testing):
```bash
npm run build:dir
```

Output: `dist/win-unpacked/`

### Production Build

Full installer:
```bash
npm run build
```

Output: `dist/Azure DevOps Wiki Viewer Setup 1.0.0.exe`

### Build Configuration

Edit `package.json` under `build` section:
- Change app name, ID, version
- Modify installer options
- Add/remove target platforms

## Performance Optimization

### Current Performance Characteristics

- **File tree loading**: O(n) where n = number of files
- **Search**: O(n) linear scan
- **Markdown rendering**: Depends on content size and complexity

### Future Optimizations

If performance becomes an issue with large wikis:

1. **Lazy loading file tree**: Load folders on-demand instead of all at once
2. **Virtual scrolling**: For very long file lists
3. **Indexed search**: Build search index for faster lookups
4. **Content caching**: Cache rendered markdown
5. **Web Workers**: Move heavy processing off main thread

## Code Style

- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small
- Use async/await for asynchronous operations
- Handle errors gracefully
- Use const/let instead of var

## Contributing

When adding features:
1. Test thoroughly in both light and dark themes
2. Ensure responsive behavior
3. Update documentation
4. Consider accessibility
5. Maintain consistency with Azure DevOps styling

## Release Checklist

Before releasing a new version:

- [ ] Update version in `package.json`
- [ ] Test all major features
- [ ] Test on clean installation (no previous settings)
- [ ] Test build process
- [ ] Update README.md with new features
- [ ] Update CHANGELOG (if you create one)
- [ ] Create release notes
- [ ] Build production executable
- [ ] Test the built executable on a different machine
