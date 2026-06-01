import { Link, NavLink } from 'react-router-dom'
import { LogOut, MapPinned, Plus, Shield, Sparkles, User, Crown } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import type { ReactNode } from 'react'

function NavItem(props: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300',
          isActive
            ? 'gradient-bg text-white shadow-lg shadow-orange-500/30 -translate-y-0.5'
            : 'text-zinc-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-500/10',
        ].join(' ')
      }
    >
      <span className="h-4 w-4">{props.icon}</span>
      <span className="hidden sm:inline">{props.label}</span>
    </NavLink>
  )
}

export default function TopBar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="sticky top-0 z-20 border-b border-orange-200/50 bg-white/80 backdrop-blur-xl shadow-sm shadow-orange-500/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="group inline-flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl gradient-bg text-white shadow-lg shadow-orange-500/40 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/50 group-hover:-translate-y-1">
            <Sparkles className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <div className="section-title text-xl tracking-wide">
              食探地图
            </div>
            <div className="hero-badge mt-1 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
              真实到店 · 审核上架
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <NavItem to="/" icon={<MapPinned className="h-4 w-4" />} label="发现" />
          <NavItem to="/post/new" icon={<Plus className="h-4 w-4" />} label="发布" />
          <NavItem to="/me" icon={<User className="h-4 w-4" />} label="我的" />
          
          {user?.role === 'admin' ? (
            <Link
              to="/admin/review"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/50 hover:-translate-y-1"
            >
              <Shield className="h-4 w-4" />
              <Crown className="h-3.5 w-3.5 absolute -top-1 -right-1 text-yellow-300" />
              <span className="hidden sm:inline">商家后台</span>
            </Link>
          ) : null}

          {user ? (
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">登录</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
