// Wrap in IIFE to prevent global scope pollution
(function() {
const { ipcRenderer, shell } = require('electron');
const path = require('path');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it');
const katex = require('katex');

// Mermaid is loaded via script tag and available globally
// Initialize Mermaid if it's available
if (window.mermaid && typeof window.mermaid.initialize === 'function') {
  window.mermaid.initialize({
    startOnLoad: false,
    theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif'
  });
} else {
  console.warn('Mermaid not loaded, diagrams will not render');
}

// Initialize markdown-it with plugins
const md = markdownIt({
  html: true, // Enable HTML tags in source
  linkify: true, // Auto-convert URL-like text to links
  typographer: true,
  breaks: false, // Azure DevOps uses 2 spaces for line breaks
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

// Load task lists plugin
const taskLists = require('markdown-it-task-lists');
md.use(taskLists, { enabled: true });

// Load anchor plugin for heading IDs
const anchor = require('markdown-it-anchor');
md.use(anchor, {
  permalink: false,
  slugify: (s) => s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
});

// Load emoji plugin
try {
  const emojiPlugin = require('markdown-it-emoji');
  // Some packages export as .default in newer versions
  const emoji = emojiPlugin.default || emojiPlugin;
  if (typeof emoji === 'function') {
    md.use(emoji);
    console.log('Emoji plugin loaded successfully');
  } else {
    console.warn('Emoji plugin has unexpected format');
  }
} catch (error) {
  console.warn('Emoji plugin not loaded:', error);
}

// Load KaTeX/texmath plugin for mathematical notation
try {
  const texmathPlugin = require('markdown-it-texmath');
  // Some packages export as .default in newer versions
  const texmath = texmathPlugin.default || texmathPlugin;
  if (typeof texmath === 'function') {
    md.use(texmath, {
      engine: katex,
      delimiters: 'dollars', // Use $ for inline and $$ for block
      katexOptions: { macros: {"\\RR": "\\mathbb{R}"} }
    });
    console.log('Math plugin loaded successfully');
  } else {
    console.warn('Math plugin has unexpected format');
  }
} catch (error) {
  console.warn('Math plugin not loaded:', error);
}

// Custom rendering rules

// Customize link rendering
const defaultLinkRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const hrefIndex = token.attrIndex('href');

  if (hrefIndex >= 0) {
    const href = token.attrs[hrefIndex][1];

    // Check if it's an external link (http/https)
    if (href.startsWith('http://') || href.startsWith('https://')) {
      // Add target="_blank" for external links
      token.attrPush(['target', '_blank']);
      token.attrPush(['rel', 'noopener noreferrer']);
      token.attrPush(['class', 'external-link']);
    } else if (href.startsWith('#')) {
      // Anchor link - keep as is
      token.attrPush(['class', 'anchor-link']);
    } else {
      // Internal link - mark for special handling
      token.attrPush(['class', 'internal-link']);
      token.attrPush(['data-href', href]);
      // Use javascript:void(0) to prevent any navigation
      token.attrs[hrefIndex][1] = 'javascript:void(0)';
    }
  }

  return defaultLinkRender(tokens, idx, options, env, self);
};

// Customize image rendering for error handling
md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const srcIndex = token.attrIndex('src');
  const altText = token.content;

  if (srcIndex >= 0) {
    const src = token.attrs[srcIndex][1];
    const resolvedSrc = resolveImagePath(src, env.currentFilePath);

    return `<img src="${resolvedSrc}" alt="${altText}" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22>Image not found</text></svg>'; this.title='${altText}';" />`;
  }

  return self.renderToken(tokens, idx, options);
};

// Resolve image path
function resolveImagePath(src, currentFilePath) {
  // If it's a URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // If it's a data URL, return as is
  if (src.startsWith('data:')) {
    return src;
  }

  // Otherwise, resolve relative to current file
  if (currentFilePath) {
    const currentDir = path.dirname(currentFilePath);
    const resolvedPath = path.resolve(currentDir, src);
    // Convert to file:// URL for Electron
    return 'file:///' + resolvedPath.replace(/\\/g, '/');
  }

  return src;
}

// Process Azure DevOps specific syntax
function processAzureDevOpsSyntax(content, currentFilePath) {
  // Process [[_TOC_]] - Table of Contents
  content = content.replace(/\[\[_TOC_\]\]/gi, () => {
    return '<!-- TOC_PLACEHOLDER -->';
  });

  // Process [[_TOSP_]] - Table of Subpages
  content = content.replace(/\[\[_TOSP_\]\]/gi, () => {
    return '<!-- TOSP_PLACEHOLDER -->';
  });

  // Process [[Page-Name]] - Wiki-style internal links
  content = content.replace(/\[\[([^\]]+)\]\]/g, (match, pageName) => {
    // Skip if it's _TOC_, _TOSP_, or other special markers
    if (pageName.startsWith('_') && pageName.endsWith('_')) {
      return match;
    }

    // Handle [[Page-Name|Display Text]] syntax
    let fileName, displayName;
    if (pageName.includes('|')) {
      const parts = pageName.split('|');
      fileName = parts[0].trim().replace(/\s+/g, '-') + '.md';
      displayName = parts[1].trim();
    } else {
      fileName = pageName.trim().replace(/\s+/g, '-') + '.md';
      displayName = pageName.trim();
    }

    return `[${displayName}](${fileName})`;
  });

  // Process @mentions - Style but don't make them functional
  content = content.replace(/@(\w+)/g, (match, username) => {
    return `<span class="mention">@${username}</span>`;
  });

  // Process work item links (#ID) - Style but don't make them functional
  content = content.replace(/#(\d+)/g, (match, id) => {
    return `<span class="work-item-link" title="Work Item ${id}">#${id}</span>`;
  });

  // Process attachment links - [[attachment:filename.ext]]
  content = content.replace(/\[\[attachment:([^\]]+)\]\]/gi, (match, filename) => {
    return `<a href="#" class="attachment-link" data-attachment="${filename}">📎 ${filename}</a>`;
  });

  // Process ::: mermaid blocks
  let mermaidCounter = 0;
  content = content.replace(/:::[\s]*mermaid\s*\n([\s\S]*?):::/gi, (match, diagramCode) => {
    const id = `mermaid-${Date.now()}-${mermaidCounter++}`;
    return `\n<div class="mermaid-diagram" id="${id}">\n${diagramCode.trim()}\n</div>\n`;
  });

  // Manual emoji replacements as fallback (common ones)
  const emojiMap = {
    ':smile:': '😄', ':tada:': '🎉', ':rocket:': '🚀', ':warning:': '⚠️',
    ':white_check_mark:': '✅', ':x:': '❌', ':bulb:': '💡', ':fire:': '🔥',
    ':star:': '⭐', ':heart:': '❤️', ':thumbsup:': '👍', ':thumbsdown:': '👎',
    ':eyes:': '👀', ':memo:': '📝', ':books:': '📚', ':hammer:': '🔨',
    ':computer:': '💻', ':thinking:': '🤔', ':question:': '❓', ':exclamation:': '❗'
  };

  // Apply manual emoji replacements if plugin didn't load
  Object.keys(emojiMap).forEach(shortcode => {
    const regex = new RegExp(shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, emojiMap[shortcode]);
  });

  return content;
}

// Generate Table of Contents
function generateTOC(html) {
  const div = document.createElement('div');
  div.innerHTML = html;

  const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    return '';
  }

  let toc = '<nav class="table-of-contents">\n<ul>\n';
  let currentLevel = 1;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent;
    const id = heading.id || `heading-${index}`;

    // Ensure heading has an ID
    if (!heading.id) {
      heading.id = id;
    }

    // Adjust nesting
    while (currentLevel < level) {
      toc += '<ul>\n';
      currentLevel++;
    }
    while (currentLevel > level) {
      toc += '</ul>\n';
      currentLevel--;
    }

    toc += `<li><a href="#${id}">${text}</a></li>\n`;
  });

  // Close remaining lists
  while (currentLevel > 1) {
    toc += '</ul>\n';
    currentLevel--;
  }

  toc += '</ul>\n</nav>';

  return toc;
}

// Generate Table of Subpages (TOSP)
async function generateTOSP(currentFilePath) {
  if (!currentFilePath) {
    return '<p><em>Table of subpages not available</em></p>';
  }

  try {
    const currentDir = path.dirname(currentFilePath);
    const currentFile = path.basename(currentFilePath);

    // Use IPC to get files in the current directory
    const fs = require('fs').promises;
    const files = await fs.readdir(currentDir);

    // Filter for markdown files, excluding current file and index files
    const mdFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return (ext === '.md' || ext === '.markdown') &&
             file !== currentFile &&
             file.toLowerCase() !== 'index.md' &&
             file.toLowerCase() !== 'index.markdown';
    });

    if (mdFiles.length === 0) {
      return '<p><em>No subpages found in this directory</em></p>';
    }

    // Sort files alphabetically
    mdFiles.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    // Generate list
    let tosp = '<nav class="table-of-subpages">\n<h3>Pages in this section:</h3>\n<ul>\n';
    mdFiles.forEach(file => {
      const nameWithoutExt = path.basename(file, path.extname(file));
      const displayName = nameWithoutExt.replace(/-/g, ' ');
      tosp += `<li><a href="${file}">${displayName}</a></li>\n`;
    });
    tosp += '</ul>\n</nav>';

    return tosp;
  } catch (error) {
    console.error('Error generating TOSP:', error);
    return '<p><em>Error generating table of subpages</em></p>';
  }
}

// Render markdown
async function renderMarkdown(content, currentFilePath) {
  try {
    // Process Azure DevOps specific syntax
    const processedContent = processAzureDevOpsSyntax(content, currentFilePath);

    // Render markdown to HTML
    const env = { currentFilePath: currentFilePath };
    let html = md.render(processedContent, env);

    // Generate and insert TOC if placeholder exists
    if (html.includes('<!-- TOC_PLACEHOLDER -->')) {
      const toc = generateTOC(html);
      html = html.replace(/<!-- TOC_PLACEHOLDER -->/g, toc);
    }

    // Generate and insert TOSP if placeholder exists
    if (html.includes('<!-- TOSP_PLACEHOLDER -->')) {
      const tosp = await generateTOSP(currentFilePath);
      html = html.replace(/<!-- TOSP_PLACEHOLDER -->/g, tosp);
    }

    // Update content viewer
    const contentViewer = document.getElementById('markdown-content');

    // Remove old event listeners by cloning the node (removes all listeners)
    const oldViewer = contentViewer;
    const newViewer = oldViewer.cloneNode(false);
    oldViewer.parentNode.replaceChild(newViewer, oldViewer);

    // Update reference
    const viewer = document.getElementById('markdown-content');
    viewer.innerHTML = html;

    // Add a general click listener for debugging
    viewer.addEventListener('click', (e) => {
      console.log('=== Click detected on content area ===');
      console.log('Target:', e.target.tagName, e.target.className, e.target.textContent?.substring(0, 50));
    }, true);

    // Process internal links
    processInternalLinks(viewer, currentFilePath);

    // Check for broken internal links
    await checkBrokenLinks(viewer, currentFilePath);

    // Render mermaid diagrams
    await renderMermaidDiagrams(viewer);

    // Make task list checkboxes interactive (read-only for now)
    makeTaskListsInteractive(viewer);

  } catch (error) {
    console.error('Error rendering markdown:', error);
    const contentViewer = document.getElementById('markdown-content');
    contentViewer.innerHTML = `
      <div class="error-message">
        <h3>Error rendering markdown</h3>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
}

// Process internal links
function processInternalLinks(container, currentFilePath) {
  const internalLinks = container.querySelectorAll('a.internal-link');
  const anchorLinks = container.querySelectorAll('a.anchor-link');
  const externalLinks = container.querySelectorAll('a.external-link');

  console.log(`=== Processing Links ===`);
  console.log(`Found ${internalLinks.length} internal links`);
  console.log(`Found ${anchorLinks.length} anchor links`);
  console.log(`Found ${externalLinks.length} external links`);

  // Log details about internal links for debugging
  internalLinks.forEach((link, index) => {
    const href = link.getAttribute('data-href');
    const actualHref = link.getAttribute('href');
    const textContent = link.textContent;
    console.log(`Internal link ${index}: text="${textContent}", data-href="${href}", href="${actualHref}"`);
  });

  // UNIVERSAL HANDLER: Catch ALL anchor clicks in capture phase
  // This runs BEFORE any bubbling handlers, ensuring we catch everything first
  container.addEventListener('click', async (e) => {
    // Find if an anchor was clicked
    const anchor = e.target.closest('a');
    if (!anchor) return;

    // ALWAYS prevent default for ALL links to stop navigation
    e.preventDefault();
    e.stopPropagation();

    console.log('=== UNIVERSAL ANCHOR HANDLER ===');
    console.log('Anchor clicked:', {
      href: anchor.getAttribute('href'),
      dataHref: anchor.getAttribute('data-href'),
      className: anchor.className,
      text: anchor.textContent?.substring(0, 50)
    });

    // Check if it's an internal link
    if (anchor.classList.contains('internal-link')) {
      const href = anchor.getAttribute('data-href');
      console.log('Processing internal link:', href);

      // Check if it's an anchor link within the same page
      if (href && href.includes('#')) {
        const [filePart, anchorPart] = href.split('#');
        if (filePart === '' || filePart === path.basename(currentFilePath)) {
          const targetElement = container.querySelector(`#${anchorPart}`);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
          return;
        }
      }

      // Resolve the file path
      const resolvedPath = await ipcRenderer.invoke('resolve-path', currentFilePath, href);
      console.log('Resolved path:', resolvedPath);

      // Check if file exists
      let exists = await ipcRenderer.invoke('file-exists', resolvedPath);
      let finalPath = resolvedPath;

      if (!exists) {
        // Try with .md extension if not already present
        if (!resolvedPath.endsWith('.md') && !resolvedPath.endsWith('.markdown')) {
          const withMd = resolvedPath + '.md';
          exists = await ipcRenderer.invoke('file-exists', withMd);
          if (exists) {
            finalPath = withMd;
          }
        }
      }

      if (exists) {
        console.log('Loading file:', finalPath);
        await window.loadMarkdownFile(finalPath);
      } else {
        console.error('File not found:', href);
        alert(`File not found: ${href}`);
      }
    }
    // External links - open in default browser
    else if (anchor.classList.contains('external-link')) {
      const href = anchor.getAttribute('href');
      console.log('Opening external link in browser:', href);
      shell.openExternal(href);
    }
    // Anchor links within page
    else if (anchor.classList.contains('anchor-link')) {
      const href = anchor.getAttribute('href');
      const targetId = href.substring(1); // Remove #
      const targetElement = container.querySelector(`#${targetId}`);
      if (targetElement) {
        console.log('Scrolling to anchor:', targetId);
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    // Catch-all for any other links - prevent navigation
    else {
      console.warn('Unhandled link type:', anchor.className, anchor.getAttribute('href'));
    }
  }, true); // Use capture phase to ensure we catch the event first

  console.log(`=== Link Handler Installed ===`);
}

// Check for broken internal links
async function checkBrokenLinks(container, currentFilePath) {
  const internalLinks = container.querySelectorAll('a.internal-link');

  for (const link of internalLinks) {
    const href = link.getAttribute('data-href');

    // Skip anchor-only links
    if (href.startsWith('#')) continue;

    // Remove anchor if present
    const filePart = href.split('#')[0];
    if (!filePart) continue;

    // Resolve path
    const resolvedPath = await ipcRenderer.invoke('resolve-path', currentFilePath, filePart);

    // Check if exists
    let exists = await ipcRenderer.invoke('file-exists', resolvedPath);

    // Try with .md extension
    if (!exists && !resolvedPath.endsWith('.md') && !resolvedPath.endsWith('.markdown')) {
      exists = await ipcRenderer.invoke('file-exists', resolvedPath + '.md');
    }

    // Mark broken links
    if (!exists) {
      link.classList.add('broken-link');
      link.title = 'File not found: ' + href;
    }
  }
}

// Render Mermaid diagrams
async function renderMermaidDiagrams(container) {
  const diagrams = container.querySelectorAll('.mermaid-diagram');

  // Check if Mermaid is available
  if (!window.mermaid || typeof window.mermaid.render !== 'function') {
    console.warn('Mermaid not available, skipping diagram rendering');
    return;
  }

  for (const diagram of diagrams) {
    try {
      const code = diagram.textContent.trim();
      const id = diagram.id;

      // Render the diagram using global mermaid
      const { svg } = await window.mermaid.render(id + '-svg', code);

      // Replace the div content with the SVG
      diagram.innerHTML = svg;
      diagram.classList.add('mermaid-rendered');

    } catch (error) {
      console.error('Mermaid rendering error:', error);
      diagram.innerHTML = `
        <div class="error-message">
          <p><strong>Error rendering diagram:</strong></p>
          <p>${error.message}</p>
          <pre>${diagram.textContent}</pre>
        </div>
      `;
      diagram.classList.add('mermaid-error');
    }
  }
}

// Make task lists interactive
function makeTaskListsInteractive(container) {
  const checkboxes = container.querySelectorAll('.task-list-item-checkbox');

  checkboxes.forEach(checkbox => {
    // Make them look interactive but don't actually change the file
    checkbox.addEventListener('click', (e) => {
      e.preventDefault();
      // Could implement actual file editing here in the future
      alert('Task list editing is not yet implemented. This is a read-only viewer.');
    });
  });
}

// Export function
window.renderMarkdown = renderMarkdown;

})(); // End of IIFE
