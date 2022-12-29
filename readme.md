## add enum type

<!-- raw query -->
CREATE TYPE public.status AS ENUM (
                'enum1',
                'enum2'
   );
` ALTER TYPE public.status OWNER TO postgres;`

<!-- migration -->
  table.enu("execution_status",["Plan", "Develop", "Release", "Block"],  
  {useNative:true, enumName: "unit_execution_status" }
 )
 .defaultTo("Plan");


## alter enum type
`ALTER TYPE public.milestone_value_type ADD VALUE 'variable';`

## use already specified enum type
 `table.specificType("value_type" , "public.milestone_value_type")`

## rename table name
 `table.renameTable("value_type" , "public.milestone_value_type")`


 ## add prefix sequence
 <!-- raw -->
 `property_no character varying(255) DEFAULT public.add_prefix('property'::character varying, nextval('public.property_seq'::regclass)),`