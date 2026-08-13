import { toBlob } from 'html-to-image'

export function slugifyFilename(artistName: string | undefined, albumTitle: string): string {
  const raw = `discheck-${artistName ?? ''}-${albumTitle}`

  const slug = raw
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug}.png`
}

export async function fetchImageAsDataUrl(url: string, width = 640): Promise<string> {
  const optimizedUrl = `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=90`
  const res = await fetch(optimizedUrl)

  if (!res.ok) {
    throw new Error(`Cover fetch failed with status ${res.status}`)
  }

  const blob = await res.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function waitForNodeReady(node: HTMLElement): Promise<void> {
  await document.fonts.ready
  const images = Array.from(node.querySelectorAll('img'))
  await Promise.all(images.map(img => img.decode().catch(() => {})))
}

export async function captureNodeAsPng(node: HTMLElement): Promise<Blob> {
  await waitForNodeReady(node)

  // no backgroundColor: transparent rounded corners
  const options = { pixelRatio: 2, cacheBust: true }

  // first pass warms internal cache
  await toBlob(node, options)
  const blob = await toBlob(node, options)

  if (!blob) {
    throw new Error('PNG export failed')
  }

  return blob
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // early revoke breaks Firefox downloads
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
