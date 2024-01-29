import Avatar from '@app/components/Avatar'
import Badge from '@app/components/Badge'
import Button from '@app/components/Button'
import Clickable from '@app/components/Clickable'
import Icon from '@app/components/Icon'
import type { SheetProps } from '@app/components/Sheet'
import Sheet from '@app/components/Sheet'
import TextField from '@app/components/TextField'
import Tips from '@app/components/Tips'
import useRoomMember from '@app/hooks/useRoomMember'
import useUser from '@app/hooks/useUser'
import genTmpId from '@app/util/genTmpId'
import { useState } from 'react'

interface Props extends SheetProps {
  roomId: string | null
}

export default function EditMember({ roomId, ...sheet }: Props) {
  const [members, { addMember, removeMember, getMemberName }] = useRoomMember(roomId)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [user] = useUser()

  const handleRemove = (member: { id: string | null; user: { id: string } | null }) => {
    if (member.id === null) {
      return
    }
    if (
      !confirm(
        user && member.user?.id === user.id
          ? 'メンバーから抜けます。よろしいですか？'
          : `"${getMemberName(member.id) ?? ''}" をメンバーから外します。よろしいですか？`,
      )
    ) {
      return
    }
    void removeMember(member.id)
  }

  // 一人目のメンバーを追加した時に部屋が作成されるので、部屋作成前はあたかも自分が入っているかのように見せる
  const displayableMembers = members ?? [{ id: null, name: null, tmpId: genTmpId(), user }]

  return (
    <Sheet {...sheet}>
      <div className="grid gap-4">
        <div className="font-bold">メンバー管理</div>
        <ul className="grid gap-4">
          {displayableMembers.map((v) => (
            <li key={v.id} className="grid grid-flow-col grid-cols-[auto_1fr_auto] items-center gap-4">
              <Avatar mini name={getMemberName(v)}></Avatar>
              <div className="grid grid-flow-col items-center justify-start gap-2">
                <div className="font-bold">{getMemberName(v)}</div>
                {v.user && <Badge>{v.user.id === user?.id ? '自分' : '参加済み'}</Badge>}
              </div>
              <Clickable
                disabled={v.id === null}
                onClick={() => handleRemove(v)}
                className="grid size-8 items-center justify-items-center transition active:scale-90 disabled:opacity-30"
              >
                <Icon name="person_remove"></Icon>
              </Clickable>
            </li>
          ))}
        </ul>
        <TextField label="ニックネーム" name="nickname" value={name} onChange={setName} disabled={busy} />
        <Button
          onClick={async () => {
            if (roomId) {
              void addMember(name)
            } else {
              // ルーム作成前の場合はoptimistic updateしない
              setBusy(true)
              try {
                await addMember(name)
              } finally {
                setBusy(false)
              }
            }
            setName('')
          }}
          disabled={name === ''}
          loading={busy}
          variant="primary"
        >
          追加
        </Button>
        {roomId ? (
          <Tips>このページのURLを共有することで、他のメンバーも旅の記録に参加することができます</Tips>
        ) : (
          <Tips>旅のタイトルを設定すると、旅の記録を共有することで他のメンバーが参加できるようになります</Tips>
        )}
      </div>
    </Sheet>
  )
}
