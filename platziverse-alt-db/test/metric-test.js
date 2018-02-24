'use strict'
const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')
// const metricFixtures = require('./fixtures/metric')

let config = {
  logging () {}
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

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  MetricStub = { belongsTo: sandbox.spy() }
  AgentStub = { hasMany: sinon.spy() }

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))

  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({ toJSON () { return newMetric } }))

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
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the model')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belosngsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the model')
})

// Test for create
test.serial('Metric#Create', async t => {
  let metric = await db.Metric.create(uuid, newMetric)
  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')

  t.true(MetricStub.create.called, 'Create should be called on model')
  t.true(MetricStub.create.calledOnce, 'Create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with specified args')

  t.deepEqual(metric, newMetric, 'agent should be the same')
})
