export function playClickSound() {
  const audio = new Audio("/sounds/click.mp3");

  audio.volume = 0.3;

  audio.play().catch(() => {});
}

export function playXPSound() {
  const audio = new Audio("/sounds/xp.mp3");
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

export function playLevelUpSound() {
  const audio = new Audio("/sounds/level-up.mp3");
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

export function playSuccessSound() {
  const audio = new Audio("/sounds/success.mp3");
  audio.volume = 0.4;
  audio.play().catch(() => {});
}

export function playNotificationSound() {
  const audio = new Audio("/sounds/notification.mp3");
  audio.volume = 0.3;
  audio.play().catch(() => {});
}
