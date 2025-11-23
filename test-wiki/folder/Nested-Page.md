# Nested Page

This page is in a subfolder to test folder navigation.

## Folder Structure

The test wiki has this structure:
```
test-wiki/
├── index.md (you saw this first)
├── Getting-Started.md
└── folder/
    ├── index.md
    └── Nested-Page.md (you are here)
```

## Navigation from Nested Pages

You can navigate back to the root:
- [[index]] - Goes to root index
- [[Getting-Started]] - Goes to root Getting-Started page
- [../index.md](../index.md) - Relative path to root

## Local Navigation

- [[index]] - Goes to folder/index.md
- [index.md](./index.md) - Same as above

## Mermaid in Nested Page

::: mermaid
graph TD
    A[Root Index] --> B[Getting Started]
    A --> C[Folder]
    C --> D[Folder Index]
    C --> E[Nested Page]
:::

## Status Check

If you can see this page, then:
- ✓ Folder navigation works
- ✓ Nested file loading works
- ✓ Relative paths work
- ✓ Wiki-style links from nested pages work
