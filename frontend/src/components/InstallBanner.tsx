import { useEffect, useState } from 'react'
import { PixelButton } from './PixelButton'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [hidden, setHidden] = useState(() => localStorage.getItem('hide-install') === '1')
  const [ios, setIos] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIos(isIos && !standalone)
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (hidden) return null
  if (!deferred && !ios) return null

  return (
    <div className="install-banner">
      <p>{ios ? 'SHARE → ADD TO HOME SCREEN' : 'INSTALL AS PHONE OR DESKTOP APP'}</p>
      <div className="row">
        {deferred ? (
          <PixelButton
            variant="gold"
            onClick={async () => {
              await deferred.prompt()
              setDeferred(null)
            }}
          >
            INSTALL
          </PixelButton>
        ) : null}
        <PixelButton
          variant="ghost"
          onClick={() => {
            localStorage.setItem('hide-install', '1')
            setHidden(true)
          }}
        >
          LATER
        </PixelButton>
      </div>
    </div>
  )
}
