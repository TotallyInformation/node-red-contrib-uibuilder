# Updating Node.js via winget

## What I want to do
I want to update Node.js to the latest version of my currently installed major version using Windows Package Manager (winget).

## Context
- I'm using Windows 10/11
- I have winget installed
- I want to stay on the same major version of Node.js
- I need to verify the update worked correctly

## Expected steps
1. Check my current Node.js version
2. Verify Node.js is installed via winget
3. Update Node.js using winget
4. Verify the update was successful

## References
- Current version check command: `node -v`
- Winget list command: `winget list nodejs-lts`
- Winget update command: `winget upgrade nodejs-lts`
- Alternative update with source: `winget upgrade OpenJS.NodeJS.LTS --source winget`
- If needed, reinstall command: `winget uninstall OpenJS.NodeJS.LTS && winget install OpenJS.NodeJS.LTS`

## Example solution
```powershell
# Check current Node.js version
node -v

# Check if Node.js is installed via winget
winget list nodejs-lts

# Update Node.js to the latest version within same major version
winget upgrade OpenJS.NodeJS.LTS

# Verify the update
node -v
npm -v

# Optional: Check global packages
npm list -g --depth=0
```

## Troubleshooting
- If update fails, try specifying source with `--source winget`
- If still failing, consider uninstalling and reinstalling
- Remember to check global npm packages after major version changes
