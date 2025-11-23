# Assets Folder

This folder contains application icons and images.

## Icon Requirements

For a production build, you need the following icon files:

### Required for Windows build:
- `icon.ico` - Windows icon file (256x256 recommended, multi-resolution)
- `icon.png` - PNG icon (256x256 or larger)

### How to create icons:

1. **From SVG to PNG:**
   - Use an image editor (e.g., Inkscape, GIMP, Photoshop) to export `icon.svg` to PNG at 256x256 or 512x512
   - Save as `icon.png` in this folder

2. **From PNG to ICO:**
   - Use an online converter (e.g., https://convertio.co/png-ico/)
   - Or use a tool like ImageMagick: `convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico`
   - Save as `icon.ico` in this folder

### Current status:
- ✅ `icon.svg` - SVG template (provided)
- ⚠️ `icon.png` - You need to create this from the SVG
- ⚠️ `icon.ico` - You need to create this for Windows builds

The application will still work without these icons, but will use Electron's default icon instead.
