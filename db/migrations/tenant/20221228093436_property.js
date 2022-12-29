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
                            `CREATE SEQUENCE public.property_seq
                            START WITH 1
                            INCREMENT BY 1
                            NO MINVALUE
                            NO MAXVALUE
                            CACHE 1;
                        
                        
                            ALTER TABLE public.property_seq OWNER TO postgres;`
                        )
                        await tenant.schema
                            .withSchema('public')
                            .createTable(`property`, (table) => {
                                table
                                    .uuid('id')
                                    .defaultTo(tenant.raw('uuid_generate_v4()'))
                                    .primary();
                                table.string('name')
                                table
                                    .string("property_no")
                                    .unique()
                                    .defaultTo(
                                        tenant.raw(
                                            `public.add_prefix('property'::character varying,nextval('property_seq'::regclass))`
                                        )
                                    );
                                table.boolean('is_active').defaultTo(false);
                                table.dateTime('created_at').defaultTo(tenant.fn.now());
                                table.dateTime('updated_at').defaultTo(tenant.fn.now());
                            });
                        await tenant.raw(`
                            CREATE SEQUENCE public.sequence_config_id_seq
                AS integer
                START WITH 1
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1;
            
            
            ALTER TABLE public.sequence_config_id_seq OWNER TO postgres;
            
            
            ALTER SEQUENCE public.sequence_config_id_seq OWNED BY public.sequence_config.id;
            
            ALTER TABLE ONLY public.sequence_config ALTER COLUMN id SET DEFAULT nextval('public.sequence_config_id_seq'::regclass);
            
            --
            -- TOC entry 6854 (class 2606 OID 531931)
            -- Name: sequence_config sequence_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
            --
            
            ALTER TABLE ONLY public.sequence_config
                ADD CONSTRAINT sequence_config_pkey PRIMARY KEY (id);
            
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