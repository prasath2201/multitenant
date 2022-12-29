import knex from "knex";
import { tenantDBMigration } from '../../../../db/migrations/index'
import pgtools from 'pgtools'
import knexFile from '../../../../db/index'
import { connectAllDB , seeders } from '../../../../db/dbConnection'

let { DB_USERNAME, DB_PORT, TENANT_DB_PASSWORD , TENANT_DB_HOST } = process.env;

const createTenant = ({
    db_name,
    db_host,
    db_port,
    db_username,
    db_password,
    commonDB
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            await pgtools.createdb(
                {
                    user: db_username,
                    password: db_password,
                    port: db_port,
                    host: db_host,
                },
                db_name,
                (err, res) => {
                    if (err) {
                        console.error(err);
                        return reject({ type: "Error", code: 406, message: err.message });
                    }
                }
            );

            let slug = require("crypto")
                .randomBytes(Math.ceil(16))
                .toString("hex")
                .slice(0, 16)
                .toUpperCase();

            await commonDB("tenants")
                .insert(
                    {
                        // slug,
                        db_name,
                        db_host: db_host,
                        db_port: db_port,
                        db_username,
                        db_password,
                    },
                    ["*"]
                )
                .then(async (result) => {
                    // Invoking Migrations
                    try {
                        const tenantConfiguration = createConnectionConfig(result[0])
                        await tenantDBMigration({
                            tenantDB:knex(tenantConfiguration)
                        });
                        await seeders({
                            tenantDB:knex(tenantConfiguration)
                        });
                        connectAllDB();
                        resolve({ tenantDB: knex(tenantConfiguration), id: result[0]?.id });
                    } catch (error) {
                        console.log(error);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    reject({ type: "Error", message: err.message });
                });
        } catch (error) {
            console.log(error);
            reject({ type: "Error", message: error.message });
        }
    });
};

// create configuration object for the given tenant.
const createConnectionConfig = (tenant) => {
    return {
        client: "postgresql",
        // debug: true,
        connection: {
            host: tenant.db_host,
            port: tenant.db_port,
            database: tenant.db_name,
            user: tenant.db_username,
            password: tenant.db_password,
        },
        pool: { min: 0, max: 20, idleTimeoutMillis: 300000 },
    };
};


export const tenantOnboarding = ({
    name,
    commonDB
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            await createTenant({
                db_host: TENANT_DB_HOST,
                db_port: DB_PORT,
                db_name: name,
                db_username: DB_USERNAME,
                db_password: TENANT_DB_PASSWORD,
                commonDB
            })
            resolve('client Onboarding Successfully')

        } catch (error) {
            console.log(error);
            reject({ type: "Error", message: error.message });
        }
    });
};