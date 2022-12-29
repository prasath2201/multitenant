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
                        await tenant.raw(`CREATE FUNCTION public.give_leading_zero(bigint) RETURNS character varying
                        LANGUAGE plpgsql
                        AS $_$ 
                                DECLARE _result varchar;
                                BEGIN
                                _result := '';
                                FOR n IN 1..$1 LOOP 
                                _result := concat(_result,0);
                                END LOOP;
                                RETURN _result;
                                END;
                                $_$;
                    
                    
                    ALTER FUNCTION public.give_leading_zero(bigint) OWNER TO postgres;`)
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