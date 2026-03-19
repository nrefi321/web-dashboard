// utils/mediaHelper.js
import { MEDIA_BASE } from '../config.js'

export function convertPath(path) {
  if (!path) return ""

  // Normalize backslashes
  const normalized = path.replace(/\\/g, "/")

  // Ensure single leading slash
  const relative = normalized.startsWith("/") ? normalized : `/${normalized}`

  // API returns: /ai_result/original_img/foo.jpg
  // Media server serves: http://10.153.94.123:8003/media/ai_result/original_img/foo.jpg
  // So we need to prepend /media if not already there
  const withMedia = relative.startsWith("/media")
    ? relative
    : `/media${relative}`

  return `${MEDIA_BASE}${withMedia}`
}

export function getMedia(item) {
  return [
    { type: 'image', label: 'Predict',  src: item.image_predict_path },
    { type: 'image', label: 'Original', src: item.image_original_path },
    { type: 'video', label: 'Video',    src: item.video_path }
  ]
}