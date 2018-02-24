'use strict'
/**
 * Setup database connection
 * Return database instance
**/
const Sequelize = require('sequelize')
let sequelize = null

module.exports = function setupDatabase (config) {
  // Si la instancia no existe, creo la instancia de conexion a la base de datos
  // de lo contrario retorno la instancia creada, con esto se evita instanciar la base de datos
  // cada vez que es llamada la funcion setupDatabase.
  if (!sequelize) {
    sequelize = new Sequelize(config)
  }

  return sequelize
}
