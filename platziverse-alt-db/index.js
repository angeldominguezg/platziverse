'use strict'
const setupDatabase = require('./lib/db')
const setupAgentModel = require('./models/agent')
const setupMetricModel = require('./models/metric')

module.exports = async function (config) {
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

  const Agent = {}
  const Metric = {}

  return {
    Agent,
    Metric
  }
}
