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
      <div className="min-h-dvh bg-zinc-50 text-zinc-900">
        <TopBar />
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/post/new"
            element={
              <RequireAuth>
                <NewPost />
              </RequireAuth>
            }
          />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route
            path="/me"
            element={
              <RequireAuth>
                <Me />
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
      </div>
    </Router>
  )
}
