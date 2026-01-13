import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ETH/USD conversion rate (1 ETH = 2000 USD)
export const ETH_TO_USD_RATE = 2000;

export function ethToUsd(eth: number): number {
  return eth * ETH_TO_USD_RATE;
}

export function usdToEth(usd: number): number {
  return usd / ETH_TO_USD_RATE;
}

export function formatEth(eth: number): string {
  return eth.toFixed(4);
}

export function formatUsd(usd: number): string {
  return usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
