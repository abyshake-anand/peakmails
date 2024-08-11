declare module 'peakmails-sdk' {
    export interface PeakmailsSDKOptions {
        apiKey: string;
        domain: string;
        projectId: string;
        secretKey?: string;
    }

    export interface ContactData {
        email: string;
        name?: string;
        customFields?: Record<string, any>;
    }

    export interface CategoryAssignment {
        email: string;
        categories: string[];
    }

    export interface ScenarioTrigger {
        scenario: string;
        email: string;
    }

    export interface ScenarioCustomFieldsRequest {
        scenario: string;
    }

    export class PeakmailsSDK {
        constructor(options: PeakmailsSDKOptions);

        addContact(contactData: ContactData): Promise<any>;
        addContactToCategories(assignment: CategoryAssignment): Promise<any>;
        triggerScenario(trigger: ScenarioTrigger): Promise<any>;
        getScenarioCustomFields(request: ScenarioCustomFieldsRequest): Promise<any>;
    }

    export default PeakmailsSDK;
}