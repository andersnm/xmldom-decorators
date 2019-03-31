# blerf - Solution and project management tool for Node and NPM

Tool to manage multiple projects in a solution (aka monorepo)

## Features

- Install npm dependencies in multiple projects
- Run npm scripts in multiple project
- Run `npm pack` in multiple projects and fix up local project references
- Run scripts in topological order

## Commands

`blerf install`

Executes `npm install` in each directory under ./packages containing a package.json.

`blerf run [xxx]`

Executes `npm run [xxx]` in each directory under ./packages containing a package.json having a corresponding script.

`blerf pack`

Executes `npm pack` in each directory under ./packages containing a package.json and fixes up any project references in the tarballs. This extracts each tarball to a temp directory, changes any `file:` based dependencies in package.json to their corresponding version, updates the tarball and cleans up.

## Solution structure and conventions

- Create a root package.json with a dependency on blerf
- Create new projects in directories under ./packages
- Add project references as dependencies using relative `file:` references in package.json

## Release workflow

- Bump, build, tag, commit and push latest version using regular git and npm cli commands
- Use `blerf pack` instead of `npm pack` to create tarball(s)
- Use `npm login` / `npm publish`

