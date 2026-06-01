import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Phone, Shield, Sparkles } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

type LoginResp = { token: string; user: { id: string; phone: string; role: string } }

function normalizePhone(input: string) {
  return input.trim()
}

export default function Login() {
  const nav = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(() => (mode === 'login' ? '欢迎回来' : '加入食探'), [mode])

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const p = normalizePhone(phone)
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const r = await apiRequest<LoginResp>(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p, password }),
      })
      setAuth(r.data.token, r.data.user)
      nav('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl"
               style={{ background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)', boxShadow: '0 20px 40px -12px rgba(249, 115, 22, 0.4)' }}>
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-3 text-4xl font-bold"
              style={{ 
                background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
            {title}
          </h1>
          <p className="text-sm text-zinc-600">
            探索真实美食体验，发现城市美味
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl"
             style={{ 
               border: '1px solid transparent',
               backgroundClip: 'padding-box',
               position: 'relative'
             }}>
          <div className="absolute inset-0 rounded-3xl" 
               style={{ 
                 padding: '1px',
                 background: 'linear-gradient(135deg, #ea580c, #f59e0b, #dc2626)',
                 WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                 WebkitMaskComposite: 'xor',
                 maskComposite: 'exclude',
                 pointerEvents: 'none'
               }}></div>
          <div className="relative">
            <div className="px-8 py-6 text-center"
                 style={{ background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)' }}>
              <div className="mb-1 text-xl font-semibold text-white">
                {mode === 'login' ? '登录食探地图' : '注册新账号'}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-white/90">
                <Shield className="h-4 w-4" />
                <span>内容需审核，信息安全保障</span>
              </div>
            </div>

            <div className="bg-white px-8 py-8">
              <div className="mb-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all"
                  style={mode === 'login' ? {
                    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                    color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.3)'
                  } : {
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all"
                  style={mode === 'register' ? {
                    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                    color: 'white',
                    boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.3)'
                  } : {
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                  注册
                </button>
              </div>

              <div className="space-y-5">
                <label className="block">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Phone className="h-4 w-4" style={{ color: '#f97316' }} />
                    手机号
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="numeric"
                    placeholder="请输入手机号"
                    className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <Lock className="h-4 w-4" style={{ color: '#f97316' }} />
                    密码
                  </div>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="至少6位"
                    className="w-full rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    ⚠️ {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => submit()}
                  disabled={loading}
                  className="w-full rounded-2xl px-4 py-4 text-base font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                    boxShadow: '0 20px 40px -12px rgba(249, 115, 22, 0.4)'
                  }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      处理中…
                    </span>
                  ) : mode === 'login' ? '立即登录' : '立即注册'}
                </button>

                <div className="rounded-2xl border-2 border-orange-100 px-4 py-3 text-xs leading-relaxed text-zinc-700"
                     style={{ background: 'linear-gradient(90deg, #fff7ed, #fffbeb)' }}>
                  💡 <strong>温馨提示：</strong>提交即表示你承诺：发布内容为本人真实到店消费体验，平台可对不实内容下架/删除。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
