import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Plus, Trash2, User, Shield, ArrowRight } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

type PostMineItem = {
  id: string
  title: string
  content: string
  tags: string[]
  status: string
  rejectReason: string | null
  createdAt: string
  store: { id: string; name: string; addressText: string; lat: number; lng: number }
  cover: { url: string; type: string } | null
}

export default function Me() {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PostMineItem[]>([])
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const r = await apiRequest<PostMineItem[]>('/api/posts?mine=1')
      setItems(r.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function remove(id: string) {
    if (!confirm('确定删除？删除后不可恢复')) return
    try {
      await apiRequest<unknown>(`/api/posts/${id}`, { method: 'DELETE' })
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* 用户信息区域 */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 hero-badge w-fit">
            <User className="h-4 w-4" />
            个人中心
          </div>
          <div className="section-title text-3xl">
            我的发布
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm text-zinc-600 flex-wrap">
            <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-orange-700">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.phone}</span>
            </div>
            <div className={`rounded-full px-4 py-2 font-medium ${user?.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md' : 'bg-blue-100 text-blue-700'}`}>
              {user?.role === 'admin' ? '👑 管理员' : '🍽️ 用户'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {user?.role === 'admin' && (
            <Link
              to="/admin/review"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-5 py-3 font-medium text-white shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:-translate-y-1"
            >
              <Shield className="h-5 w-5" />
              <span>进入商家后台</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          <Link
            to="/post/new"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 font-medium shadow-xl"
          >
            <Plus className="h-5 w-5" />
            新建发布
          </Link>
        </div>
      </div>

      {/* 管理员快捷卡片 */}
      {user?.role === 'admin' && (
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-purple-500 to-violet-500 p-6 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                <Shield className="h-6 w-6" />
                商家管理后台
              </div>
              <p className="text-sm opacity-90">
                快速审核美食推荐内容，管理平台内容质量
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/review?status=pending"
                className="rounded-full bg-white/20 px-5 py-2.5 text-sm font-medium backdrop-blur hover:bg-white/30 transition-all hover:-translate-y-0.5"
              >
                查看待审核
              </Link>
              <Link
                to="/admin/review?status=approved"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                查看已上架
              </Link>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[280px] animate-pulse rounded-3xl gradient-border"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl gradient-border p-8 text-center">
          <div className="mb-4 text-5xl">😕</div>
          <div className="text-lg font-medium text-red-600">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl gradient-border p-10 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-7xl">🍳</div>
            <div className="section-title mb-3 text-2xl">
              还没有发布过
            </div>
            <div className="mb-6 text-sm text-zinc-600">
              发布真实到店体验后，等待审核即可上架
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="overflow-hidden rounded-3xl gradient-border card-hover"
            >
              <Link to={`/post/${it.id}`} className="block">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                  {it.cover ? (
                    it.cover.type === 'video' ? (
                      <video
                        src={it.cover.url}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={it.cover.url}
                        alt={it.title}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                </div>
                <div className="bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 truncate text-xl font-semibold leading-tight">
                        {it.title}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <span className="truncate font-medium">{it.store.name}</span>
                      </div>
                    </div>
                    <div
                      className={[
                        'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium',
                        it.status === 'approved'
                          ? 'status-approved'
                          : it.status === 'pending'
                            ? 'status-pending'
                            : it.status === 'rejected'
                              ? 'status-rejected'
                              : 'bg-zinc-100 text-zinc-700',
                      ].join(' ')}
                    >
                      {it.status === 'approved' ? '✅ 已上架' : 
                       it.status === 'pending' ? '⏳ 审核中' : 
                       it.status === 'rejected' ? '❌ 已驳回' : it.status}
                    </div>
                  </div>
                  {it.rejectReason ? (
                    <div className="mt-3 rounded-2xl border-2 border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      驳回原因：{it.rejectReason}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(it.createdAt).toLocaleString()}
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3">
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-red-600 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
                <Link
                  to={`/post/${it.id}`}
                  className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium"
                >
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
