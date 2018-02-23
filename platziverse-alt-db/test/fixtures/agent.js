'use strict'

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

// agent array for listing, search cases
const agents = [
  agent,
  extend(agent, {
    id: 2,
    uuid: 'yyy-yyy-yyw',
    connected: false,
    username: 'test'
  }),
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyx' }),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', username: 'test' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

// export
module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected), // retorna los connectados
  platzi: agents.filter(a => a.username === 'platzi'), // retorna los del usuario platzi
  byUuid: id => agents.filter(a => a.uuid === id).shift(), // retorna por uuid
  findById: id => agents.filter(a => a.id === id).shift() // retorna por id
}
