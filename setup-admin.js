
import { ensureDbReady } from './api/db/index.js'

async function createAdmin() {
  const db = await ensureDbReady()
  
  // 检查是否有用户
  const stats = await db.get(`SELECT COUNT(1) as count FROM users`)
  
  if (stats.count === 0) {
    console.log('🟢 数据库是空的，你注册第一个账号就会自动成为管理员！')
    console.log('📍 前往 http://localhost:5174/ 注册账号，第一个就是管理员！')
  } else {
    console.log(`🟡 数据库中已有 ${stats.count} 个用户`)
    
    // 列出所有用户
    const users = await db.all(`SELECT id, phone, role FROM users`)
    console.log('\n📋 现有用户:')
    users.forEach(u => {
      console.log(`   - ${u.phone} (${u.role})`)
    })
    
    // 询问是否要把第一个用户变成管理员
    console.log('\n🔧 把第一个用户设置为管理员...')
    const firstUser = users[0]
    
    if (firstUser.role !== 'admin') {
      await db.run(`UPDATE users SET role = 'admin' WHERE id = ?`, [firstUser.id])
      console.log(`✅ 已将 ${firstUser.phone} 设置为管理员!`)
      console.log('📍 你现在可以用这个账号登录了！')
    } else {
      console.log(`✅ ${firstUser.phone} 已经是管理员了!`)
    }
  }
  
  console.log('\n✅ 完成!')
  process.exit(0)
}

createAdmin().catch(console.error)

