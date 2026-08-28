import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return '🖼️'
  if (mimeType?.startsWith('video/')) return '🎥'
  if (mimeType?.startsWith('audio/')) return '🎵'
  if (mimeType?.includes('pdf')) return '📄'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝'
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊'
  if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📽️'
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar')) return '📦'
  if (mimeType?.includes('text')) return '📃'
  return '📄'
}

export function getFileColor(mimeType) {
  if (mimeType?.startsWith('image/')) return 'text-green-600'
  if (mimeType?.startsWith('video/')) return 'text-purple-600'
  if (mimeType?.startsWith('audio/')) return 'text-pink-600'
  if (mimeType?.includes('pdf')) return 'text-red-600'
  if (mimeType?.includes('word') || mimeType?.includes('document')) return 'text-blue-600'
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return 'text-green-600'
  if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return 'text-orange-600'
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar')) return 'text-yellow-600'
  if (mimeType?.includes('text')) return 'text-gray-600'
  return 'text-gray-600'
}
