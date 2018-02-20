'use stirct'
const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {}
}

// Stubs
let MetricStub = {
  belongsTo: sinon.spy()
}
let single = Object.assign({}, agentFixtures.single)
let id = 1
let AgentStub = null
let db = null
let sandbox = null

// Antes de cada test ejecuta la siguiente funcion asincrona
test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  AgentStub = {
    hasMany: sandbox.spy()
  }
  // Model findById Stub 
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.findById(id)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(t => {
  sandbox && sinon.sandbox.restore()
})

test('Agent', t => {
  t.truthy(db.Agent, `Agent Service should exist`)
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the model')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belosngsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the model')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)
  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be calles once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with args')
  t.deepEqual(agent, agentFixtures.findById(id), 'Should be the same.')
})
