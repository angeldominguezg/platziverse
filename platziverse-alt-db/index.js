'use strict'
const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')
const setupAgent = require('./lib/agent')
const defaults = require('defaults')

module.exports = async function (config) {
  // defaults data for test coneections
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  // Database
  const sequelize = setupDatabase(config)
  const AgentModel = setupAgentModel(config)
  const MetricModel = setupMetricModel(config)

  // Relaciones entre los modelos
  AgentModel.hasMany(MetricModel)
  MetricModel.belongsTo(AgentModel)

  // Verificacion que la base de datos este bien configurada
  await sequelize.authenticate()

  // si config.setup es true borra y contruye nuevamente la base de datos
  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  // ----------

  const Agent = setupAgent(AgentModel)
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
