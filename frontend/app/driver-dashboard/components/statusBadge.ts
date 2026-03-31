export function statusBadgeClass(status?: string) {
  switch (status) {
    case "ACTIVE":
      return "badge-active";
    case "IN_PROGRESS":
      return "badge-progress";
    case "CONFIRMED":
      return "badge-confirmed";
    case "PICKED_UP":
      return "badge-picked";
    case "DROPPED":
      return "badge-dropped";
    default:
      return "badge-ended";
  }
}
