export const isValidDate = (dateString) => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(dateString)) return false;

  const parts = dateString.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (year < 1900 || year > 2100 || month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day > 0 && day <= daysInMonth;
};

export const parseDateDMY = (dateString) => {
  if (!isValidDate(dateString)) return null;
  const parts = dateString.split('/');
  return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
};

export const getTodayDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const getDueDateStatus = (dueDateStr) => {
  const due = parseDateDMY(dueDateStr);
  const today = getTodayDate();

  if (!due) return { label: 'Sai định dạng', isOverdue: false, diffDays: 0 };

  const diffTime = due - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Quá hạn ${Math.abs(diffDays)} ngày`, isOverdue: true, diffDays };
  } else if (diffDays === 0) {
    return { label: 'Hạn hôm nay', isOverdue: false, diffDays: 0 };
  } else {
    return { label: `Còn ${diffDays} ngày`, isOverdue: false, diffDays };
  }
};