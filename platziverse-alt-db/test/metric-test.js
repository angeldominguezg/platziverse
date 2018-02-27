'use strict'
const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

let config = {
  logging() {}
}

let db = null
let sandbox = null
let AgentStub = null
let MetricStub = null
let uuid = 'yyy-yyy-yyy'
let newMetric = {
  agentid: 1,
  type: 'memory',
  value: '128mb'
}
let uuidArgs = {
  where: { uuid }
}

let metricUuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [
    {
      attributes: [],
      model: AgentStub,
      where: {
        uuid
      }
    }
  ],
  raw: true
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  MetricStub = { belongsTo: sandbox.spy() }
  AgentStub = { hasMany: sinon.spy() }

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(
    Promise.resolve({
      toJSON() {
        return newMetric
      }
    })
  )

  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs().returns(Promise.resolve(metricFixtures.all))
  MetricStub.findAll
    .withArgs(metricUuidArgs)
    .returns(Promise.resolve(metricFixtures.findByAgentUuid(uuid)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(t => {
  sandbox && sinon.sandbox.restore()
})

// test models exists
test('Agent', t => {
  t.truthy(db.Agent, 'Agent Service should exist')
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric Service should exist')
})

test.serial('Setup Metric', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    'Argument should be the model'
  )
  t.true(MetricStub.belongsTo.called, 'MetricModel.belosngsTo was executed')
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    'Argument should be the model'
  )
})

// Test for create
test.serial('Metric#Create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)
  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    'findOne should be called with uuid args'
  )

  t.true(MetricStub.create.called, 'Create should be called on model')
  t.true(MetricStub.create.calledOnce, 'Create should be called once')
  t.true(
    MetricStub.create.calledWith(newMetric),
    'create should be called with specified args'
  )

  t.deepEqual(metric, newMetric, 'agent should be the same')
})

// test for findByAgentUuid
test.serial('Metric#findByAgentUuid', async t => {
  let metric = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')

  // TODO: Corregir estos test
  t.true(MetricStub.findAll.calledWith(metricUuidArgs), 'findAll should be called with specified metricUuidArgs')
  t.deepEqual( metric, metricFixtures.findByAgentUuid(uuid), 'should be the same')
})
