import { useRef, useState } from 'preact/hooks'
import { defaultProgress, loadProgress, saveProgress, type Progress } from './storage'

function loadBrowserProgress() {
  try { return loadProgress(window.localStorage) } catch {
    return { progress: defaultProgress(), unavailable: true, message: null }
  }
}

export function useProgress() {
  const [initial] = useState(loadBrowserProgress)
  const [progress, setProgress] = useState(initial.progress)
  const current = useRef(progress)
  const [storageUnavailable, setStorageUnavailable] = useState(initial.unavailable)
  const [recoveryMessage, setRecoveryMessage] = useState(initial.message)
  const updateProgress = (update: (value: Progress) => Progress) => {
    const next = update(current.current)
    current.current = next
    setProgress(next)
    try { setStorageUnavailable(!saveProgress(window.localStorage, next)) } catch {
      setStorageUnavailable(true)
    }
  }
  return { progress, getProgress: () => current.current, updateProgress,
    storageUnavailable, recoveryMessage,
    dismissRecovery: () => setRecoveryMessage(null) }
}
