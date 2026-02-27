// 内存数据库实现（无需编译依赖）
class MemoryDatabase {
  constructor() {
    this.agents = new Map();
    this.bookings = new Map();
    this.init();
  }

  init() {
    // 预置一些示例数据
    console.log('Memory database initialized');
  }

  // Agent 注册
  registerAgent(agent) {
    this.agents.set(agent.id, {
      ...agent,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    return { changes: 1 };
  }

  // 搜索 Agent
  searchAgents(filters = {}) {
    let agents = Array.from(this.agents.values()).filter(a => a.status === 'active');

    if (filters.type) {
      agents = agents.filter(a => a.type === filters.type);
    }

    if (filters.location) {
      agents = agents.filter(a => a.location.includes(filters.location));
    }

    if (filters.name) {
      agents = agents.filter(a => a.name.includes(filters.name));
    }

    return agents.sort((a, b) => b.created_at - a.created_at);
  }

  // 获取单个 Agent
  getAgent(id) {
    return this.agents.get(id) || null;
  }

  // 更新 Agent
  updateAgent(id, updates) {
    const agent = this.agents.get(id);
    if (!agent) return { changes: 0 };

    const allowedFields = ['name', 'location', 'endpoint', 'description', 'status', 'capabilities', 'metadata'];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        agent[key] = updates[key];
      }
    }
    agent.updated_at = Date.now();
    
    return { changes: 1 };
  }

  // 删除 Agent
  deleteAgent(id) {
    const existed = this.agents.has(id);
    this.agents.delete(id);
    return { changes: existed ? 1 : 0 };
  }

  // 创建预订
  createBooking(booking) {
    this.bookings.set(booking.id, {
      ...booking,
      created_at: Date.now(),
      updated_at: Date.now()
    });
    return { changes: 1 };
  }

  // 获取预订
  getBooking(id) {
    return this.bookings.get(id) || null;
  }

  // 更新预订状态
  updateBookingStatus(id, status) {
    const booking = this.bookings.get(id);
    if (!booking) return { changes: 0 };
    
    booking.status = status;
    booking.updated_at = Date.now();
    return { changes: 1 };
  }
}

module.exports = MemoryDatabase;
