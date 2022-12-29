import fs from "fs";
import path from "path";

// tenantDBMigrations
export const tenantDBMigration = ({
    tenantDB
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            // get files
            let files = await fs
                .readdirSync(__dirname + "/tenant")
                .filter((file) => {
                    return (
                        file.indexOf(".") !== 0 &&
                        file !== "index.js" &&
                        file.slice(-3) === ".js"
                    );
                });

            // check migration file
            for (let i = 0; i < files.length; i++) {
                const model = await require(path.join(
                    __dirname + "/tenant/",
                    files[i]
                ));
                let status = await model(tenantDB);
                console.log(status === undefined ? "already updated" : status);
            }
            resolve();
        }
        catch (err) {
            console.log(err);
            reject();
        }
    })
}

// check runned migrationfiles
export const checkmigrationStatus = ({
    tenantDB
}) => {
    return new Promise(async (resolve, _) => {
        const files = await fs.readdirSync(__dirname + "/tenant");
        let lastFile = files[files.length - 1];

        tenantDB
            .table("knexDbMigrations")
            .where("file_name", lastFile)
            .then((result) => {
                if (result?.length) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch((err) => {
                // console.log(err);
                resolve(false);
            });
    });
}