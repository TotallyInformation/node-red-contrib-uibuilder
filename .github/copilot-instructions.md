# Copilot Instructions

This repository is a set of nodes to be used with the Node-RED platform along with some front-end libraries and web components that complement them. This makes up a web application development framework focused on low-code solutions. It allows users of Node-RED to create web applications with minimal coding effort.

When contributing to this repository, please adhere to the following guidelines to ensure code quality, maintainability, and consistency across the project.

## Repository Structure

- `nodes/`: Contains Node-RED node definitions and related code. The `libs/` subdirectory holds shared libraries used by multiple nodes.
- `frontend/`: Contains the live, built front-end libraries and web components that complement the Node-RED nodes.
- `src/`: Contains the source code that must be built for live use.
    - `front-end-module/`: Contains source code for front-end components and libraries before they are built.
    - `components/`: Contains reusable UI components used across the front-end modules. These are mostly built into the front-end library.
    - `editor/`: Contains source code for the Node-RED editor UI components that have not yet been converted to use the `resources/` folder.
    - `doc-bundle/`: Contains source code that is built to enable the Docsify based documentation to work offline.
- `resources/`: Contains static resources used by Node-RED nodes in the editor UI.
- `templates/`: Contains folders that are either copied to the deployed Node-RED instance or used as templates for front-end instances.
- `docs/`: Contains documentation related to the project, including usage guides and API references

## Core Requirements

- Follow project ESLINT configurations
- Ensure WCAG 2.2 Level AA compliance
- Apply Shift-Left security practices
- Adherence to Best Practices: All suggestions, architectural patterns, and solutions must align with widely accepted industry best practices and established design principles. Avoid experimental, obscure, or overly "creative" approaches. Stick to what is proven and reliable.
- Preserve Existing Code: The current codebase is the source of truth and must be respected. Prefer preservation of existing structure, style, and logic, however, present good alternatives where they exist.

## Code Style

### JavaScript/TypeScript

- For node.js, use features available to the latest LTS version but warn if using features not available to v18
- For browsers, use features available to 90%+ browsers/users
- No trailing semicolons
- Single quotes for strings
- Use trailing commas
- Indent code blocks with 4 spaces
- Use const by default, let when needed
- Prefer arrow functions
- Use optional chaining
- Add JSDoc if missing
- Add TypeScript types/interfaces even for JavaScript files
- Assume the use of ESLINT v9

### Documentation

- Include JSDoc for functions and classes
- Place the first line of JSDoc description on the same line as the /**
- Add @param and @returns tags
- Document thrown errors
- Include usage examples for complex functions

### HTML/CSS

- Use semantic HTML elements
- Only use features available to 90%+ browsers/users
- Include ARIA attributes where needed
- Mobile-first responsive design
- Prefer relative sizing such as %, em or rem units
- Avoid the use of px sizing whenever possible
- Use CSS custom properties
- Follow BEM naming convention
- Include print styles
- Always use hsl colors
- Indent code blocks with 4 spaces

## Testing

- Write unit tests using Vitest
- Include accessibility tests
- Maintain >80% code coverage
- Test error scenarios

## Performance

- Lazy load components when possible
- Optimize images and assets
- Keep bundle size minimal
- Use proper caching strategies

## Security

- Sanitize user inputs
- Validate data on server-side
- Follow OWASP guidelines
- Use Content Security Policy
