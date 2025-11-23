# Quick Start Guide

Get the Azure DevOps Wiki Viewer up and running in 5 minutes!

## Step 1: Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

This will download all required packages (~200MB, may take 2-5 minutes).

## Step 2: Run the Application

```bash
npm start
```

The application window should open automatically.

## Step 3: Select Your Wiki Folder

1. Click "Select Wiki Folder" on the welcome screen
2. Browse to your Azure DevOps wiki folder
3. Click "Select Folder"

The file tree will load and display your wiki structure.

## Step 4: Browse Your Wiki

- Click folders to expand/collapse
- Click markdown files to view them
- Use the search bar to find files quickly
- Try the different themes (light/dark/system)

## That's it!

You're ready to browse your wiki offline.

---

## Don't Have a Wiki Yet?

### Create a Sample Wiki

Create a test folder structure:

```
my-test-wiki/
├── index.md
├── Getting-Started.md
└── Guides/
    ├── index.md
    └── Tutorial.md
```

**index.md:**
```markdown
# Welcome to My Wiki

[[_TOC_]]

## Overview
This is a sample wiki for testing.

## Quick Links
- [[Getting-Started]]
- [[Guides/Tutorial]]

## Features
- [x] Markdown support
- [x] Mermaid diagrams
- [ ] More features coming soon
```

**Getting-Started.md:**
```markdown
# Getting Started

This guide will help you get started.

## Prerequisites
1. Install required software
2. Configure settings
3. Start using the application

## Code Example

```javascript
function hello() {
  console.log("Hello, World!");
}
```

## Diagram

::: mermaid
graph LR
    A[Start] --> B[Install]
    B --> C[Configure]
    C --> D[Use]
:::
```

**Guides/index.md:**
```markdown
# Guides

Browse our collection of guides:

- [[Tutorial]]
```

**Guides/Tutorial.md:**
```markdown
# Tutorial

## Step 1
Do this first.

## Step 2
Then do this.

> **Note:** This is important!
```

Point the viewer to the `my-test-wiki` folder and explore!

---

## Building the Executable

When you're ready to create a standalone .exe:

```bash
npm run build
```

The installer will be in the `dist` folder.

---

## Need Help?

- Check the main [README.md](README.md) for full documentation
- See [DEVELOPMENT.md](DEVELOPMENT.md) for developer info
- Check the console (press F12) for error messages
