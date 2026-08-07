/**
 * Format currency in RWF
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to local string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format datetime to local string
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get status color for payment status
 */
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700';
    case 'UNPAID':
      return 'bg-red-100 text-red-700';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Get status color for service status
 */
export const getServiceStatusColor = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-700';
    case 'ONGOING':
      return 'bg-blue-100 text-blue-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Get status color for delivery status
 */
export const getDeliveryStatusColor = (status) => {
  switch (status) {
    case 'RETURNED':
      return 'bg-green-100 text-green-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'OVERDUE':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Download file from blob
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get service type label with translation key
 */
export const getServiceTypeKey = (type) => {
  const mapping = {
    IT_MAINTENANCE: 'services.it_maintenance',
    ELECTRICAL_INSTALLATION: 'services.electrical_installation',
    CONSTRUCTION: 'services.construction',
    GENERATOR_REPAIR: 'services.generator_repair',
    OFFICE_STATIONARY: 'services.office_stationary',
    DECORATION_SOUND: 'services.decoration_sound',
  };
  return mapping[type] || type;
};