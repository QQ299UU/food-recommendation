import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Share2 } from 'lucide-react'
import { apiRequest } from '@/lib/api'

type PostDetailResp = {
  id: string
  title: string
  content: string
  tags: string[]
  status: string
  rejectReason: string | null
  createdAt: string
  store: { id: string; name: string; addressText: string; lat: number; lng: number } | null
  media: Array<{ id: string; type: string; url: string }>
}

export default function PostDetail() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PostDetailResp | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)

    apiRequest<PostDetailResp>(`/api/posts/${id}`)
      .then((r) => {
        if (cancelled) return
        setData(r.data)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : '加载失败')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-[500px] animate-pulse rounded-3xl gradient-border" />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl gradient-border p-8 text-center">
          <div className="mb-4 text-5xl">😕</div>
          <div className="text-lg font-medium text-zinc-700">{error ?? '内容不存在'}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-md transition-all hover:-translate-x-1 hover:shadow-lg gradient-border"
        >
          <ArrowLeft className="h-4 w-4" />
          返回发现
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl gradient-border card-hover">
        <div className="gradient-bg px-8 py-6">
          <div className="mb-2 text-2xl font-bold text-white">
            {data.title}
          </div>
          {data.store ? (
            <div className="flex items-center gap-2 text-sm text-white/90">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{data.store.name}</span>
              <span className="opacity-60">·</span>
              <span className="opacity-80">{data.store.addressText}</span>
            </div>
          ) : null}

          {data.status !== 'approved' ? (
            <div className="mt-4 rounded-2xl border-2 border-white/30 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
              ⚠️ 当前状态：{data.status}
              {data.rejectReason ? `（原因：${data.rejectReason}）` : null}
            </div>
          ) : null}
        </div>

        {data.media.length > 0 ? (
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {data.media.map((m) =>
              m.type === 'video' ? (
                <video
                  key={m.id}
                  src={m.url}
                  className="h-64 w-full rounded-2xl bg-zinc-100 object-cover shadow-lg"
                  controls
                  playsInline
                />
              ) : (
                <img
                  key={m.id}
                  src={m.url}
                  alt=""
                  className="h-64 w-full rounded-2xl bg-zinc-100 object-cover shadow-lg transition-transform hover:scale-105"
                  loading="lazy"
                />
              ),
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 p-12">
            <span className="text-8xl">🍽️</span>
          </div>
        )}

        <div className="bg-white px-8 pb-8 pt-6">
          {data.tags.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {data.tags.map((t) => (
                <span key={t} className="rounded-full tag-gradient px-3 py-1.5 text-sm font-medium">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="whitespace-pre-wrap text-base leading-8 text-zinc-800">
            {data.content}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span>发布时间：{new Date(data.createdAt).toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: data.title,
                    text: data.content.substring(0, 100),
                    url: window.location.href,
                  })
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Share2 className="h-4 w-4" />
              分享
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

