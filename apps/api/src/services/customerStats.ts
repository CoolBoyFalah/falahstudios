import mongoose from "mongoose";
import Customer from "../models/Customer";
import Order from "../models/Order";

/**
 * Recomputes a customer's lifetime figures from their orders. Called after any
 * order is created, re-statused or deleted so totals can never drift.
 * Cancelled orders don't count towards spend.
 */
export async function refreshCustomerStats(
  clientId: string,
  customerId?: mongoose.Types.ObjectId | string | null
) {
  if (!customerId) return;

  const [stats] = await Order.aggregate<{ totalSpent: number; orderCount: number; lastOrderAt: Date }>([
    {
      $match: {
        clientId: new mongoose.Types.ObjectId(clientId),
        customerId: new mongoose.Types.ObjectId(customerId),
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: "$total" },
        orderCount: { $sum: 1 },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
  ]);

  await Customer.updateOne(
    { _id: customerId, clientId },
    stats
      ? { $set: { totalSpent: stats.totalSpent, orderCount: stats.orderCount, lastOrderAt: stats.lastOrderAt } }
      : { $set: { totalSpent: 0, orderCount: 0 }, $unset: { lastOrderAt: 1 } }
  );
}

/**
 * Finds the customer an order belongs to (by email, then by exact name),
 * creating one if this is a new customer.
 */
export async function resolveCustomer(clientId: string, name: string, email?: string) {
  if (email) {
    const byEmail = await Customer.findOne({ clientId, email });
    if (byEmail) return byEmail;
  }

  const byName = await Customer.findOne({
    clientId,
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    ...(email ? { $or: [{ email: { $exists: false } }, { email }] } : {}),
  });
  if (byName) {
    if (email && !byName.email) {
      byName.email = email;
      await byName.save();
    }
    return byName;
  }

  return Customer.create({ clientId, name, email });
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
