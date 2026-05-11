<!-- BEGIN:nextjs-agent-rules -->

# Next.js v16.2.6 is used

Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Tailwind CSS v4 is used

Pay attention to the current file structure; `app/_styles/index.css` is the entry point.

# ESLint v9 is used

Please try to stick with the rules specified in `eslint.config.mjs`. Avoid adding inline comments.

# Shadcn/UI is used

# TypeScript is used

Please check the `tsconfig.json` file.

# Other

Instead of importing everything from `react` package, import only the parts you need and refer them directly (not as
e.g., `React.useEffect`).

<!-- END:nextjs-agent-rules -->
