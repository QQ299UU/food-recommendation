import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Eye, 
  Filter,
  ArrowLeft,
  Crown
} from 'lucide-react'
import { apiRequest } from '@/lib/api'

type ReviewItem = {
  id: string
  title: string
  content: string
  status: string
  createdAt: string
  store: { id: string; name: string; addressText: string; lat: number; lng: number }
  cover: { url: string; type: string } | null
  tags: string[]
}

type Stats = {
  pending: number
  approved: number
  rejected: number
  offShelf: number
}

export default function AdminReviewList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentStatus = searchParams.get('status') || 'pending'
  
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (status: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // 同时获取列表和统计
      const [itemsRes, pendingRes, approvedRes, rejectedRes, offShelfRes] = await Promise.all([
        apiRequest<ReviewItem[]>(`/api/admin/reviews?status=${status}`),
        apiRequest<ReviewItem[]>('/api/admin/reviews?status=pending'),
        apiRequest<ReviewItem[]>('/api/admin/reviews?status=approved'),
        apiRequest<ReviewItem[]>('/api/admin/reviews?status=rejected'),
        apiRequest<ReviewItem[]>('/api/admin/reviews?status=off_shelf'),
      ])
      
      setItems(itemsRes.data)
      setStats({
        pending: pendingRes.data.length,
        approved: approvedRes.data.length,
        rejected: rejectedRes.data.length,
        offShelf: offShelfRes.data.length,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(currentStatus)
  }, [currentStatus, fetchData])

  const handleStatusChange = (status: string) => {
    setSearchParams({ status })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' }
      case 'approved':
        return { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' }
      case 'rejected':
        return { icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
      case 'off_shelf':
        return { icon: Clock, bg: 'bg-zinc-50', text: 'text-zinc-600', border: 'border-zinc-200' }
      default:
        return { icon: Clock, bg: 'bg-zinc-50', text: 'text-zinc-600', border: 'border-zinc-200' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待审核'
      case 'approved': return '已通过'
      case 'rejected': return '已驳回'
      case 'off_shelf': return '已下架'
      default: return status
    }
  }

  const statsConfig = [
    { key: 'pending', label: '待审核', icon: Clock, color: 'text-amber-500', bg: 'from-amber-500 to-orange-500' },
    { key: 'approved', label: '已通过', icon: CheckCircle2, color: 'text-emerald-500', bg: 'from-emerald-500 to-green-500' },
    { key: 'rejected', label: '已驳回', icon: XCircle, color: 'text-red-500', bg: 'from-red-500 to-rose-500' },
    { key: 'offShelf', label: '已下架', icon: Clock, color: 'text-zinc-500', bg: 'from-zinc-500 to-gray-500' },
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* 页面标题与快捷操作 */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/me"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-md border border-zinc-200 transition-all hover:border-orange-300 hover:text-orange-600 hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            返回用户页面
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/40">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                商家审核后台
              </h1>
              <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-500" />
                管理和审核美食推荐内容
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Eye className="h-4 w-4" />
            查看首页
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((config) => {
          const Icon = config.icon
          return (
            <div 
              key={config.key}
              onClick={() => handleStatusChange(config.key === 'offShelf' ? 'off_shelf' : config.key)}
              className={`relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer ${
                (config.key === 'offShelf' ? 'off_shelf' : config.key) === currentStatus ? 'ring-2 ring-purple-500/30' : ''
              }`}
            >
              <div className={`absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br ${config.bg} opacity-10`} />
              <div className="relative z-10">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.bg} text-white shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-3xl font-bold text-zinc-800">
                  {loading ? '-' : stats?.[config.key as keyof Stats] ?? 0}
                </p>
                <p className="text-sm font-medium text-zinc-500 mt-1">{config.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 状态筛选 */}
      <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Filter className="h-4 w-4" />
          <span>筛选：</span>
        </div>
        {['pending', 'approved', 'rejected', 'off_shelf'].map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              status === currentStatus
                ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            {status === 'pending' && <Clock className="h-4 w-4" />}
            {status === 'approved' && <CheckCircle2 className="h-4 w-4" />}
            {status === 'rejected' && <XCircle className="h-4 w-4" />}
            {status === 'off_shelf' && <Clock className="h-4 w-4" />}
            {getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[320px] animate-pulse rounded-3xl gradient-border"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl gradient-border p-8 text-center">
          <div className="text-5xl mb-4">😕</div>
          <div className="text-lg font-medium text-red-600">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl gradient-border p-10 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-7xl">✨</div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-3">
              暂无{getStatusLabel(currentStatus)}内容
            </h3>
            <p className="text-zinc-600">
              {currentStatus === 'pending' ? '有新提交后会出现在这里' : '切换其他状态标签查看更多内容'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const statusStyle = getStatusBadge(it.status)
            const StatusIcon = statusStyle.icon
            
            return (
              <Link
                key={it.id}
                to={`/admin/review/${it.id}`}
                className="group overflow-hidden rounded-3xl gradient-border card-hover bg-white"
              >
                {/* 封面图 */}
                <div className="relative h-44 overflow-hidden">
                  {it.cover ? (
                    it.cover.type === 'video' ? (
                      <video
                        src={it.cover.url}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={it.cover.url}
                        alt={it.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                  
                  {/* 状态标签 */}
                  <div className={`absolute top-3 right-3 flex items-center gap-1 rounded-full ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {getStatusLabel(it.status)}
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-5">
                  <h3 className="truncate text-xl font-semibold text-zinc-800 mb-2">
                    {it.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-sm text-zinc-600 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span className="truncate font-medium">{it.store.name}</span>
                  </div>

                  <p className="line-clamp-3 text-sm text-zinc-600 leading-relaxed mb-4">
                    {it.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">
                      {new Date(it.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-purple-500 text-sm font-medium">
                      <Eye className="h-4 w-4" />
                      <span>审核</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
