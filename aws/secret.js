import {GetSecretValueCommand, SecretsManagerClient} from '@aws-sdk/client-secrets-manager';


export class Secret {
    #secretName;
    #region;

    constructor(secretName, region = 'eu-west-1') {
        this.#secretName = secretName;
        this.#region = region;
    }

    async get() {
        const client = new SecretsManagerClient({
            region: this.#region,
        });

        let response = {};

        try {
            response = await client.send(
                new GetSecretValueCommand({
                    SecretId: this.#secretName,
                    VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
                })
            );
        } catch (error) {
            throw error;
        }

        return JSON.parse(response.SecretString);
    }
}
