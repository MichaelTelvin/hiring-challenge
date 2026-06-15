const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { processCompany } = require('./scoring');


class ContactFinder {

    constructor() { }

    loadCompanies(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', row => results.push(row))
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    }

    loadMockResponses(filePath) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    }

    async findContacts() {
        const companiesPath = path.join(__dirname, '../challenge/data/companies.csv');
        const mocksPath = path.join(__dirname, '../challenge/mocks/enrichment_responses.json');

        const companies = await this.loadCompanies(companiesPath);
        const mockResponses = this.loadMockResponses(mocksPath);

        return companies.map(company => {
            const providerData = mockResponses[company.company_name];
            return processCompany(company, providerData);
        });
    }

    writeResultsToFile(results, outputPath) {
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(
            outputPath,
            JSON.stringify(results, null, 2)
        );
    }

    async run() {
        const results = await this.findContacts();
        const outputPath = path.join(__dirname, 'output/results.json');
        this.writeResultsToFile(results, outputPath);
    }
}

const finder = new ContactFinder();
finder.run().catch(err => {
    console.error(err);
});
