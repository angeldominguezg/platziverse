'use strict'
const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

let config = {
  logging () {}
}

let db = null
let sandbox = null
let AgentStub = null
let MetricStub = null

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  MetricStub = { belongsTo: sandbox.spy() }
  AgentStub = { hasMany: sinon.spy() }

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
  t.true(AgentStub.hasMany.calledWith(MetricStub),'Argument should be the model')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belosngsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub),'Argument should be the model')
})

// Test for create
test.serial('Metric#Create', t => {
  
})
