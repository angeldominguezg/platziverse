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

const metrics = [
  metric,
  extend(metric, { id: 2, value: '256mb' }),
  extend(metric, { id: 3, value: '512mb' }),
  extend(metric, {
    id: 4,
    agentId: 2,
    type: 'CPU',
    value: '25%',
    agent: agentfixtures.findById(2)
  })
]

// TODO: Unificar esta funcion como una utilidad
function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function findByAgentUuid (uuid) {
  return metrics.filter(m => m.agent ? m.agent.uuid === uuid : false).map(m => {
    const clone = Object.assign({}, m)
    delete clone.agent
    return clone
  })
}

module.exports = {
  all: metrics,
  findByAgentUuid
}
