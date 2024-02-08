import { useEffect, useState } from 'react'

type Size = { width: number | undefined; height: number | undefined }

export default function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    if (!ref.current) return

    const observer = new ResizeObserver(([entry]) => {
      const target = entry?.contentBoxSize[0]
      if (target) {
        setSize({ width: target.inlineSize, height: target.blockSize })
      }
    })

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref])

  return size
}
