import Button from '@app/components/Button'
import Clickable from '@app/components/Clickable'
import Sheet from '@app/components/Sheet'
import Tab from '@app/components/Tab'
import TextField from '@app/components/TextField'
import Tips from '@app/components/Tips'
import usePresent from '@app/hooks/usePresent'
import useRoomMember, { validMemberName } from '@app/hooks/useRoomMember'
import unreachable from '@app/util/unreachable'
import clsx from 'clsx'
import * as Icon from 'lucide-react'
import { useState } from 'react'

type Props = React.PropsWithChildren<{ roomId: string | null; memberId: string | null; className?: string }>

export default function RenameButton({ memberId, roomId, ...rest }: Props & ContainerProps) {
  if (roomId === null || memberId === null) {
    return <RenameIconContainer {...rest} disabled></RenameIconContainer>
  }

  return <RenameButtonInternal roomId={roomId} memberId={memberId} {...rest}></RenameButtonInternal>
}

interface ContainerProps {
  children: React.ReactNode
  disabled?: boolean
}

function RenameIconContainer({ children, disabled }: ContainerProps) {
  return (
    <div className="grid grid-flow-col items-center justify-start gap-2">
      {children}
      <Icon.PencilLine size={16} className={clsx(disabled && 'opacity-30', 'text-zinc-400')}></Icon.PencilLine>
    </div>
  )
}

function RenameButtonInternal({ roomId, memberId, ...rest }: { roomId: string; memberId: string } & ContainerProps) {
  const [, { renameMember, getMemberName, getMember }] = useRoomMember(roomId)
  const member = getMember(memberId)
  const notJoined = !member?.user
  const present = usePresent()
  const [name, setName] = useState(() => getMemberName(memberId) ?? '')
  const [mode, setMode] = useState<'rename' | 'reset'>(
    notJoined ? 'rename' : member && validMemberName(member) ? 'rename' : 'reset',
  )

  return (
    <>
      <Clickable onClick={present.open} className="transition active:scale-95 disabled:opacity-30">
        <RenameIconContainer {...rest}></RenameIconContainer>
      </Clickable>
      <Sheet {...present}>
        <div className="grid gap-4">
          {notJoined ? (
            <div className="text-xs font-bold text-zinc-400">メンバーの名前変更</div>
          ) : (
            <Tab
              options={[
                { label: '名前変更', value: 'rename' },
                { label: 'ユーザー名を使う', value: 'reset' },
              ]}
              value={mode}
              onChange={setMode}
            ></Tab>
          )}
          {mode === 'rename' ? (
            <TextField label="新しい名前" value={name} onChange={setName}></TextField>
          ) : mode === 'reset' ? (
            <TextField label="新しい名前" value={member?.user?.name ?? ''} disabled></TextField>
          ) : (
            unreachable(mode)
          )}
          {notJoined ? null : mode === 'reset' ? (
            <Tips>ユーザーが個別に設定したニックネームが使用されます</Tips>
          ) : (
            <Tips>この旅の記録でのみ使用される名前を設定します</Tips>
          )}
          <Button
            disabled={mode === 'rename' && name === ''}
            onClick={() => {
              void renameMember(memberId, mode === 'rename' ? name : mode === 'reset' ? '' : unreachable(mode))
              present.close()
            }}
          >
            保存
          </Button>
        </div>
      </Sheet>
    </>
  )
}
