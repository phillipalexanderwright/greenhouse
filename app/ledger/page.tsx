"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Pill, Empty } from "@/components/ui";

function money(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}

export default function LedgerPage() {
  const { data } = useStore();

  const months = [...data.months].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );

  const rows = months.map((m) => {
    const items = data.box_items.filter((i) => i.month_id === m.id);
    const boxCost = items.reduce((a, i) => a + (i.cost || 0), 0);
    const dinner = data.dinners.find((d) => d.month_id === m.id);
    const dinnerBudget = dinner?.budget || 0;
    const guests = dinner
      ? data.guests.filter((g) => g.dinner_id === dinner.id)
      : [];
    const confirmed = guests.filter((g) => g.rsvp === "yes").length;
    const seats = confirmed + guests.filter((g) => g.rsvp === "yes" && g.plus_one).length;
    return {
      month: m,
      items: items.length,
      boxCost,
      dinner,
      dinnerBudget,
      confirmed,
      seats,
      total: boxCost + dinnerBudget,
    };
  });

  const totalBox = rows.reduce((a, r) => a + r.boxCost, 0);
  const totalDinner = rows.reduce((a, r) => a + r.dinnerBudget, 0);

  return (
    <div>
      <PageHeader
        title="The Ledger"
        subtitle="What the whimsy costs — boxes, dinners, per guest"
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <div className="label-caps mb-2">Box costs · all months</div>
          <div className="font-display text-3xl font-semibold">
            {money(totalBox)}
          </div>
          <p className="mt-1 text-sm text-ink/60">
            cost of contents per single box, summed across themes
          </p>
        </Card>
        <Card>
          <div className="label-caps mb-2">Dinner budgets · all months</div>
          <div className="font-display text-3xl font-semibold">
            {money(totalDinner)}
          </div>
          <p className="mt-1 text-sm text-ink/60">The Garden, every month</p>
        </Card>
        <Card>
          <div className="label-caps mb-2">Together</div>
          <div className="font-display text-3xl font-semibold">
            {money(totalBox + totalDinner)}
          </div>
          <p className="mt-1 text-sm text-ink/60">
            the price of a more natural tomorrow
          </p>
        </Card>
      </div>

      {rows.length === 0 ? (
        <Empty>
          Nothing on the books. Plant a month in{" "}
          <Link href="/box" className="underline">
            The Box
          </Link>{" "}
          and costs will gather here.
        </Empty>
      ) : (
        <div className="space-y-5">
          {rows.map((r) => (
            <Card key={r.month.id}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-display text-2xl font-semibold">
                    {r.month.name}
                  </div>
                  <div className="text-sm text-ink/60">
                    {r.month.theme || "no theme"}
                  </div>
                </div>
                <Pill tone="olive">{money(r.total)} total</Pill>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="label-caps">Box · per unit</div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {money(r.boxCost)}
                  </div>
                  <p className="text-xs text-ink/45">
                    {r.items} item{r.items === 1 ? "" : "s"}
                  </p>
                </div>
                <div>
                  <div className="label-caps">Dinner budget</div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {r.dinner ? money(r.dinnerBudget) : "—"}
                  </div>
                  <p className="text-xs text-ink/45">
                    {r.dinner ? r.dinner.venue || "venue TBD" : "not planned"}
                  </p>
                </div>
                <div>
                  <div className="label-caps">Per guest</div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {r.dinner && r.confirmed > 0
                      ? money(r.dinnerBudget / r.confirmed)
                      : "—"}
                  </div>
                  <p className="text-xs text-ink/45">
                    {r.confirmed} confirmed
                  </p>
                </div>
                <div>
                  <div className="label-caps">Box × 20 boxes</div>
                  <div className="mt-1 font-display text-xl font-semibold">
                    {money(r.boxCost * 20)}
                  </div>
                  <p className="text-xs text-ink/45">
                    if every Garden guest got one
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-6 text-[11px] text-ink/45">
        Box costs come from each item&apos;s cost in The Box. Dinner budgets
        come from The Garden. Update them there and the Ledger follows.
      </p>
    </div>
  );
}
