const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const MARKDOWN_EXTENSIONS = ['.md', '.markdown'];

// Check if a file is a markdown file
function isMarkdownFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MARKDOWN_EXTENSIONS.includes(ext);
}

// Get file tree recursively
async function getFileTree(dirPath, basePath = null) {
  if (!basePath) basePath = dirPath;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const tree = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        // Skip hidden directories and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const children = await getFileTree(fullPath, basePath);

        // Check for index files
        const indexFile = children.find(child =>
          child.type === 'file' &&
          (child.name.toLowerCase() === 'index.md' ||
           child.name.toLowerCase() === 'readme.md' ||
           child.name.toLowerCase() === 'index.markdown' ||
           child.name.toLowerCase() === 'readme.markdown')
        );

        tree.push({
          name: entry.name,
          path: fullPath,
          relativePath: relativePath,
          type: 'directory',
          children: children,
          hasIndex: !!indexFile,
          indexPath: indexFile ? indexFile.path : null
        });
      } else if (isMarkdownFile(entry.name)) {
        tree.push({
          name: entry.name,
          path: fullPath,
          relativePath: relativePath,
          type: 'file'
        });
      }
    }

    // Sort: directories first, then files, both alphabetically
    tree.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
      return a.type === 'directory' ? -1 : 1;
    });

    return tree;
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

// Read file content
async function readFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
}

// Check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Search files by name
async function searchFiles(dirPath, query, basePath = null) {
  if (!basePath) basePath = dirPath;
  if (!query || query.trim() === '') return [];

  const queryLower = query.toLowerCase();
  const results = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      // Skip hidden directories and node_modules
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        // Check if directory name matches
        if (entry.name.toLowerCase().includes(queryLower)) {
          results.push({
            name: entry.name,
            path: fullPath,
            relativePath: relativePath,
            type: 'directory',
            match: 'name'
          });
        }
        // Recursively search subdirectories
        const subResults = await searchFiles(fullPath, query, basePath);
        results.push(...subResults);
      } else if (isMarkdownFile(entry.name)) {
        // Check if file name matches
        if (entry.name.toLowerCase().includes(queryLower)) {
          results.push({
            name: entry.name,
            path: fullPath,
            relativePath: relativePath,
            type: 'file',
            match: 'name'
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error(`Error searching in ${dirPath}:`, error);
    return [];
  }
}

// Watch files for changes
function watchFiles(dirPath, onChange) {
  const watcher = chokidar.watch(dirPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
    depth: 99
  });

  watcher
    .on('add', onChange)
    .on('change', onChange)
    .on('unlink', onChange)
    .on('addDir', onChange)
    .on('unlinkDir', onChange);

  return watcher;
}

// Resolve relative path from markdown links
function resolvePath(basePath, relativePath) {
  const baseDir = path.dirname(basePath);
  const resolved = path.resolve(baseDir, relativePath);
  return resolved;
}

module.exports = {
  getFileTree,
  readFile,
  fileExists,
  searchFiles,
  watchFiles,
  resolvePath,
  isMarkdownFile
};
