const tenants = async (tenant) => {
    return new Promise(async (resolve, reject) => {
        tenant.schema.hasTable("knexDbMigrations").then(async (exists) => {
            if (exists) {
                return resolve();
            }
            try {
                await tenant.schema.createTable("knexDbMigrations", (table) => {
                    table.string("file_name").primary();
                    table.dateTime("created_at").defaultTo(tenant.fn.now());
                    table.dateTime("updated_at").defaultTo(tenant.fn.now());
                });
                resolve("knexDbMigrations table created Successfully!");
            } catch (error) {
                console.log(error);
                reject(error);
            }
        });
    });
};
module.exports = tenants;