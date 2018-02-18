'use strinct'

module.exports = function setupAgent (AgentModel) {
  async function createOrUpdate(agent) {
    // find by uuid
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }
    // find the agent
    const existingAgent = await AgentModel.findOne(cond)
    if (existingAgent) {
      // if exist update
      const updated = await AgentModel.update(agent, cond)
      return updated ? AgentModel.findOne(cond) : existingAgent
    } else {
      // else created
      const result = await AgentModel.create(agent)
      return result.toJSON()
    }

  }
  function findById(id) {
    return AgentModel.findById(id)
  }
  return {
    createOrUpdate,
    findById
  }
}