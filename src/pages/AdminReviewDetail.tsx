import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { 
  Check, 
  ChevronLeft, 
  MapPin, 
  Shield, 
  Trash2, 
  X, 
  Clock, 
  Eye,
  AlertCircle,
  Tag,
  Calendar,
  User
} from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { apiRequest } from '@/lib/api'

type ReviewDetail = {
  id: string
  title: string
  content: string
  tags: string[]
  status: string
  rejectReason: string | null
  createdAt: string
  store: { id: string; name: string; addressText: string; lat: number; lng: number } | null
  media: Array<{ id: string; type: string; url: string }>
  authorUserId: string
}

export default function AdminReviewDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ReviewDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function refresh() {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const r = await apiRequest<ReviewDetail>(`/api/admin/reviews/${id}`)
      setData(r.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [id])

  async function approve() {
    if (!id) return
    setIsSubmitting(true)
    try {
      await apiRequest<unknown>(`/api/admin/reviews/${id}/approve`, { method: 'POST' })
      nav('/admin/review', { replace: true })
    } catch (e) {
      alert(e instanceof Error ? e.message : '操作失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function reject() {
    if (!id) return
    const reason = prompt('请输入驳回原因（将展示给用户）')
    if (!reason) return
    setIsSubmitting(true)
    try {
      await apiRequest<unknown>(`/api/admin/reviews/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : '操作失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function offShelf() {
    if (!id) return
    if (!confirm('确定要下架这条内容吗？')) return
    setIsSubmitting(true)
    try {
      await apiRequest<unknown>(`/api/admin/reviews/${id}/off-shelf`, { method: 'POST' })
      await refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : '操作失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function remove() {
    if (!id) return
    if (!confirm('确定删除？删除后不可恢复')) return
    setIsSubmitting(true)
    try {
      await apiRequest<unknown>(`/api/admin/posts/${id}`, { method: 'DELETE' })
      nav('/admin/review', { replace: true })
    } catch (e) {
      alert(e instanceof Error ? e.message : '删除失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: '待审核', 
          color: 'bg-amber-500', 
          text: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: Clock
        }
      case 'approved':
        return { 
          label: '已通过', 
          color: 'bg-emerald-500', 
          text: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          icon: Check
        }
      case 'rejected':
        return { 
          label: '已驳回', 
          color: 'bg-red-500', 
          text: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: X
        }
      case 'off_shelf':
        return { 
          label: '已下架', 
          color: 'bg-zinc-500', 
          text: 'text-zinc-700',
          bg: 'bg-zinc-50',
          border: 'border-zinc-200',
          icon: Eye
        }
      default:
        return { 
          label: status, 
          color: 'bg-zinc-500', 
          text: 'text-zinc-700',
          bg: 'bg-zinc-50',
          border: 'border-zinc-200',
          icon: Clock
        }
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-[600px] animate-pulse rounded-3xl gradient-border" />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl gradient-border p-8 text-center">
          <div className="text-5xl mb-4">😕</div>
          <div className="text-lg font-medium text-red-600">{error ?? '内容不存在'}</div>
        </div>
      </main>
    )
  }

  const statusInfo = getStatusInfo(data.status)
  const StatusIcon = statusInfo.icon

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* 返回和页面标题 */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          to="/admin/review"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm border border-zinc-200 transition-all hover:border-orange-300 hover:text-orange-600 hover:-translate-y-0.5"
        >
          <ChevronLeft className="h-4 w-4" />
          返回审核列表
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg text-white shadow-lg shadow-orange-500/30">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-semibold text-zinc-800">审核详情</span>
        </div>
      </div>

      {/* 主卡片 */}
      <div className="overflow-hidden rounded-3xl gradient-border bg-white card-hover">
        {/* 头部信息 */}
        <div className="border-b border-zinc-100 bg-gradient-to-br from-zinc-50 to-white px-8 py-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-zinc-900 mb-3">
                {data.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`flex items-center gap-2 rounded-full ${statusInfo.bg} ${statusInfo.border} border px-4 py-1.5`}>
                  <StatusIcon className={`h-4 w-4 ${statusInfo.text}`} />
                  <span className={`text-sm font-semibold ${statusInfo.text}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(data.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <User className="h-4 w-4" />
                  用户 ID: {data.authorUserId}
                </div>
              </div>
            </div>
          </div>
          
          {data.rejectReason && (
            <div className="mt-5 rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">驳回原因</p>
                  <p className="text-sm text-red-700">{data.rejectReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 门店信息 */}
        {data.store && (
          <div className="border-b border-zinc-100 px-8 py-7">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                <MapPin className="h-4 w-4 text-orange-600" />
              </div>
              门店信息
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-1">门店名称</p>
                <p className="text-base font-semibold text-zinc-800">{data.store.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-1">详细地址</p>
                <p className="text-base text-zinc-800">{data.store.addressText}</p>
              </div>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border-2 border-zinc-200">
              <div className="h-[280px]">
                <MapContainer
                  center={[data.store.lat, data.store.lng]}
                  zoom={16}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                  />
                  <CircleMarker
                    center={[data.store.lat, data.store.lng]}
                    radius={12}
                    pathOptions={{ 
                      color: '#ea580c', 
                      fillColor: '#f97316',
                      fillOpacity: 0.3,
                      weight: 3
                    }}
                  />
                </MapContainer>
              </div>
              <div className="flex items-center justify-between bg-zinc-50 px-4 py-3 border-t border-zinc-100">
                <span className="text-xs text-zinc-600">
                  地理坐标：{data.store.lat.toFixed(6)}, {data.store.lng.toFixed(6)}
                </span>
                <div className="flex h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* 媒体内容 */}
        {data.media.length > 0 && (
          <div className="border-b border-zinc-100 px-8 py-7">
            <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <div className="h-4 w-4 rounded bg-amber-500" />
              </div>
              媒体内容 ({data.media.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.media.map((m) => (
                <div key={m.id} className="group relative overflow-hidden rounded-xl">
                  {m.type === 'video' ? (
                    <video
                      src={m.url}
                      className="h-48 w-full object-cover"
                      controls
                      playsInline
                    />
                  ) : (
                    <img
                      src={m.url}
                      alt=""
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 正文内容 */}
        <div className="px-8 py-7">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <div className="h-4 w-4 rounded bg-emerald-500" />
            </div>
            推荐内容
          </h2>
          
          {/* 标签 */}
          {data.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {data.tags.map((t) => (
                <span 
                  key={t} 
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-3 py-1.5 text-sm font-medium text-orange-700 border border-orange-200"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* 正文 */}
          <div className="rounded-2xl bg-zinc-50 p-6">
            <div className="whitespace-pre-wrap text-base leading-8 text-zinc-800">
              {data.content}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              {data.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => approve()}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    {isSubmitting ? '处理中...' : '通过上架'}
                  </button>
                  <button
                    type="button"
                    onClick={() => reject()}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                    {isSubmitting ? '处理中...' : '驳回'}
                  </button>
                </>
              )}
              {data.status === 'approved' && (
                <button
                  type="button"
                  onClick={() => offShelf()}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-zinc-700 to-zinc-800 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                  {isSubmitting ? '处理中...' : '下架'}
                </button>
              )}
              {data.status === 'rejected' && (
                <button
                  type="button"
                  onClick={() => approve()}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? '处理中...' : '重新通过'}
                </button>
              )}
              {data.status === 'off_shelf' && (
                <button
                  type="button"
                  onClick={() => approve()}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? '处理中...' : '重新上架'}
                </button>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => remove()}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full border-2 border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              {isSubmitting ? '删除中...' : '删除'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
