export const CATALOG_META: Record<string, { label: string; icon: string }> = {
  AUTH: { label: 'Xác thực & Tài khoản', icon: '🔒' },
  API_KEY: { label: 'Quản lý API Key', icon: '🔑' },
  ENERGY: { label: 'Năng lượng & Đơn hàng', icon: '⚡' },
  TRANSACTION: { label: 'Thanh toán & Giao dịch', icon: '💸' },
  SECURITY: { label: 'Bảo mật hệ thống', icon: '🛡️' },
  RATE_LIMIT: { label: 'Giới hạn tần suất', icon: '⏳' },
  CONCURRENCY: { label: 'Xử lý đồng thời (Race Condition)', icon: '🔄' },
  CLEANUP: { label: 'Dọn dẹp dữ liệu hậu kiểm', icon: '🧹' },
  HEALTH: { label: 'Trạng thái hệ thống', icon: '🏥' },
  GENERAL: { label: 'Tổng hợp / Khác', icon: '📁' },
};

export const REFRESH_INTERVAL = 3000;
