/**
 * formatUtils - 格式化工具函数
 */

/**
 * 格式化日期
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN').format(date)
}

/**
 * 格式化数字
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('zh-CN').format(num)
}

/**
 * 截断文本
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
