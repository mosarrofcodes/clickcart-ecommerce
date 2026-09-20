import { Badge } from "@/components/ui/badge";
import { computeEmi, getSiteSettings } from "@/lib/site-settings";
import { formatMoney } from "@/lib/currency";

export default async function EmiInfo({ price }: { price: number }) {
  const settings = await getSiteSettings();
  if (settings.emiMonths < 1 || price <= 0) return null;

  const installment = computeEmi(price, settings.emiMonths, settings.emiInterestRate);
  if (installment <= 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2 bg-muted/40">
      <Badge variant="outline" className="shrink-0">
        EMI
      </Badge>
      <span className="text-muted-foreground">
        Pay as low as{" "}
        <span className="font-semibold text-foreground">
          {formatMoney(installment)}/mo
        </span>{" "}
        for {settings.emiMonths} months
        {settings.emiInterestRate > 0
          ? ` at ${settings.emiInterestRate}% annual interest`
          : " at 0% interest"}
      </span>
    </div>
  );
}