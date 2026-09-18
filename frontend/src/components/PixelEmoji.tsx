interface Props {
  emoji: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  motion?: 'bounce' | 'pulse' | 'spin' | 'float'
}

export function PixelEmoji({ emoji, size = 'md', motion = 'bounce' }: Props) {
  return (
    <span className={`pxl-emoji pxl-emoji-${size} pxl-emoji-${motion}`} aria-hidden="true">
      {emoji}
    </span>
  )
}
