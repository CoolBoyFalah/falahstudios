// Local / long-running server. On Vercel, src/serverless.ts is used instead.
import app from "./app";
import { connectDatabase } from "./config/database";
import Customer from "./models/Customer";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    console.log("✅ Database connected successfully");

    // Replaces the old sparse customer email index, which wrongly allowed
    // only one email-less customer per workspace.
    await Customer.syncIndexes();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
