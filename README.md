# xmldom-decorators - TypeScript decorators and (de-)serializer for xmldom

See [packages/xmldom-decorators](packages/xmldom-decorators)

# xmldom-decorators-cli - XSD to TypeScript classes with decorators

See [packages/xmldom-decorators-cli](packages/xmldom-decorators-cli)

# Notes to self

Working on the source code:

```
git clone REPO-URL
cd xmldom-decorators
npm install
./node_modules/.bin/lerna bootstrap
./node_modules/.bin/lerna run build
./node_modules/.bin/lerna run test
```

Testing the cli:

```
npm link ./packages/xmldom-decorators-cli
xmldom-decorators-cli
```

To change version of the packages (updates version field and project references in package.json)

```
lerna version --no-git-tag-version --no-push
```

Lerna's publish command replaces file dependencies with the version number in package.json, creates tarballs, git tags the version, and publishes to npm. Lerna does not support packing to a local tarball for review/inspection.

The following command creates tarballs without replacing file dependencies:

```
lerna exec -- npm pack
```
