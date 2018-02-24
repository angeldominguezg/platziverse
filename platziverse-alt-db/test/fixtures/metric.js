'use strict'
const agentfixtures = require('./agent')

const metric = {
  id: 1,
  agentid: 1,
  type: 'memory',
  value: '128mb',
  createdAt: new Date(),
  agent: agentfixtures.findById(1)
}

const metrics = {
  metric
}

module.exports = {
  all: metrics
}
