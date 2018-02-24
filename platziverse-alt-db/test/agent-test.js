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
let uuid = 'yyy-yyy-yyy'
let AgentStub = null
let db = null
let sandbox = null
let uuidArgs = {
  where: {
    uuid
  }
}
let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}
let connectedArgs = {
  where: { connected: true }
}
let usernameArgs = {
  where: { username: 'platzi', connected: true }
}

// Antes de cada test ejecuta la siguiente funcion asincrona
test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.findById(id)))

  // Model findOne
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  // Model Update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model Create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // Model FindAll Stub
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))

  // FindConnected Stub
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))

  // FindByUsername Stub
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

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

test.serial('Agent#createOrUpdate - exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)
  // que sea igual el ajente que retorna la funcion al agente que se intenta crear
  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')
  t.deepEqual(agent, single, 'Agent should be the same')
})

test.serial('Agent#createOrpdate - new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith({
    where: { uuid: newAgent.uuid }
  }), 'FindOne Should be called with args')

  t.true(AgentStub.create.called, 'create should be calle on model')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specified args')

  t.deepEqual(agent, newAgent, 'Agent should be the same')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be calle on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.deepEqual(agent, single, 'Agent should be the same')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be called without args')

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()
  t.true(AgentStub.findAll.called, 'findAll should be calle on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with connected args')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername('platzi')
  t.true(AgentStub.findAll.called, 'findAll should be calle on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with username args')

  t.deepEqual(agents, agentFixtures.platzi, 'agents should be the same')
})
