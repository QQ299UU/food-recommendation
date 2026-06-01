import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, TrendingUp } from 'lucide-react'
import { apiRequest } from '@/lib/api'

type PostListItem = {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  store: { id: string; name: string; addressText: string; lat: number; lng: number }
  cover: { url: string; type: string } | null
}

export default function Discover() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<PostListItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    apiRequest<PostListItem[]>('/api/posts')
      .then((r) => {
        if (cancelled) return
        setItems(r.data)
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
  }, [])

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[320px] animate-pulse rounded-3xl gradient-border card-hover"
            />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-3xl gradient-border p-6 text-center">
          <div className="text-lg font-medium text-red-600">⚠️ {error}</div>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="rounded-3xl gradient-border p-10 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-6xl">🍜</div>
            <div className="section-title mb-3 text-2xl">
              暂无已上架推荐
            </div>
            <div className="mb-6 text-sm leading-relaxed text-zinc-600">
              先发布一条真实到店体验，提交后等待后台审核通过即可展示在这里。
            </div>
            <Link
              to="/post/new"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium shadow-xl"
            >
              <Star className="h-5 w-5" />
              去发布
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.id}
            to={`/post/${it.id}`}
            className="group overflow-hidden rounded-3xl gradient-border card-hover"
          >
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
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-zinc-900/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="hero-badge absolute right-3 top-3">
                <TrendingUp className="h-3.5 w-3.5" />
                上架
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 truncate text-xl font-semibold leading-tight">
                    {it.title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span className="truncate font-medium">{it.store.name}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 max-h-[4.5rem] overflow-hidden text-sm leading-relaxed text-zinc-700">
                {it.content}
              </div>
              {it.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {it.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full tag-gradient px-3 py-1 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    )
  }, [error, items, loading])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 hero-badge">
            <TrendingUp className="h-4 w-4" />
            美食精选
          </div>
          <div className="section-title text-3xl">
            今日不踩雷
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
            只有审核通过的真实到店体验才会出现在这里
          </div>
        </div>
        <div className="hidden items-center gap-2 text-sm text-zinc-500 lg:flex">
          <Star className="h-4 w-4 text-amber-500" />
          已展示 {items.length} 条精选推荐
        </div>
      </div>
      {content}
    </main>
  )
}
