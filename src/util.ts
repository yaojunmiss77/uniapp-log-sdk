/**
 * 时间格式化函数
 * @param date
 * @returns
 */
export function formatDate(date: Date | number | string): string {
  if (!date) {
    return `${date}`;
  }
  const parsedDate = new Date(date);

  if (!(parsedDate instanceof Date) || isNaN(parsedDate.getTime())) {
    return 'Invalid Date';
  }
  const year = parsedDate.getFullYear().toString().padStart(4, '0');
  const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
  const day = parsedDate.getDate().toString().padStart(2, '0');
  const hour = parsedDate.getHours().toString().padStart(2, '0');
  const minute = parsedDate.getMinutes().toString().padStart(2, '0');
  const second = parsedDate.getSeconds().toString().padStart(2, '0');
  const millisecond = parsedDate.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${millisecond}`;
}
