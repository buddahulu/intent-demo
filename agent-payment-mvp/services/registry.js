const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const RegistryDatabase = require('../shared/database');

const app = express();
const PORT = process.env.REGISTRY_PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const db = new RegistryDatabase();

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'agent-registry', timestamp: new Date().toISOString() });
});

// ========== Agent 注册接口 ==========

// 注册新 Agent
app.post('/api/agents/register', (req, res) => {
  try {
    const { name, type, location, endpoint, description, capabilities, metadata } = req.body;

    // 验证必填字段
    if (!name || !type || !location || !endpoint) {
      return res.status(400).json({
        error: 'Missing required fields: name, type, location, endpoint'
      });
    }

    const agent = {
      id: uuidv4(),
      name,
      type,
      location,
      endpoint,
      description: description || '',
      capabilities: capabilities || [],
      metadata: metadata || {},
      status: 'active'
    };

    db.registerAgent(agent);

    res.status(201).json({
      success: true,
      message: 'Agent registered successfully',
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        location: agent.location,
        endpoint: agent.endpoint,
        description: agent.description,
        capabilities: agent.capabilities,
        created_at: agent.created_at
      }
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    res.status(500).json({ error: 'Failed to register agent', details: error.message });
  }
});

// 搜索 Agent
app.get('/api/agents/search', (req, res) => {
  try {
    const { type, location, name } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (location) filters.location = location;
    if (name) filters.name = name;

    const agents = db.searchAgents(filters);

    res.json({
      success: true,
      count: agents.length,
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        location: a.location,
        endpoint: a.endpoint,
        description: a.description,
        capabilities: a.capabilities,
        metadata: a.metadata
      }))
    });
  } catch (error) {
    console.error('Error searching agents:', error);
    res.status(500).json({ error: 'Failed to search agents', details: error.message });
  }
});

// 获取单个 Agent
app.get('/api/agents/:id', (req, res) => {
  try {
    const agent = db.getAgent(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        location: agent.location,
        endpoint: agent.endpoint,
        description: agent.description,
        capabilities: agent.capabilities,
        metadata: agent.metadata,
        status: agent.status,
        created_at: agent.created_at
      }
    });
  } catch (error) {
    console.error('Error getting agent:', error);
    res.status(500).json({ error: 'Failed to get agent', details: error.message });
  }
});

// 更新 Agent
app.put('/api/agents/:id', (req, res) => {
  try {
    const updates = req.body;
    const result = db.updateAgent(req.params.id, updates);
    
    if (!result || result.changes === 0) {
      return res.status(404).json({ error: 'Agent not found or no changes made' });
    }

    res.json({
      success: true,
      message: 'Agent updated successfully'
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent', details: error.message });
  }
});

// 删除 Agent
app.delete('/api/agents/:id', (req, res) => {
  try {
    const result = db.deleteAgent(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent', details: error.message });
  }
});

// ========== 预订管理接口 ==========

// 创建预订记录
app.post('/api/bookings', (req, res) => {
  try {
    const { agentId, userId, data, status } = req.body;

    if (!agentId || !userId || !data) {
      return res.status(400).json({
        error: 'Missing required fields: agentId, userId, data'
      });
    }

    const booking = {
      id: uuidv4(),
      agentId,
      userId,
      data,
      status: status || 'pending'
    };

    db.createBooking(booking);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        agent_id: booking.agentId,
        user_id: booking.userId,
        status: booking.status,
        data: booking.data
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

// 获取预订
app.get('/api/bookings/:id', (req, res) => {
  try {
    const booking = db.getBooking(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      booking: {
        id: booking.id,
        agent_id: booking.agent_id,
        user_id: booking.user_id,
        status: booking.status,
        data: booking.data,
        created_at: booking.created_at
      }
    });
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ error: 'Failed to get booking', details: error.message });
  }
});

// 更新预订状态
app.patch('/api/bookings/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const result = db.updateBookingStatus(req.params.id, status);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      status
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status', details: error.message });
  }
});

// 启动服务
app.listen(PORT, () => {
  console.log(`📝 Agent Registry Service running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
