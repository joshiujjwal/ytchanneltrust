import { getQuotaUsage, incrementQuota as dbIncrementQuota } from '../db/queries';

export const QUOTA_COSTS = {
  channelsList: 1,
  search: 100,
  videosList: 1,
  commentThreadsList: 1,
} as const;

export class QuotaManager {
  private dailyLimit: number = 10000;

  async checkQuota(requiredUnits: number = 1): Promise<boolean> {
    try {
      const usage = await getQuotaUsage();
      const remaining = this.dailyLimit - (usage.quotaUsed || 0);
      return remaining >= requiredUnits;
    } catch (error) {
      console.error('Error checking quota:', error);
      // Default to allowing the request if we can't check
      return true;
    }
  }

  async getQuotaStatus() {
    try {
      const usage = await getQuotaUsage();
      return {
        used: usage.quotaUsed || 0,
        limit: this.dailyLimit,
        remaining: this.dailyLimit - (usage.quotaUsed || 0),
        percentage: ((usage.quotaUsed || 0) / this.dailyLimit) * 100,
      };
    } catch (error) {
      console.error('Error getting quota status:', error);
      return {
        used: 0,
        limit: this.dailyLimit,
        remaining: this.dailyLimit,
        percentage: 0,
      };
    }
  }

  async incrementQuota(units: number): Promise<void> {
    try {
      await dbIncrementQuota(units);
    } catch (error) {
      console.error('Error incrementing quota:', error);
      throw error;
    }
  }

  async canFetchChannel(): Promise<boolean> {
    return await this.checkQuota(QUOTA_COSTS.channelsList);
  }

  async canSearch(): Promise<boolean> {
    return await this.checkQuota(QUOTA_COSTS.search);
  }

  async canFetchComments(): Promise<boolean> {
    return await this.checkQuota(QUOTA_COSTS.commentThreadsList);
  }

  async recordChannelFetch(): Promise<void> {
    await this.incrementQuota(QUOTA_COSTS.channelsList);
  }

  async recordSearch(): Promise<void> {
    await this.incrementQuota(QUOTA_COSTS.search);
  }

  async recordCommentFetch(): Promise<void> {
    await this.incrementQuota(QUOTA_COSTS.commentThreadsList);
  }
}

// Singleton instance
let quotaManager: QuotaManager | null = null;

export function getQuotaManager(): QuotaManager {
  if (!quotaManager) {
    quotaManager = new QuotaManager();
  }
  return quotaManager;
}
