import httpInstance from '../../shared/http.instance.js';
import { Plan } from '../models/plan.entity.js';

/**
 * @class subscriptionService
 * @description Service module for subscription and plan management
 */
export class subscriptionService  {
    /**
     * Fetches plans based on user type (user or provider) and returns Plan instances
     * @param {string} userType - The type of user ('user' or 'provider')
     * @returns {Promise<Array<Plan>>} Array of Plan objects
     */
    async getPlans(userType) {
        const endpoint = userType === 'provider' ? 'providerPlans' : 'plans';
        const response = await httpInstance.get(`/${endpoint}`);
        return response.data.map(plan => new Plan(plan));
    }

    /**
     * Fetches the current plan ID for a given user
     * @param {string|number} userId - The ID of the user
     * @param {string} userType - The type of user ('user' or 'provider')
     * @returns {Promise<string|number>} The current plan ID
     */
    async getUserPlan(userId, userType) {
        const endpoint = userType === 'provider' ? 'companies' : 'users';
        const response = await httpInstance.get(`/${endpoint}/${userId}`);
        return userType === 'provider' ? response.data.planId : response.data.planId;
    }

    /**
     * Updates the plan ID for a given user
     * @param {string|number} userId - The ID of the user
     * @param {string|number} planId - The new plan ID
     * @param {string} userType - The type of user ('user' or 'provider')
     * @returns {Promise<Object>} The updated user data
     */
    async updateUserPlan(userId, planId, userType) {
        const endpoint = userType === 'provider' ? 'companies' : 'users';
        const response = await httpInstance.patch(`/${endpoint}/${userId}`, { planId });
        return response.data;
    }
}