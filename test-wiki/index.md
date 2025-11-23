# Test Wiki

Welcome to the test wiki! This file tests all the major features of the viewer.

[[_TOC_]]

## Basic Markdown

This is a paragraph with **bold text**, *italic text*, and ~~strikethrough~~.

Here's an inline code example: `console.log("Hello")`

### Lists

**Unordered:**
- Item 1
- Item 2
  - Nested item
  - Another nested

**Ordered:**
1. First
2. Second
3. Third

### Task Lists

- [x] Feature 1 implemented
- [x] Feature 2 implemented
- [ ] Feature 3 in progress

## Links

### Internal Wiki Links
- [[Getting-Started]] - Wiki-style link
- [[folder/Page-In-Folder]] - Link to page in folder

### Regular Markdown Links
- [Another Page](./Getting-Started.md)
- [Google](https://www.google.com) - External link (opens in browser)

## Code Blocks

### JavaScript
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("World"));
```

### Python
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```

### PowerShell
```powershell
Get-Process | Where-Object {$_.CPU -gt 100} | Select-Object Name, CPU
```

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Markdown | ✓ Done | High |
| Mermaid | ✓ Done | High |
| Search | ✓ Done | Medium |
| Themes | ✓ Done | Medium |

## Mermaid Diagrams

### Flowchart
::: mermaid
graph LR
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
    C --> E[End]
:::

### Sequence Diagram
::: mermaid
sequenceDiagram
    User->>App: Click Select Folder
    App->>System: Open Dialog
    System->>User: Show Folder Picker
    User->>System: Select Folder
    System->>App: Return Path
    App->>User: Load Wiki
:::

### Pie Chart
::: mermaid
pie title Features Implemented
    "Core Features" : 40
    "Markdown Support" : 30
    "Theming" : 15
    "Search" : 15
:::

## Block Quotes

> This is a block quote.
> It can span multiple lines.
>
> And have multiple paragraphs.

## Horizontal Rule

---

## HTML Tags

<details>
<summary>Click to expand</summary>

This content is hidden until you click the summary!

You can put any markdown here:
- Lists
- **Bold text**
- Code blocks

</details>

## Images

If you have an image file, it would look like this:

![Example Image](./images/example.png)

---

**Navigation:**
- [[Getting-Started]] - Next page
- [[Priority-2-Features]] - NEW: See all Priority 2 features (math, emoji, @mentions, #workitems)
- [[folder/Nested-Page]] - Nested example
