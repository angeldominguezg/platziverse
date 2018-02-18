# platziverse-db

## USAGE
```js
const setupdatabase = require('platziverse-db')

setupDatabase(config).then(db => {
  // With object destructuring assing
  const {Agent, Metric} = db
  // Old fashion way assing
  // const Agent = db.Agent
  // const Metric = db.Metric
}).catch(err => console.log(err))

```