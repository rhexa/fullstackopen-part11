import React, { useEffect, useRef, useState } from 'react'

const Timeout = ({ delay, children, hook }) => {
  delay = delay * 1000
  const [visible, setVisible] = useState(true)
  const [isTimeout, setIsTimeout] = useState(false)

  const styles = {}
  styles.fadeout = {
    opacity: 0,
    transition: `all 500ms linear ${delay}ms`
  }
  styles.default = {
    opacity: 1,
  }

  const handleTransitionEnd = () => {
    setVisible(false)
    hook(null)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [delay])

  if (visible) return (
    <div style={isTimeout ? styles.fadeout : styles.default} onTransitionEnd={handleTransitionEnd}>{children}</div>
  )
  return null
}

export default Timeout