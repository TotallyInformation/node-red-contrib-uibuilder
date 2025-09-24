When adding/changing *.md files in this folder,
remember to run:

npm run buildDocBundle

To rebuild the index (in docs/.config/index.js)

## Show tips

```markdown
[tip]                                    # Random tip
[tip:random]                            # Random tip (explicit)
[tip:rotate]                            # Rotating tip (updates every minute)
[tip:Browser and Node-RED are different contexts]  # Specific tip
```

## Available Tips

The plugin automatically discovers all `.md` files in the `tips/` folder.

