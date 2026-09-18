import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'pink' | 'cyan' | 'gold' | 'lime' | 'red' | 'ghost'
  disabled?: boolean
  className?: string
}

export function PixelButton({
  children,
  onClick,
  type = 'button',
  variant = 'pink',
  disabled,
  className = '',
}: Props) {
  return (
    <button
      type={type}
      className={`pxl-btn pxl-btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
