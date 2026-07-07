import { useState, type ImgHTMLAttributes } from 'react'

// Shows a soft placeholder if a photo fails to load (the sample photos are
// remote Unsplash URLs).
export function ImageWithFallback(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false)
  const { alt, className, src, ...rest } = props

  // No src (e.g. a profile with no photo yet) or a load error → soft placeholder.
  if (failed || !src) {
    return <div className={className} aria-label={alt} role="img" />
  }

  return <img {...rest} src={src} alt={alt} className={className} onError={() => setFailed(true)} />
}
