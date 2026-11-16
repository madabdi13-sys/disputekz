// Казахстан живёт в одном часовом поясе (UTC+5 с 2024 г.).
const TZ = "Asia/Almaty";

const dateFmt = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const dateTimeFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

export function formatDate(d: Date | null | undefined) {
  return d ? dateFmt.format(d) : "—";
}

export function formatDateTime(d: Date | null | undefined) {
  return d ? dateTimeFmt.format(d) : "—";
}
