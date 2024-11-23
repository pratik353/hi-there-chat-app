import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formateDate(date: string) {
  const _date = new Date(date);

  // Extract hours and minutes
  let hours = _date.getHours();
  const minutes = _date.getMinutes().toString().padStart(2, "0");

  // Determine AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours to 12-hour format
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${hours}:${minutes} ${ampm}`;
}
