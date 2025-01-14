import useUser from './hooks/useUser'
import Main from './scene/Main'
import { RouterProvider, createBrowserRouter, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import useRoomMember from './hooks/useRoomMember'
import Landing from './scene/Landing'
import Spinner from './components/Spinner'
import Join from './scene/Landing/Join'
import * as Icon from 'lucide-react'
import { useEffect } from 'react'
import COMPRESSED_UUID_SCHEMA from '@util/COMPRESSED_UUID_SCHEMA'
import delay from './util/delay'
import usePresent from './hooks/usePresent'
import type { SheetProps } from './components/Sheet'
import Sheet from './components/Sheet'
import Button from './components/Button'
import Tips from './components/Tips'

const router = createBrowserRouter([
  {
    path: '/:roomId?',
    element: <Routing></Routing>,
  },
])

export default function App() {
  return (
    <div className="min-h-screen text-base text-zinc-700">
      <RouterProvider router={router} />
    </div>
  )
}

// const OLD_URL = 'http://localhost:8080'
const OLD_URL = 'https://saboten.pnly.xyz'
const NEW_URL = 'https://saboten.app'

function Routing() {
  const [user, { ready, refreshed, restoreUser }] = useUser()
  const { roomId = null } = useParams()
  const [members] = useRoomMember(roomId)

  const isOldApp = location.href.startsWith(OLD_URL)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const s = searchParams.get('s')
  // sパラメータがある & セッション更新試行済み & セッションなし
  const userMigrationProcedure = s !== null && refreshed && user === null

  // 旧URLからのリダイレクトによるセッション移行処理
  useEffect(() => {
    if (isOldApp) return
    if (!userMigrationProcedure) return
    const secret = COMPRESSED_UUID_SCHEMA.safeParse(s)
    const fail = () => {
      alert('ユーザー移行に失敗しました。旧URLで合言葉をコピーして手動で移行してください。')
      location.href = `${OLD_URL}/${roomId ?? ''}`
    }
    // sパラメータが不正
    if (!secret.success) {
      return fail()
    }
    void (async () => {
      // 移行処理中であることを伝える画面を見せるために少し遅延を入れる
      await delay(2000)
      const res = await restoreUser(secret.data)
      // シークレットが不正
      if ('error' in res) {
        return fail()
      }
      // 成功
      navigate(`/${roomId ?? ''}`, { replace: true })
    })()
  }, [isOldApp, navigate, restoreUser, roomId, s, userMigrationProcedure])

  const userMigrationPresent = usePresent()

  // 旧URLでのリダイレクト処理
  useEffect(() => {
    if (!isOldApp) return
    // セッション更新施行済み
    if (!refreshed) return
    // セッションなしの場合は無言でリダイレクト
    if (user === null) {
      location.href = `${NEW_URL}/${roomId ?? ''}`
      return
    }
    // セッションありの場合は移行するかのモーダルを出す
    userMigrationPresent.open()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOldApp, refreshed, user])

  if (userMigrationProcedure) {
    return (
      <div className="grid h-screen content-center justify-items-center gap-2">
        <Spinner></Spinner>
        <div className="grid grid-flow-col gap-4 text-zinc-400">
          <Icon.PartyPopper size={18} />
          <div className="font-bold">saboten.app</div>
          <Icon.Sparkles size={18} />
        </div>
        <div className="text-sm font-bold text-zinc-400">新しいURLにユーザーを移行しています...</div>
      </div>
    )
  }

  // セッション移行のケースだけランディングがちら見えしないようにする
  if (user === null && s !== null) {
    return null
  }

  if (!ready) {
    // ローカルストレージの読み込みが終わるまで待つ
    return null
  }

  if (user === null) {
    return <Landing roomId={roomId}></Landing>
  }

  if (roomId === null || members === null) {
    return (
      <>
        <UserMigrationSheet {...userMigrationPresent} secret={user.secret} />
        <Main roomId={null} />
      </>
    )
  }

  if (members === undefined) {
    return (
      <div className="grid h-screen content-center justify-items-center gap-2">
        <Spinner></Spinner>
        <div className="text-sm font-bold text-zinc-400">読込中...</div>
      </div>
    )
  }

  if (members.find((v) => v.user?.id === user.id) === undefined) {
    return <Join roomId={roomId}></Join>
  }

  return (
    <>
      <UserMigrationSheet {...userMigrationPresent} secret={user.secret} roomId={roomId} />
      <Main roomId={roomId} />
    </>
  )
}

function UserMigrationSheet({ secret, roomId, ...present }: SheetProps & { secret: string; roomId?: string }) {
  return (
    <Sheet {...present}>
      <div className="grid gap-4">
        <div className="grid grid-flow-col justify-center gap-4 py-2">
          <Icon.PartyPopper size={18} />
          <div className="font-bold">saboten.app</div>
          <Icon.Sparkles size={18} />
        </div>
        <Tips type={Icon.Backpack}>
          SABOTENのURLが新しくなりました！いままでの記録をそのまま移行することができます。
        </Tips>
        <Button
          onClick={() => {
            location.href = `${NEW_URL}/${roomId ?? ''}?s=${encodeURIComponent(secret)}`
          }}
        >
          新しいURLに移動
        </Button>
      </div>
    </Sheet>
  )
}
