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
                        await tenant.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
                        await tenant.schema
                            .withSchema('public')
                            .createTable(`user_profile`, (table) => {
                                table
                                    .uuid('id')
                                    .defaultTo(tenant.raw('uuid_generate_v4()'))
                                    .primary();
                                table.string('name')
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