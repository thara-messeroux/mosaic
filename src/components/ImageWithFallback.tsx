import { useState, type ImgHTMLAttributes } from 'react'

// Shows a soft placeholder if a photo fails to load (the sample photos are
// remote Unsplash URLs).
export function ImageWithFallback(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)
  const { alt, className, ...rest } = props

  if (failed) {
    return <div className={className} aria-label={alt} role="img" />
  }

  return <img {...rest} alt={alt} className={className} onError={() => setFailed(true)} />
}
