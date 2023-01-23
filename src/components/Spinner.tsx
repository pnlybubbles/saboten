interface Props {
  size?: number
  stroke?: number
  duration?: number
  className?: string
}

export default function Spinner({ size = 20, stroke = 3, duration = 1, className }: Props) {
  const c = size / 2
  const r = (size - stroke) / 2
  const s2 = stroke / 2

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      stroke="currentColor"
      className={className}
    >
      <g fill="none" fillRule="evenodd" strokeWidth={stroke}>
        <circle strokeOpacity=".5" cx={c} cy={c} r={r} />
        <path d={`M ${c},${s2} A ${r},${r} 0 0,1 ${size - s2},${c}`}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${c} ${c}`}
            to={`360 ${c} ${c}`}
            dur={`${duration}s`}
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  )
}
