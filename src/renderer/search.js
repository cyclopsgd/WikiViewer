// Wrap in IIFE to prevent global scope pollution
(function() {
const { ipcRenderer } = require('electron');
const path = require('path');

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

let searchTimeout = null;

// Initialize search
function initSearch() {
  searchInput.addEventListener('input', handleSearchInput);

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim() !== '') {
      searchResults.classList.remove('hidden');
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });

  // Handle keyboard navigation in search results
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
      searchInput.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusNextResult();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusPreviousResult();
    }
  });
}

// Handle search input
function handleSearchInput(e) {
  const query = e.target.value.trim();

  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (query === '') {
    searchResults.classList.add('hidden');
    return;
  }

  // Debounce search
  searchTimeout = setTimeout(() => {
    performSearch(query);
  }, 300);
}

// Perform search
async function performSearch(query) {
  if (!window.appState.wikiRootPath) {
    return;
  }

  try {
    const results = await ipcRenderer.invoke('search-files', window.appState.wikiRootPath, query);

    displaySearchResults(results, query);
  } catch (error) {
    console.error('Search error:', error);
    searchResults.innerHTML = '<div class="search-error">Error performing search</div>';
    searchResults.classList.remove('hidden');
  }
}

// Display search results
function displaySearchResults(results, query) {
  searchResults.innerHTML = '';

  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
    searchResults.classList.remove('hidden');
    return;
  }

  const resultsList = document.createElement('div');
  resultsList.className = 'search-results-list';

  // Limit to 20 results
  const limitedResults = results.slice(0, 20);

  limitedResults.forEach(result => {
    const resultItem = createSearchResultItem(result, query);
    resultsList.appendChild(resultItem);
  });

  // Add "showing X of Y results" if there are more
  if (results.length > 20) {
    const moreInfo = document.createElement('div');
    moreInfo.className = 'search-more-info';
    moreInfo.textContent = `Showing 20 of ${results.length} results`;
    resultsList.appendChild(moreInfo);
  }

  searchResults.appendChild(resultsList);
  searchResults.classList.remove('hidden');
}

// Create search result item
function createSearchResultItem(result, query) {
  const item = document.createElement('div');
  item.className = 'search-result-item';
  item.tabIndex = 0;

  const icon = document.createElement('span');
  icon.className = 'search-result-icon';
  icon.textContent = result.type === 'directory' ? '📁' : '📄';

  const content = document.createElement('div');
  content.className = 'search-result-content';

  const name = document.createElement('div');
  name.className = 'search-result-name';
  name.innerHTML = highlightMatch(result.name, query);

  const path = document.createElement('div');
  path.className = 'search-result-path';
  path.textContent = result.relativePath;

  content.appendChild(name);
  content.appendChild(path);

  item.appendChild(icon);
  item.appendChild(content);

  // Click handler
  const clickHandler = async () => {
    searchResults.classList.add('hidden');
    searchInput.value = '';

    if (result.type === 'file') {
      await window.loadMarkdownFile(result.path);
    } else if (result.type === 'directory') {
      // Try to load index file if it exists
      const path = require('path');
      const indexPath = path.join(result.path, 'index.md');
      const exists = await ipcRenderer.invoke('file-exists', indexPath);

      if (exists) {
        await window.loadMarkdownFile(indexPath);
      } else {
        // Just expand the folder in the tree
        expandFolderInTree(result.path);
      }
    }
  };

  item.addEventListener('click', clickHandler);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clickHandler();
    }
  });

  return item;
}

// Highlight matching text
function highlightMatch(text, query) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());

  if (index === -1) {
    return text;
  }

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  return `${before}<mark>${match}</mark>${after}`;
}

// Focus next result
function focusNextResult() {
  const items = searchResults.querySelectorAll('.search-result-item');
  const focused = document.activeElement;

  if (!items.length) return;

  if (!focused || !focused.classList.contains('search-result-item')) {
    items[0].focus();
  } else {
    const currentIndex = Array.from(items).indexOf(focused);
    const nextIndex = (currentIndex + 1) % items.length;
    items[nextIndex].focus();
  }
}

// Focus previous result
function focusPreviousResult() {
  const items = searchResults.querySelectorAll('.search-result-item');
  const focused = document.activeElement;

  if (!items.length) return;

  if (!focused || !focused.classList.contains('search-result-item')) {
    items[items.length - 1].focus();
  } else {
    const currentIndex = Array.from(items).indexOf(focused);
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    items[prevIndex].focus();
  }
}

// Expand folder in tree (helper function)
function expandFolderInTree(folderPath) {
  const fileTree = document.getElementById('file-tree');
  const allItems = fileTree.querySelectorAll('.tree-item');

  allItems.forEach(item => {
    if (item.dataset.path === folderPath && item.dataset.type === 'directory') {
      const icon = item.querySelector('.folder-icon');
      const nestedList = item.querySelector('.tree-list.nested');

      if (icon && nestedList) {
        icon.classList.remove('collapsed');
        icon.classList.add('expanded');
        icon.innerHTML = '▼';
        nestedList.style.display = 'block';

        // Scroll into view
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  });
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearch);
} else {
  initSearch();
}

})(); // End of IIFE
