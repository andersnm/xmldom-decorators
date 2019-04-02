# xmldom-decorators - TypeScript decorators and (de-)serializer for xmldom

See [packages/xmldom-decorators](packages/xmldom-decorators)

# xmldom-decorators-cli - XSD to TypeScript classes with decorators

See [packages/xmldom-decorators-cli](packages/xmldom-decorators-cli)

# Notes to self

Check out the source code and install dependencies:

```bash
git clone REPO-URL
cd xmldom-decorators
npm install
```

Build, run tests and execute a REST API sample:

```bash
npm run build # shortcut for ./node_modules/.bin/blerf run build
npm run test  # shortcut for ./node_modules/.bin/blerf run test
node ./packages/sample-clients location
```

Create packages for npm publish:

```bash
npm run pack  # shortcut for ./node_modules/.bin/blerf pack
```

See [packages/blerf](packages/blerf)
