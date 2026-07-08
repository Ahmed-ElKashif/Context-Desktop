export type PlanId = "sandbox" | "startup" | "growth" | "embed";
export type BillingCycle = "monthly" | "annual";

export interface PlanDetails {
  price: number | "Custom";
  baseDocs: number;
  baseTokens: number;
  docRate: number;
  tokenRatePer100k: number;
  hasDocOverage: boolean;
  hasTokenOverage: boolean;
}

export const getPlanDetails = (
  planId: PlanId,
  cycle: BillingCycle,
): PlanDetails => {
  switch (planId) {
    case "sandbox":
      return {
        price: 0,
        baseDocs: 100,
        baseTokens: 100000,
        docRate: 3,
        tokenRatePer100k: 12,
        hasDocOverage: true,
        hasTokenOverage: true,
      };
    case "growth":
      return {
        price: cycle === "annual" ? 1490 : 1990,
        baseDocs: Infinity,
        baseTokens: 2500000,
        docRate: 0,
        tokenRatePer100k: 5,
        hasDocOverage: false,
        hasTokenOverage: true,
      };
    case "embed":
      return {
        price: "Custom",
        baseDocs: Infinity,
        baseTokens: Infinity,
        docRate: 0,
        tokenRatePer100k: 0,
        hasDocOverage: false,
        hasTokenOverage: false,
      };
    case "startup":
    default:
      return {
        price: cycle === "annual" ? 599 : 799,
        baseDocs: Infinity,
        baseTokens: 500000,
        docRate: 0,
        tokenRatePer100k: 8,
        hasDocOverage: false,
        hasTokenOverage: true,
      };
  }
};
