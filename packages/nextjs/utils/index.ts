export const daysLeft = (deadline: string): string => {
  const difference: number = new Date(deadline).getTime() - Date.now();
  const remainingDays: number = difference / (1000 * 3600 * 24);

  return remainingDays.toFixed(0);
};

export const calculateBarPercentage = (goal: number, raisedAmount: number): number => {
  const percentage: number = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url: string, callback: (result: boolean) => void): void => {
  const img: HTMLImageElement = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = (): void => callback(true);
  img.onerror = (): void => callback(false);
};
