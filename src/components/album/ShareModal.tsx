'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Share2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { textStyles } from '@/components/ui/text-styles'
import AppButton from '@/components/ui/AppButton'
import DischecLoader from '@/components/ui/DischecLoader'
import ShareCard, { type DisplayTrack } from '@/components/album/ShareCard'
import ShareModeSelector, { type ShareMode } from '@/components/album/ShareModeSelector'
import TrackPicker from '@/components/album/TrackPicker'
import { captureNodeAsPng, downloadBlob, fetchImageAsDataUrl, slugifyFilename } from '@/lib/share/export-image'
import { useAutoHeight } from '@/hooks/useAutoHeight'
import type { DeezerAlbumResult, DeezerTrackResult } from '@/lib/deezer/types'

interface RatedTrack {
  position: number
  title: string
  rating: number
}

interface ShareModalProps {
  album: DeezerAlbumResult
  artistName: string | undefined
  tracks: DeezerTrackResult[]
  ratedTracks: RatedTrack[]
  releaseRating: number | undefined
  avgRating: number | null
  onClose: () => void
}

export default function ShareModal({
  album,
  artistName,
  tracks,
  ratedTracks,
  releaseRating,
  avgRating,
  onClose,
}: ShareModalProps) {
  const isSingle = album.record_type === 'single'
  const [pseudo, setPseudo] = useState<string | null>(null)
  const [coverDataUrl, setCoverDataUrl] = useState<string | null>(null)
  const [loadedAlbumId, setLoadedAlbumId] = useState(album.id)
  const [sharing, setSharing] = useState(false)
  const [mode, setMode] = useState<ShareMode>('quick')
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<number[]>([])
  const [previewOpen, setPreviewOpen] = useState(true)
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const shareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const { containerRef: previewContainerRef, contentRef: previewContentRef } = useAutoHeight(previewOpen)

  if (album.id !== loadedAlbumId) {
    setLoadedAlbumId(album.id)
    setCoverDataUrl(null)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('profiles').select('pseudo').eq('id', user.id).single().then(({ data }) => {
        if (data) setPseudo(data.pseudo)
      })
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchImageAsDataUrl(album.cover_xl).then(dataUrl => {
      if (!cancelled) setCoverDataUrl(dataUrl)
    }).catch(err => console.error(err))
    return () => {
      cancelled = true
    }
  }, [album.id, album.cover_xl])

  function toggleFavorite(trackId: number) {
    setFavoriteTrackIds(prev => {
      if (prev.includes(trackId)) return prev.filter(id => id !== trackId)
      if (prev.length >= 5) return prev
      return [...prev, trackId]
    })
  }

  const displayTracks: DisplayTrack[] = useMemo(() => {
    if (mode === 'quick') return []
    if (mode === 'favorites') {
      return favoriteTrackIds
        .map(id => tracks.find(t => t.id === id))
        .filter((t): t is DeezerTrackResult => !!t)
        .map(t => ({ title: t.title }))
    }
    return ratedTracks.map(t => ({ title: t.title, rating: t.rating }))
  }, [mode, favoriteTrackIds, tracks, ratedTracks])

  const showTrackRatings = mode === 'complete'
  const showAvgBadge = mode === 'complete'
  const completeDisabled = avgRating === null
  const favoritesEmpty = mode === 'favorites' && favoriteTrackIds.length === 0

  const filename = slugifyFilename(artistName, album.title)
  const ready = coverDataUrl !== null && pseudo !== null
  const canExport = previewUrl !== null && !favoritesEmpty

  useEffect(() => {
    if (!ready || !cardRef.current) return
    let cancelled = false

    // instant loading feedback
    const feedbackTimer = setTimeout(() => {
      if (!cancelled) setRegenerating(true)
    }, 0)

    const captureTimer = setTimeout(async () => {
      try {
        const blob = await captureNodeAsPng(cardRef.current!)
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = url
        setPreviewBlob(blob)
        setPreviewUrl(url)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setRegenerating(false)
      }
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(feedbackTimer)
      clearTimeout(captureTimer)
    }
  }, [ready, album.id, displayTracks, showTrackRatings, showAvgBadge, releaseRating, avgRating, pseudo])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    }
  }, [])

  function renderOptionsPanel() {
    return (
      <ShareModeSelector
        mode={mode}
        onChange={setMode}
        completeDisabled={completeDisabled}
        favoritesSlot={<TrackPicker tracks={tracks} selectedIds={favoriteTrackIds} onToggle={toggleFavorite} />}
      />
    )
  }

  function renderPreviewImage() {
    if (!previewUrl) return <DischecLoader size={48} />
    return (
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob url, next/image unsupported */}
        <img src={previewUrl} alt="Aperçu du partage" className="max-w-full h-auto rounded-lg" />
        {regenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 rounded-lg">
            <DischecLoader size={32} />
          </div>
        )}
      </div>
    )
  }

  const handleDownload = () => {
    if (!previewBlob) return
    downloadBlob(previewBlob, filename)
  }

  const handleShare = async () => {
    if (!previewBlob) return
    setSharing(true)
    try {
      const file = new File([previewBlob], filename, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: album.title,
          text: artistName
            ? `Mon avis sur ${album.title} de ${artistName} sur Discheck`
            : `Mon avis sur ${album.title} sur Discheck`,
        })
      } else {
        downloadBlob(previewBlob, filename)
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) console.error(err)
    } finally {
      setSharing(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className={`bg-bg-secondary border border-white/5 rounded-lg shadow-xl h-[85vh] w-full flex flex-col ${
          isSingle ? 'md:w-[500px]' : 'md:w-[760px]'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 md:px-5 pt-4 pb-3 flex-shrink-0 border-b border-white/5">
          <p className={`${textStyles.cardTitle} text-text-green`}>Partager mon avis</p>
          <button onClick={onClose} className="text-text-disabled hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {isSingle ? (
          // singles only ever share their own rating — no options to configure
          <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-5 flex items-center-safe justify-center">
            {renderPreviewImage()}
          </div>
        ) : (
          <>
            {/* mobile: single scroll, options + collapsible preview */}
            <div className="md:hidden flex-1 min-h-0 overflow-y-auto p-4">
              {renderOptionsPanel()}

              <button
                onClick={() => setPreviewOpen(v => !v)}
                className="flex items-center justify-between w-full py-2.5 mt-2 border-t border-white/5"
              >
                <span className={`${textStyles.body} font-medium text-text-secondary`}>Aperçu</span>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary transition-transform duration-300 ${previewOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <div ref={previewContainerRef} className="overflow-hidden" style={{ height: 0 }}>
                <div ref={previewContentRef} className="pt-3 flex justify-center">{renderPreviewImage()}</div>
              </div>
            </div>

            {/* desktop/tablet: two columns, preview always visible */}
            <div className="hidden md:flex flex-1 min-h-0">
              <div className="w-[280px] flex-shrink-0 p-5 border-r border-white/5">
                {renderOptionsPanel()}
              </div>

              <div className="flex-1 min-h-[200px] overflow-y-auto p-5 flex items-center-safe justify-center">
                {renderPreviewImage()}
              </div>
            </div>
          </>
        )}

        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-4 flex-shrink-0 border-t border-white/5">
          {favoritesEmpty && (
            <p className={`${textStyles.caption} text-text-disabled text-center mb-2`}>
              Sélectionne au moins un titre pour continuer
            </p>
          )}
          <div className="flex gap-2">
            {shareSupported && (
              <AppButton
                variant="primary"
                size="md"
                className="flex-1"
                loading={sharing}
                disabled={!canExport}
                leftIcon={<Share2 size={16} />}
                onClick={handleShare}
              >
                Partager
              </AppButton>
            )}
            <AppButton
              variant={shareSupported ? 'outline' : 'primary'}
              size="md"
              className={shareSupported ? 'flex-1' : undefined}
              fullWidth={!shareSupported}
              disabled={!canExport}
              leftIcon={<Download size={16} />}
              onClick={handleDownload}
            >
              Télécharger
            </AppButton>
          </div>
        </div>
      </div>

      <div className="fixed top-0 left-[-9999px]" aria-hidden>
        <ShareCard
          ref={cardRef}
          album={album}
          coverSrc={coverDataUrl}
          artistName={artistName}
          displayTracks={displayTracks}
          showTrackRatings={showTrackRatings}
          showAvgBadge={showAvgBadge}
          releaseRating={releaseRating}
          avgRating={avgRating}
          pseudo={pseudo}
        />
      </div>
    </div>,
    document.body
  )
}
