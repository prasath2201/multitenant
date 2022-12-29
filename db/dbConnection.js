// create local storage
import fs from "fs";
import path from "path";
import { getNamespace } from "continuation-local-storage";
import knex from "knex";
import knexfile from './index'


// commonDB
const commonDB = knex(knexfile.staging)

// initial variable
let connections = [];

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

// create knex object
export const connectAllDB = () => {
    let tenants = [];
    return new Promise(async (resolve, reject) => {
        try {
            tenants = await commonDB.select(
                "id",
                "db_host",
                "db_name",
                "db_port",
                "db_username",
                "db_password"
            )
                .from("tenants");

            if (tenants) {
                console.log("Connection has been established successfully");
                console.log("Total No of Tenants:", tenants.length);
            }
            else {
                return console.log("Could not retrieve tenants information");
            }
            connections = tenants.map((t) => {
                const tenantConfiguration = createConnectionConfig(t)
                return {
                    [t.id]: knex(tenantConfiguration)
                }
            }).reduce((prev, next) => {
                return Object.assign({}, prev, next);
            }, {});
        }
        catch (err) {
            console.log("Error while connecting to database : ", err);
            reject(err)
        }
    })

}

// Get the connection information (knex instance) for the given tenant's id.
export const getConnectionByID = (id) => {
    if (connections) {
        return connections[id];
    }
};

// get tenant information
export const getConnection = () => {
    try {
        const nameSpace = getNamespace(process.env.APP_NAME);
        const tenantDB = nameSpace.get("tenantDB");

        if (!tenantDB) {
            console.log("Connection is not set for any tenant database.");
            return;
        }

        return tenantDB;
    } catch (err) {
        console.log(err);
    }
};

// get common connection
export const getCommonConnection = () => {
    if (commonDB) {
        return commonDB;
    }
    throw new Error("Common connection not initialized");
};

// add tenant
export const addTenant = (config, tenantId) => {
    return new Promise((resolve, reject) => {
        try {
            const db = knex(config);

            connections[tenantId] = db;

            console.log("Connection updated");

            resolve();
        } catch (error) {
            return reject(error);
        }
    });
};

// seeder
export const seeders = ({
    tenantDB
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            // get seed files
            let files = await fs
                .readdirSync(__dirname + "/seeders")
                .filter((file) => {
                    return (
                        file.indexOf(".") !== 0 &&
                        file !== "index.js" &&
                        file.slice(-5) === ".json"
                    );
                });
            for (let i = 0; i < files.length; i++) {
                let seederData = await require(path.join(
                    __dirname + "/seeders/",
                    files[i]
                ));
                for (let j = 0; j < seederData.length; j++) {
                    await tenantDB
                        .table(seederData[j]?.tableName)
                        .insert(seederData[j]?.data);
                 
                    if (seederData[j]?.reSync) {
                        await tenantDB.raw(
                            `SELECT setval('"${seederData[j]?.sequence}"', (SELECT MAX(id) FROM "${seederData[j]?.tableName}")+1);`
                        );
                    }
                    console.log(`${seederData[j]?.tableName} Seeder Run Succesfully`);
                }
            }
            resolve();
        }
        catch (err) {
            reject(err)
        }
    })

}