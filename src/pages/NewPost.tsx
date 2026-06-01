import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, CheckCircle, ImagePlus, Lightbulb, MapPin, Send, Star } from 'lucide-react'
import MapPicker from '@/components/MapPicker'
import { apiRequest } from '@/lib/api'

type StoreResp = {
  id: string
  name: string
  addressText: string
  lat: number
  lng: number
}

type PostResp = {
  id: string
  storeId: string
  status: string
}

export default function NewPost() {
  const nav = useNavigate()
  const [storeName, setStoreName] = useState('')
  const [addressText, setAddressText] = useState('')
  const [lat, setLat] = useState(31.2304)
  const [lng, setLng] = useState(121.4737)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tags = useMemo(() => {
    return tagsText
      .split(/[,，\s]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10)
  }, [tagsText])

  async function submit() {
    setError(null)
    if (!agree) {
      setError('请先勾选"真实到店体验"声明')
      return
    }
    setLoading(true)
    try {
      const store = await apiRequest<StoreResp>('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: storeName, addressText, lat, lng }),
      })

      const post = await apiRequest<PostResp>('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.data.id,
          title,
          content,
          tags,
        }),
      })

      if (files.length > 0) {
        const fd = new FormData()
        for (const f of files) fd.append('files', f)
        await apiRequest<Array<{ id: string; url: string; type: string }>>(
          `/api/posts/${post.data.id}/media`,
          { method: 'POST', body: fd },
        )
      }

      nav('/me', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : '提交失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 hero-badge w-fit">
          <Camera className="h-4 w-4" />
          分享美食
        </div>
        <div className="section-title text-3xl">
          发布真实到店体验
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          内容会进入后台审核，通过后上架
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl gradient-border card-hover p-6">
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Star className="h-4 w-4 text-orange-500" />
                  门店名称
                </div>
                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="例如：XX面馆"
                  className="input-field"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  门店地址
                </div>
                <input
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="例如：某某路123号"
                  className="input-field"
                />
              </label>
            </div>

            <div className="rounded-3xl border-2 border-orange-200/50 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>门店位置（地图选点）</span>
              </div>
              <div>
                <MapPicker lat={lat} lng={lng} onChange={(a, b) => (setLat(a), setLng(b))} />
              </div>
            </div>

            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Star className="h-4 w-4 text-orange-500" />
                推荐标题
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="一句话说清楚为什么好吃"
                className="input-field"
              />
            </label>

            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Camera className="h-4 w-4 text-orange-500" />
                推荐内容
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的真实体验：点了什么、口味、价格、环境、排队、避坑建议…"
                rows={6}
                className="input-field resize-none"
              />
            </label>

            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Lightbulb className="h-4 w-4 text-orange-500" />
                标签（可选，逗号分隔）
              </div>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="例如：性价比, 爆汁, 夜宵"
                className="input-field"
              />
              {tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="rounded-full tag-gradient px-3 py-1.5 text-sm font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </label>

            <label className="block">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
                <ImagePlus className="h-4 w-4 text-orange-500" />
                <span>图片/视频（可选）</span>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="block w-full cursor-pointer text-sm text-zinc-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-gradient-to-r file:from-orange-500 file:to-amber-500 file:px-5 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:shadow-lg hover:file:shadow-orange-500/30"
              />
              {files.length > 0 ? (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  已选择 {files.length} 个文件
                </div>
              ) : null}
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 transition-all hover:border-orange-300">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-5 w-5 cursor-pointer accent-orange-500"
              />
              <span className="text-sm leading-relaxed text-zinc-700">
                我确认：内容为本人真实到店消费体验，若发现不实/盗图/虚假地址，平台可下架或删除。
              </span>
            </label>

            {error ? (
              <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                ⚠️ {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => submit()}
              disabled={loading}
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-medium shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
              {loading ? '提交中…' : '提交审核'}
            </button>
          </div>
        </section>

        <aside className="rounded-3xl gradient-border card-hover p-6">
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <Lightbulb className="h-5 w-5 text-orange-500" />
              审核建议
            </div>
            <div className="h-1 w-16 rounded-full gradient-bg"></div>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <span>门店地址尽量详细，位置要准确</span>
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <span>图片/视频尽量为你实拍（可含环境/菜品/价格）</span>
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <span>避免夸大与虚构；写清楚"点了什么、为什么好吃"</span>
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-zinc-700">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              <span>如被驳回，可在"我的"里修改后重新提交</span>
            </li>
          </ul>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 p-5 text-center">
            <div className="mb-3 text-5xl">🍜</div>
            <div className="text-sm font-medium text-orange-800">
              分享美食，收获快乐
            </div>
            <div className="mt-1 text-xs text-orange-600">
              让更多人发现真实美味
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
