import Logs from "../models/LoginLog.js";

export const pruneOldLogs = async () => {
  try {
    // Delete logs older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Logs.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    
    if (result.deletedCount > 0) {
      console.log(`[Log Cleanup] Pruned ${result.deletedCount} old login logs.`);
    }
  } catch (err) {
    console.error("[Log Cleanup] Failed to prune logs:", err.message);
  }
};
