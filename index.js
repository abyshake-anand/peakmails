const axios = require('axios');
/**
 * @class PeakmailsSDK
 * @description SDK for interacting with the Peakmails API
 */
class PeakmailsSDK {
    /**
     * @constructor
     * @param {string} apiKey - The API key for authentication
     * @param {string} domain - The domain associated with the Peakmails account
     */
    constructor({ apiKey, domain }) {
        if (!apiKey || typeof apiKey !== 'string') { throw new Error('Invalid API key'); }
        if (!domain || typeof domain !== 'string') { throw new Error('Invalid domain'); }
        this.apiKey = apiKey; this.domain = domain;
        this.baseUrl = 'https://api.peakmails.com/v1'; // Replace with your actual API base URL
    }

    /**
     * @private
     * @method request
     * @description Make an HTTP request to the Peakmails API
     * @param {string} method - The HTTP method (GET, POST, etc.)
     * @param {string} endpoint - The API endpoint
     * @param {Object} [data] - The request payload (for POST, PUT, etc.)
     * @returns {Promise<Object>} The API response
     * @throws {Error} If the API request fails
     */
    async request(method, endpoint, data = {}) {
        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-Peakmails-Domain': this.domain
                },
                data,
            });
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`Peakmails API Error: ${error.response.status} - ${error.response.data.message}`);
            } else if (error.request) {
                throw new Error('Peakmails API Error: No response received from the server');
            } else {
                throw new Error(`Peakmails SDK Error: ${error.message}`);
            }
        }
    }

    /**
     * @method addContact
     * @description Add a new contact to Peakmails
     * @param {Object} contactData - The contact data
     * @param {string} contactData.email - The contact's email address
     * @param {string} [contactData.name] - The contact's name
     * @param {Object} [contactData.customFields] - Any custom fields for the contact
     * @returns {Promise<Object>} The created contact object
     */
    async addContact(contactData) {
        if (!contactData.email || typeof contactData.email !== 'string') {
            throw new Error('Invalid email address');
        }
        return this.request('POST', '/contacts', contactData);
    }

    /**
     * @method addContactToCategories
     * @description Add a contact to one or more categories
     * @param {string} contactId - The ID of the contact
     * @param {string[]} categoryIds - An array of category IDs
     * @returns {Promise<Object>} The updated contact object
     */
    async addContactToCategories(contactId, categoryIds) {
        if (!contactId || typeof contactId !== 'string') {
            throw new Error('Invalid contact ID');
        }
        if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
            throw new Error('Invalid category IDs');
        }
        return this.request('POST', `/contacts/${contactId}/categories`, { categoryIds });
    }

    /**
     * @method triggerScenario
     * @description Trigger a scenario for a specific contact
     * @param {string} scenarioId - The ID of the scenario to trigger
     * @param {string} contactId - The ID of the contact
     * @returns {Promise<Object>} The result of the scenario trigger
     */
    async triggerScenario(scenarioId, contactId) {
        if (!scenarioId || typeof scenarioId !== 'string') {
            throw new Error('Invalid scenario ID');
        }
        if (!contactId || typeof contactId !== 'string') {
            throw new Error('Invalid contact ID');
        }
        return this.request('POST', `/scenarios/${scenarioId}/trigger`, { contactId });
    }

    /**
     * @method getScenarios
     * @description Get a list of all scenarios
     * @param {Object} [options] - Optional parameters
     * @param {number} [options.page] - Page number for pagination
     * @param {number} [options.limit] - Number of items per page
     * @returns {Promise<Object>} The list of scenarios
     */
    async getScenarios(options = {}) {
        const queryParams = new URLSearchParams(options).toString();
        return this.request('GET', `/scenarios${queryParams ? `?${queryParams}` : ''}`);
    }

    /**
     * @method getScenarioCustomFields
     * @description Get the custom fields for a particular scenario
     * @param {string} scenarioId - The ID of the scenario
     * @returns {Promise<Object>} The custom fields for the scenario
     */
    async getScenarioCustomFields(scenarioId) {
        if (!scenarioId || typeof scenarioId !== 'string') {
            throw new Error('Invalid scenario ID');
        }
        return this.request('GET', `/scenarios/${scenarioId}/custom-fields`);
    }

    /**
     * @method getCategories
     * @description Get a list of all categories
     * @param {Object} [options] - Optional parameters
     * @param {number} [options.page] - Page number for pagination
     * @param {number} [options.limit] - Number of items per page
     * @returns {Promise<Object>} The list of categories
     */
    async getCategories(options = {}) {
        const queryParams = new URLSearchParams(options).toString();
        return this.request('GET', `/categories${queryParams ? `?${queryParams}` : ''}`);
    }

    /**
     * @method getContactDetails
     * @description Get details of a specific contact
     * @param {string} contactId - The ID of the contact
     * @returns {Promise<Object>} The contact details
     */
    async getContactDetails(contactId) {
        if (!contactId || typeof contactId !== 'string') {
            throw new Error('Invalid contact ID');
        }
        return this.request('GET', `/contacts/${contactId}`);
    }
}

module.exports = PeakmailsSDK;