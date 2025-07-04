export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date
    .toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo", // 明示的に日本時間にする
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/\//g, "/");
};
