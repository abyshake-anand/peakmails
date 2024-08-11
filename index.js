const axios = require('axios');
const crypto = require('crypto');
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
    constructor({ apiKey, domain, projectId, secretKey }) {
        if (!apiKey || typeof apiKey !== 'string') { throw new Error('Invalid API key'); }
        if (!domain || typeof domain !== 'string') { throw new Error('Invalid domain'); }
        if (!projectId || typeof projectId !== 'string') { throw new Error('Invalid project ID'); }
        this.apiKey = apiKey;
        this.domain = domain;
        this.projectId = projectId;
        this.baseUrl = 'https://peakmails.com/api/v1';
        this.secretKey = secretKey;
    }

    getOrigin() {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.origin;
        }
        return null;
    }

    generateCSRFToken(origin) {
        return crypto.createHash('sha256').update(`${this.apiKey}${origin}`).digest('hex');
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
        let origin = null;
        if (this.secretKey) {
            origin = 'backend-implementation';
        } else {
            origin = this.getOrigin();
        }
        if (!origin) {
            throw new Error('Origin not found');
        }

        const csrfToken = this.generateCSRFToken(origin);

        try {
            const response = await axios({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-Peakmails-Domain': this.domain,
                    'X-Peakmails-Project': this.projectId,
                    'X-Peakmails-Origin': origin,
                    'X-Peakmails-CSRF-Token': csrfToken,
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
        return this.request('POST', '/add-contact', contactData);
    }

    /**
     * @method addContactToCategories
     * @description Add a contact to one or more categories
     * @param {string} email - The email address of the contact
     * @param {string[]} categories - An array of category IDs
     * @returns {Promise<Object>} The updated contact object
     */
    async addContactToCategories({ email, categories }) {
        if (!email || typeof email !== 'string') {
            throw new Error('Invalid email address');
        }
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('Invalid category IDs');
        }
        return this.request('POST', `/add-contact-to-category`, { email, categories });
    }

    /**
     * @method triggerScenario
     * @description Trigger a scenario for a specific contact
     * @param {string} scenario - The ID of the scenario to trigger
     * @param {string} email - The email address of the contact
     * @returns {Promise<Object>} The result of the scenario trigger
     */
    async triggerScenario({ scenario, email }) {
        if (!scenario || typeof scenario !== 'string') {
            throw new Error('Invalid scenario ID');
        }
        if (!email || typeof email !== 'string') {
            throw new Error('Invalid email address');
        }
        return this.request('POST', `/trigger-scenario`, { scenario, email });
    }

    /**
     * @method getScenarioCustomFields
     * @description Get the custom fields for a particular scenario
     * @param {string} scenario - The ID of the scenario
     * @returns {Promise<Object>} The custom fields for the scenario
     */
    async getScenarioCustomFields({ scenario }) {
        if (!scenario || typeof scenario !== 'string') {
            throw new Error('Invalid scenario ID');
        }
        return this.request('GET', `/get-scenario-custom-fields?scenario=${scenario}`);
    }
}

module.exports = PeakmailsSDK;