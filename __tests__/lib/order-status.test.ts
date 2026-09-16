import {
  ORDER_STATUS_STEPS,
  STATUS_COLORS,
  statusStepIndex,
  type OrderStatus,
} from "@/lib/order-status";

describe("order-status", () => {
  it("defines the five-track statuses in the correct order", () => {
    expect(ORDER_STATUS_STEPS).toEqual([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ]);
  });

  it("provides color classes for every valid status", () => {
    const statuses: OrderStatus[] = [
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    for (const status of statuses) {
      expect(STATUS_COLORS[status]).toMatch(/^bg-/);
    }
  });

  it("returns the correct step index for each status", () => {
    expect(statusStepIndex("PENDING")).toBe(0);
    expect(statusStepIndex("CONFIRMED")).toBe(1);
    expect(statusStepIndex("PROCESSING")).toBe(2);
    expect(statusStepIndex("SHIPPED")).toBe(3);
    expect(statusStepIndex("DELIVERED")).toBe(4);
  });

  it("returns -1 for statuses not on the happy path", () => {
    expect(statusStepIndex("CANCELLED")).toBe(-1);
  });
});