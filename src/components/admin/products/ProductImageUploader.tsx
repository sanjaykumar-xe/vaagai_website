import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Upload, Star, Trash2, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import type { ProductImageInput } from '../../../types/product'
import { validateProductImageFile } from '../../../services/adminProducts'

interface ProductImageUploaderProps {
  images: ProductImageInput[]
  onChange: (nextImages: ProductImageInput[]) => void
  onMarkRemoved: (removed: { id: string; storage_path: string }) => void
}

export default function ProductImageUploader({
  images,
  onChange,
  onMarkRemoved,
}: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const blobUrlsRef = useRef<Set<string>>(new Set())
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Revoke any remaining locally created blob URLs when the uploader unmounts
  useEffect(() => {
    const trackedUrls = blobUrlsRef.current
    return () => {
      trackedUrls.forEach((url) => URL.revokeObjectURL(url))
      trackedUrls.clear()
    }
  }, [])

  const createTrackedObjectUrl = (file: File): string => {
    const url = URL.createObjectURL(file)
    blobUrlsRef.current.add(url)
    return url
  }

  const revokeTrackedObjectUrl = (url: string) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
      blobUrlsRef.current.delete(url)
    }
  }

  const handleFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    setValidationError(null)
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    const validAdditions: ProductImageInput[] = []
    for (const file of files) {
      const error = validateProductImageFile(file)
      if (error) {
        validAdditions.forEach((item) => revokeTrackedObjectUrl(item.preview_url))
        setValidationError(error)
        return
      }
      validAdditions.push({
        file,
        preview_url: createTrackedObjectUrl(file),
        alt_text_en: '',
        alt_text_ta: '',
        sort_order: images.length + validAdditions.length,
        is_primary: images.length === 0 && validAdditions.length === 0,
        is_existing: false,
      })
    }

    onChange([...images, ...validAdditions])
  }

  const handleReplaceFile = (e: ChangeEvent<HTMLInputElement>) => {
    setValidationError(null)
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || replaceIndex === null) return

    const error = validateProductImageFile(file)
    if (error) {
      setValidationError(error)
      setReplaceIndex(null)
      return
    }

    const target = images[replaceIndex]
    if (target.is_existing && target.id && target.storage_path) {
      onMarkRemoved({ id: target.id, storage_path: target.storage_path })
    } else if (!target.is_existing) {
      revokeTrackedObjectUrl(target.preview_url)
    }

    const updated = images.map((img, idx) =>
      idx === replaceIndex
        ? {
            file,
            preview_url: createTrackedObjectUrl(file),
            alt_text_en: img.alt_text_en,
            alt_text_ta: img.alt_text_ta,
            sort_order: idx,
            is_primary: img.is_primary,
            is_existing: false,
          }
        : img,
    )
    onChange(updated)
    setReplaceIndex(null)
  }

  const handleSetPrimary = (index: number) => {
    onChange(
      images.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      })),
    )
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= images.length) return
    const next = [...images]
    const [moved] = next.splice(index, 1)
    next.splice(targetIdx, 0, moved)
    onChange(next.map((img, idx) => ({ ...img, sort_order: idx })))
  }

  const handleRemove = (index: number) => {
    const target = images[index]
    if (target.is_existing && target.id && target.storage_path) {
      onMarkRemoved({ id: target.id, storage_path: target.storage_path })
    } else if (!target.is_existing) {
      revokeTrackedObjectUrl(target.preview_url)
    }

    const remaining = images.filter((_, idx) => idx !== index)
    if (remaining.length > 0 && !remaining.some((i) => i.is_primary)) {
      remaining[0] = { ...remaining[0], is_primary: true }
    }
    onChange(remaining.map((img, idx) => ({ ...img, sort_order: idx })))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted">
            Upload JPG, PNG, or WebP images (max 5 MB each). The primary image appears in the product catalogue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-control border border-burgundy/40 bg-white px-4 py-2 text-xs font-semibold text-burgundy hover:bg-champagne/30 transition-colors shrink-0"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          <span>Upload Images</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
        />
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleReplaceFile}
          className="hidden"
        />
      </div>

      {validationError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-control border border-red-200 bg-red-50 p-3 text-xs text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-card border-2 border-dashed border-sand bg-ivory/40 px-6 py-10 text-center hover:border-burgundy/50 hover:bg-ivory transition-colors"
        >
          <Upload className="h-7 w-7 text-burgundy/70 mb-2" aria-hidden="true" />
          <span className="text-sm font-medium text-charcoal">Click to select product images</span>
          <span className="mt-1 text-xs text-muted">JPG, JPEG, PNG, WebP up to 5 MB</span>
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, index) => (
            <div
              key={`${img.preview_url}-${index}`}
              className={`rounded-card border p-3 bg-white transition-shadow ${
                img.is_primary ? 'border-burgundy ring-1 ring-burgundy/20 shadow-sm' : 'border-sand'
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-control bg-ivory">
                <img
                  src={img.preview_url}
                  alt={img.alt_text_en || `Product preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {img.is_primary && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-burgundy px-2.5 py-0.5 text-[0.7rem] font-semibold text-white shadow">
                    <Star className="h-3 w-3 fill-gold text-gold" aria-hidden="true" />
                    Primary
                  </span>
                )}
              </div>

              <div className="mt-2.5 space-y-2">
                <input
                  type="text"
                  value={img.alt_text_en}
                  onChange={(e) => {
                    const val = e.target.value
                    onChange(
                      images.map((item, idx) =>
                        idx === index ? { ...item, alt_text_en: val } : item,
                      ),
                    )
                  }}
                  placeholder="Alt text (English)"
                  aria-label={`Alt text in English for image ${index + 1}`}
                  className="w-full rounded-control border border-sand bg-ivory/30 px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:bg-white focus:outline-none"
                />

                <input
                  type="text"
                  value={img.alt_text_ta}
                  onChange={(e) => {
                    const val = e.target.value
                    onChange(
                      images.map((item, idx) =>
                        idx === index ? { ...item, alt_text_ta: val } : item,
                      ),
                    )
                  }}
                  placeholder="Alt text (Tamil)"
                  aria-label={`Alt text in Tamil for image ${index + 1}`}
                  className="w-full rounded-control border border-sand bg-ivory/30 px-2.5 py-1.5 text-xs text-charcoal focus:border-burgundy focus:bg-white focus:outline-none"
                />

                <div className="flex items-center justify-between gap-1 pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      title="Move earlier"
                      className="rounded-control border border-sand p-1 text-muted hover:bg-ivory disabled:opacity-40"
                      aria-label="Move image earlier"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 1)}
                      title="Move later"
                      className="rounded-control border border-sand p-1 text-muted hover:bg-ivory disabled:opacity-40"
                      aria-label="Move image later"
                    >
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="rounded-control border border-sand px-2 py-1 text-[0.7rem] font-medium text-burgundy hover:bg-champagne/30"
                      >
                        Set Primary
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setReplaceIndex(index)
                        replaceInputRef.current?.click()
                      }}
                      title="Replace image"
                      className="rounded-control border border-sand p-1 text-charcoal hover:bg-ivory"
                      aria-label="Replace image"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      title="Remove image"
                      className="rounded-control border border-sand p-1 text-red-700 hover:bg-red-50"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
