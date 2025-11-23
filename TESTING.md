# Testing the Application

## Ready-Made Test Wiki! 🎉

A complete test wiki is already included at `test-wiki/` with all features demonstrated!

## Quick Test Instructions

### 1. Run the App and Load Test Wiki

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Click "Select Wiki Folder"**

3. **Navigate to and select the `test-wiki` folder** inside your WikiViewer directory

4. **The app should load immediately** showing the index page with:
   - File tree on the left showing all pages
   - index.md content displayed on the right
   - Table of contents
   - Mermaid diagrams
   - All markdown features

### 2. Check Console for Errors

**Open DevTools to see console logs:**
- Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- OR run with: `npm run dev` (opens DevTools automatically)

**You should see:**
- "Initializing application..."
- "Welcome select button: <button>..."
- "Loaded settings: {...}"
- NO red errors about Mermaid
- NO "TypeError" or "is not a function" errors

**If you see errors:**
   - Check console for errors (red text)
   - The dialog might be behind the main window - check your taskbar
   - Try Alt+Tab to see if there's a hidden dialog window
   - Share any error messages you see

### 3. Test All Features in the Test Wiki

Once loaded, test these features:

**File Tree:**
- ✓ Expand/collapse the "folder" directory
- ✓ Click on "folder" - should show folder/index.md
- ✓ Click on different files - content should change

**Content Display:**
- ✓ Table of contents is generated at the top
- ✓ Mermaid diagrams render (flowchart, sequence, pie chart)
- ✓ Code blocks have syntax highlighting
- ✓ Tables display correctly
- ✓ Task lists show checkboxes

**Navigation:**
- ✓ Click wiki-style links like `[[Getting-Started]]`
- ✓ Click regular markdown links
- ✓ Click external links - should open in browser
- ✓ Breadcrumbs update as you navigate

**Search:**
- ✓ Search for "mermaid" - should find index.md
- ✓ Search for "nested" - should find folder pages
- ✓ Click search results to navigate

**Themes:**
- ✓ Open settings (gear icon)
- ✓ Switch between light/dark themes
- ✓ Mermaid diagrams update colors

**Collapsible Sections:**
- ✓ Click the "Click to expand" section - should expand

### 4. What Console Should Show

**Good output:**
```
Initializing application...
Welcome select button: <button>...</button>
Select folder button: <button>...</button>
Loaded settings: {wikiRootPath: null, theme: "system", ...}
Welcome button clicked
Opening folder selection dialog...
Dialog result: {canceled: false, filePaths: ["C:\\path\\to\\wiki"]}
Folder selection result: {success: true, path: "C:\\path\\to\\wiki"}
Loading wiki from: C:\path\to\wiki
```

**Bad output (if there's an error):**
```
Error: [some error message]
Window not ready
etc.
```

### 3. Create a Test Wiki

If you don't have a wiki folder yet, create one:

**Structure:**
```
test-wiki/
├── index.md
├── Page1.md
└── Folder1/
    └── Page2.md
```

**test-wiki/index.md:**
```markdown
# Test Wiki

This is a test wiki to verify the viewer works.

## Features to Test

[[_TOC_]]

### Links
- [[Page1]] - Wiki-style link
- [Regular Link](./Page1.md)
- [External Link](https://google.com)

### Code
```javascript
console.log("Hello, World!");
```

### Mermaid Diagram
::: mermaid
graph LR
    A[Start] --> B[End]
:::

### Task List
- [x] Create test wiki
- [ ] Test the viewer

### Table
| Feature | Status |
|---------|--------|
| Links   | ✓      |
| Code    | ✓      |
```

**test-wiki/Page1.md:**
```markdown
# Page 1

This is page 1.

Back to [[index|home]].
```

**test-wiki/Folder1/Page2.md:**
```markdown
# Page 2

This is in a subfolder.
```

## Common Issues

### Issue: Dialog doesn't open
**Solution:** Check console for errors. The dialog might be opening behind the main window.

### Issue: "Window not ready" error
**Solution:** This means the Electron window wasn't created yet. This shouldn't happen with the fixed code.

### Issue: No files appear in tree
**Solution:**
- Make sure the folder contains `.md` or `.markdown` files
- Check file permissions
- Look for errors in console

### Issue: Blank screen
**Solution:**
- Press F12 to open console
- Look for JavaScript errors
- Check if files are in correct locations

## What to Report

If something doesn't work, please share:
1. What you clicked
2. What you expected to happen
3. What actually happened
4. Any error messages from the console (copy the red text)
5. Your operating system

---

## After Folder Selection Works

Once the folder selection is working, we'll move on to adding the Priority 2 features:
- [ ] Table of subpages `[[_TOSP_]]`
- [ ] Mathematical notation with KaTeX
- [ ] Emoji shortcodes
- [ ] @mentions (styled but non-functional)
- [ ] Work item links #ID (styled but non-functional)
- [ ] Attachments support
