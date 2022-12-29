const path = require('path');
const tenants = async (tenant) => {
    return new Promise(async (resolve, reject) => {
        try {
            tenant
                .withSchema('public')
                .table('knexDbMigrations')
                .where({
                    file_name: path.basename(__filename),
                })
                .then(async (result) => {
                    if (result.length === 0) {
                        await tenant.schema
                            .withSchema('public')
                            .createTable(`sequence_config`, (table) => {
                                table.integer('id');
                                table.string('table_name');
                                table.string('slug');
                                table.string('date_format');
                                table.integer('starts_with');
                                table.string('prefix');
                                table.string('preference');
                                table.integer('seed_value');
                                table.uuid('client');
                                table.boolean('is_active').defaultTo(false);
                                table.dateTime('created_at').defaultTo(tenant.fn.now());
                                table.dateTime('updated_at').defaultTo(tenant.fn.now());
                            });
                        await tenant.raw(
                            `insert into public."knexDbMigrations" ("file_name") values (?)`,
                            [path.basename(__filename)]
                        );
                        console.log(path.basename(__filename), 'migrated successfully!');
                    } else {
                        console.log(path.basename(__filename), 'already exists!');
                    }
                    resolve();
                });
        } catch (error) {
            console.log(path.basename(__filename), error);
            reject(error);
        }
    });
};
module.exports = tenants;