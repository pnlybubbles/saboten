import isNonNullable from '@/utils/basic/isNonNullable'
import clsx from 'clsx'

const OPTICAL_SIZE = [20, 24] as const
const WEIGHT = [500, 600] as const
const FILL = [0, 1] as const
const GRADE = [-25, 0, 200] as const

export type OpticalSize = (typeof OPTICAL_SIZE)[number]
export type Weight = (typeof WEIGHT)[number]
export type Fill = (typeof FILL)[number]
export type Grade = (typeof GRADE)[number]

const SIZE_TO_WEIGHT: Record<OpticalSize, Weight> = {
  [20]: 500,
  [24]: 600,
}

function px(value: number) {
  return `${value}px` as const
}

const fontVariationSerttings = ({
  weight,
  opticalSize,
  fill,
  grade,
}: {
  weight?: Weight
  opticalSize?: OpticalSize
  fill?: Fill
  grade?: Grade
}) =>
  [
    weight !== undefined ? { key: 'wght', value: weight } : undefined,
    opticalSize !== undefined ? { key: 'opsz', value: opticalSize } : undefined,
    fill !== undefined ? { key: 'FILL', value: fill } : undefined,
    grade !== undefined ? { key: 'GRAD', value: grade } : undefined,
  ]
    .filter(isNonNullable)
    .map((v) => `'${v.key}' ${v.value}`)
    .join(', ')

export default function Icon({
  name,
  size = 20,
  fill = false,
  className,
  inheritFontSize,
}: {
  name: string
  size?: OpticalSize
  fill?: boolean
  className?: string | undefined
  inheritFontSize?: boolean
}) {
  return (
    <i
      // eslint-disable-next-line tailwindcss/no-custom-classname
      className={clsx('material-symbols-outlined font-material-symbols inline-flex select-none', className)}
      style={{
        fontFamily: `'Material Symbols Outlined', 'Material Symbols Outlined Fallback'`,
        fontVariationSettings: fontVariationSerttings({
          weight: SIZE_TO_WEIGHT[size],
          opticalSize: size,
          fill: fill ? 1 : 0,
        }),
        // font-sizeが指定されていればwidth,heightの指定は不要だが、
        // Fallbackフォントが適用されたときにlayout-shiftを抑制するために指定している
        ...(inheritFontSize
          ? {
              fontSize: '1em',
              width: '1em',
              height: '1em',
            }
          : {
              fontSize: px(size),
              width: px(size),
              height: px(size),
            }),
      }}
    >
      {name}
    </i>
  )
}
