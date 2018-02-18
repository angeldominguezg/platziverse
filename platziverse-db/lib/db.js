'use strict'
const Sequilize = require('sequelize')
let sequelize = null

module.exports = function setupDatabase (config) {
  if (!sequelize) {
    sequelize = new Sequilize(config)
  }
  return sequelize
}
