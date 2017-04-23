# at-types

## feature
Typescript utility automatically install all missing `@types/*` from rootpath 's project's package.json.

```sh
 $ yarn add react react-dom
....
 $ at-types i
executing yarn add @types/react @types/react-dom
yarn add v0.23.2
warning No license field
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 📃  Building fresh packages...
success Saved lockfile.
success Saved 2 new dependencies.
├─ @types/react-dom@15.5.0
└─ @types/react@15.0.22
warning No license field
✨  Done in 1.43s.
```

the list of `@types/*` were fetched from [`npms.io`](https://npms.io) 's api when the package is published, available at [here](https://unpkg.com/at-types/at-types-list.json) or under the project root `at-types-list.json`

you can run `at-types update` to update the `@types/*` available.

## cli

`i` -> `install`
use `-e npm` if you want to do `npm install` over `yarn add`

`u` -> `update`