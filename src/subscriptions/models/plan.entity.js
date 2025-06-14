
export class Plan {
    /**
     * @class Plan
     * @description Represents a subscription plan with various attributes.
     * @param {Object} options - The plan initialization parameters.
     * @param {string} [options.id=''] - Unique identifier for the plan.
     * @param {string} [options.name=''] - Name of the plan.
     * @param {number} [options.price=''] - Price of the plan.
     * @param {string} [options.billingCycle=''] - Billing cycle (e.g., monthly).
     * @param {number} [options.maxEquipment=0] - Maximum number of equipment units (for users).
     * @param {number|null} [options.maxClients=null] - Maximum number of client users (for companies), null for unlimited.
     * @param {Array<string>} [options.features=[]] - List of features included in the plan.
     *
     *
     */
    constructor({
        id = '',
        name = '',
        description = '',
        price = 0,
        billingCycle = '',
        maxEquipment = 0,
        maxClients = null,
        features = []

    })
    {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = typeof price === 'string' ? parseFloat(price) || 0 : (price || 0);
        this.billingCycle = billingCycle;
        this.maxEquipment = typeof maxEquipment === 'string' ? parseInt(maxEquipment, 10) || 0 : (maxEquipment || 0);
        this.maxClients = typeof maxClients === 'string' ? parseInt(maxClients, 10) || 0 : (maxClients || 0);
        this.features = features; // Array of feature strings
    }

}