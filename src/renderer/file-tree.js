// Wrap in IIFE to prevent global scope pollution
(function() {
const { ipcRenderer } = require('electron');

const fileTreeContainer = document.getElementById('file-tree');

// Load file tree
async function loadFileTree() {
  if (!window.appState.wikiRootPath) return;

  const tree = await ipcRenderer.invoke('get-file-tree', window.appState.wikiRootPath);

  if (tree) {
    renderFileTree(tree, fileTreeContainer);
  } else {
    fileTreeContainer.innerHTML = '<div class="error-message">Error loading file tree</div>';
  }
}

// Render file tree
function renderFileTree(items, container) {
  container.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'tree-list';

  items.forEach(item => {
    const li = createTreeItem(item);
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

// Create tree item
function createTreeItem(item) {
  const li = document.createElement('li');
  li.className = 'tree-item';
  li.dataset.path = item.path;
  li.dataset.type = item.type;

  if (item.type === 'directory') {
    // Create folder header
    const header = document.createElement('div');
    header.className = 'tree-item-header folder';

    const icon = document.createElement('span');
    icon.className = 'tree-icon folder-icon collapsed';
    icon.innerHTML = '▶';

    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = item.name;

    header.appendChild(icon);
    header.appendChild(label);
    li.appendChild(header);

    // Create children container
    if (item.children && item.children.length > 0) {
      const childrenUl = document.createElement('ul');
      childrenUl.className = 'tree-list nested';
      childrenUl.style.display = 'none';

      item.children.forEach(child => {
        const childLi = createTreeItem(child);
        childrenUl.appendChild(childLi);
      });

      li.appendChild(childrenUl);
    }

    // Click handler for folder
    header.addEventListener('click', (e) => {
      e.stopPropagation();

      // Toggle folder expansion
      const isExpanded = icon.classList.contains('expanded');
      const nestedList = li.querySelector('.tree-list.nested');

      if (isExpanded) {
        // Collapse
        icon.classList.remove('expanded');
        icon.classList.add('collapsed');
        icon.innerHTML = '▶';
        if (nestedList) {
          nestedList.style.display = 'none';
        }
      } else {
        // Expand
        icon.classList.remove('collapsed');
        icon.classList.add('expanded');
        icon.innerHTML = '▼';
        if (nestedList) {
          nestedList.style.display = 'block';
        }
      }
      // NOTE: Removed automatic index file loading to prevent flickering
      // Users can click on the folder's index.md file directly if they want to view it
    });

  } else if (item.type === 'file') {
    // Create file item
    const header = document.createElement('div');
    header.className = 'tree-item-header file';

    const icon = document.createElement('span');
    icon.className = 'tree-icon file-icon';
    icon.innerHTML = '📄';

    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = item.name;

    header.appendChild(icon);
    header.appendChild(label);
    li.appendChild(header);

    // Click handler for file
    header.addEventListener('click', async (e) => {
      e.stopPropagation();
      await window.loadMarkdownFile(item.path);
    });
  }

  return li;
}

// Highlight current file in tree
function highlightCurrentFile(filePath) {
  // Remove previous highlights
  const previousHighlight = fileTreeContainer.querySelector('.tree-item-header.active');
  if (previousHighlight) {
    previousHighlight.classList.remove('active');
  }

  // Find and highlight current file
  const allItems = fileTreeContainer.querySelectorAll('.tree-item');
  allItems.forEach(item => {
    if (item.dataset.path === filePath) {
      const header = item.querySelector('.tree-item-header');
      if (header) {
        header.classList.add('active');

        // Expand parent folders
        expandParentFolders(item);

        // Scroll into view
        header.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  });
}

// Expand parent folders
function expandParentFolders(element) {
  let parent = element.parentElement;

  while (parent && parent !== fileTreeContainer) {
    if (parent.classList.contains('tree-list') && parent.classList.contains('nested')) {
      // This is a nested list, show it
      parent.style.display = 'block';

      // Find the parent li and expand its icon
      const parentLi = parent.parentElement;
      if (parentLi && parentLi.classList.contains('tree-item')) {
        const icon = parentLi.querySelector('.folder-icon');
        if (icon) {
          icon.classList.remove('collapsed');
          icon.classList.add('expanded');
          icon.innerHTML = '▼';
        }
      }
    }
    parent = parent.parentElement;
  }
}

// Export functions
window.loadFileTree = loadFileTree;
window.highlightCurrentFile = highlightCurrentFile;

})(); // End of IIFE
