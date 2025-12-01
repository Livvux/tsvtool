'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MediaStepProps } from '../types';

export function MediaStep({
  formData,
  onUpdate,
  uploadedImages,
  uploadedVideos,
  uploadingImages,
  uploadingVideos,
  onImageUpload,
  onVideoUpload,
  onRemoveImage,
  onRemoveVideo,
}: MediaStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-5 duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <span className="text-3xl">📷</span>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">
          Medien hochladen
        </h2>
        <p className="text-muted-foreground mt-2">
          Качване на снимки и видеа
        </p>
      </div>

      {/* Images Upload */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📷</span>
              <span>Снимки / Bilder</span>
              <span className="text-destructive">*</span>
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              Max. 10 MB pro Bild
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload area */}
          <div className="relative">
            <label 
              htmlFor="images"
              className={`
                flex flex-col items-center justify-center w-full h-40 
                border-2 border-dashed rounded-xl cursor-pointer
                transition-all duration-200
                ${uploadingImages 
                  ? 'bg-primary/5 border-primary/30' 
                  : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }
              `}
            >
              {uploadingImages ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm text-primary">Качване... / Lädt hoch...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="text-4xl">📸</span>
                  <span className="text-sm font-medium">Кликнете или плъзнете снимки тук</span>
                  <span className="text-xs">Klicken oder Bilder hierher ziehen</span>
                  <span className="text-xs text-muted-foreground/60">JPEG, PNG, WebP, GIF</span>
                </div>
              )}
            </label>
            <Input
              id="images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={onImageUpload}
              disabled={uploadingImages}
              className="hidden"
            />
          </div>

          {/* Uploaded images preview */}
          {uploadedImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <span>✅</span>
                <span>{uploadedImages.length} снимки качени / Bilder hochgeladen</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((_, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    <span>🖼️ Bild {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedImages.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>Поне една снимка е задължителна / Mindestens ein Bild erforderlich</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Videos Upload */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>🎬</span>
              <span>Видеа / Videos</span>
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              Max. 100 MB pro Video
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload area */}
          <div className="relative">
            <label 
              htmlFor="videos"
              className={`
                flex flex-col items-center justify-center w-full h-32 
                border-2 border-dashed rounded-xl cursor-pointer
                transition-all duration-200
                ${uploadingVideos 
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300' 
                  : 'border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                }
              `}
            >
              {uploadingVideos ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  <span className="text-sm text-blue-600">Video wird hochgeladen...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <span className="text-3xl">🎥</span>
                  <span className="text-sm">Кликнете за видео / Klicken für Video</span>
                  <span className="text-xs text-muted-foreground/60">MP4, WebM, MOV, AVI</span>
                </div>
              )}
            </label>
            <Input
              id="videos"
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
              multiple
              onChange={onVideoUpload}
              disabled={uploadingVideos}
              className="hidden"
            />
          </div>

          {/* Uploaded videos preview */}
          {uploadedVideos.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                <span>✅</span>
                <span>{uploadedVideos.length} видеа качени / Videos hochgeladen</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {uploadedVideos.map((_, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    <span>🎬 Video {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveVideo(index)}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Video Link */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>🔗</span>
            <span>Външен видео линк / Externer Video-Link</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="videoLink" className="text-base">
              YouTube или Vimeo линк
            </Label>
            <Input
              id="videoLink"
              type="url"
              value={formData.videoLink || ''}
              onChange={(e) => onUpdate('videoLink', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              Алтернатива на качване на видео / Alternative zum Video-Upload
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900">
        <span className="text-xl">💡</span>
        <div>
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Съвети за медии / Medien-Tipps
          </p>
          <ul className="text-sm text-purple-700 dark:text-purple-300 mt-2 space-y-1">
            <li>• Качете ясни снимки от различни ъгли</li>
            <li>• Laden Sie klare Fotos aus verschiedenen Winkeln hoch</li>
            <li>• Videos zeigen das Verhalten besser als Fotos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

