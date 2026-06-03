import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import RequireAuth from '@/components/RequireAuth'
import Discover from '@/pages/Discover'
import Login from '@/pages/Login'
import NewPost from '@/pages/NewPost'
import PostDetail from '@/pages/PostDetail'
import Me from '@/pages/Me'
import AdminReviewList from '@/pages/AdminReviewList'
import AdminReviewDetail from '@/pages/AdminReviewDetail'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 登录页 - 应用入口 */}
        <Route path="/login" element={<Login />} />
        
        {/* 已登录后的页面 */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <div className="min-h-dvh bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <TopBar />
                <Discover />
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <div className="min-h-dvh bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <TopBar />
                <Discover />
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/post/new"
          element={
            <RequireAuth>
              <div className="min-h-dvh bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <TopBar />
                <NewPost />
              </div>
            </RequireAuth>
          }
        />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route
          path="/me"
          element={
            <RequireAuth>
              <div className="min-h-dvh bg-gradient-to-br from-orange-50 via-white to-amber-50">
                <TopBar />
                <Me />
              </div>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/review"
          element={
            <RequireAuth roles={['admin']}>
              <AdminReviewList />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/review/:id"
          element={
            <RequireAuth roles={['admin']}>
              <AdminReviewDetail />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  )
}
