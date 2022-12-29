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
                        await tenant.raw(
                            `CREATE TYPE public.payment_terms AS ENUM (
                            'Net 7',
                            'Net 30',
                            'Net 45',
                            'Net 60',
                            'Net 90',
                            'User Defined',
                            'Immediate'
                        )
                        `)
                        await tenant.raw(
                            `CREATE FUNCTION public.add_prefix(character varying, bigint) RETURNS character varying
                            LANGUAGE plpgsql
                            AS $_$
                                                 DECLARE _result text;
                                                _date_format text;
                                                _prefix text;
                                                _seed_value int;
                                                _date varchar;
                                                BEGIN
                                                
                                                SELECT
                                                  INTO _date_format,
                                                  _prefix,
                                                  _seed_value date_format,
                                                  prefix,
                                                  seed_value
                                                FROM
                                                  sequence_config
                                                WHERE
                                                  table_name = $1;
                                                if _prefix is null THEN
                                                _prefix = $1;
                                                end if;
                                                if _seed_value is null THEN
                                                _seed_value = 3;
                                                end if;
                                                IF $2 < 10 THEN IF _date_format IS NULL THEN _result := CONCAT(_prefix, '-', give_leading_zero(_seed_value), $2);
                                                ELSE _result := CONCAT(
                                                  _prefix,
                                                  to_char(CURRENT_DATE, _date_format:: varchar),
                                                  '-',
                                                  give_leading_zero(_seed_value),
                                                  $2
                                                );
                                                END IF;
                                                ELSEIF $2 < 100 THEN IF _date_format IS NULL THEN _result := CONCAT(_prefix, '-', give_leading_zero(_seed_value -1), $2);
                                                ELSE _result := CONCAT(
                                                  _prefix,
                                                  to_char(CURRENT_DATE, _date_format:: varchar),
                                                  '-',
                                                  give_leading_zero(_seed_value -1),
                                                  $2
                                                );
                                                END IF;
                                                ELSE _result := CONCAT(
                                                  _prefix,
                                                  to_char(CURRENT_DATE, _date_format:: varchar),
                                                  '-',
                                                  $2
                                                );
                                                END IF;
                                                RETURN _result;
                                                END;
                                                
                                    $_$;
                        
                        
                        ALTER FUNCTION public.add_prefix(character varying, bigint) OWNER TO postgres;
                            `)
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