with data_structure as (
  select 
    'Data Structure' as section,
    'Table' as object_type,
    table_name as object_name,
    'Columns: ' || string_agg(column_name || ' (' || data_type || 
      case when is_nullable = 'NO' then ', NOT NULL' else '' end ||
      case when is_primary then ', PRIMARY KEY' else '' end || ')', ', ') as details
  from (
    select 
      c.table_name,
      c.column_name,
      c.data_type,
      c.is_nullable,
      exists (
        select 1
        from information_schema.key_column_usage kcu
        join information_schema.table_constraints tc
          on kcu.constraint_name = tc.constraint_name
          and kcu.table_name = tc.table_name
          and kcu.table_schema = tc.table_schema
        where tc.constraint_type = 'PRIMARY KEY'
          and kcu.column_name = c.column_name
          and kcu.table_name = c.table_name
          and kcu.table_schema = c.table_schema
      ) as is_primary
    from information_schema.columns c
    where c.table_schema = 'public'
  ) as cols
  group by table_name
),

relationships as (
  select 
    'Relationships' as section,
    'Foreign Key' as object_type,
    tc.constraint_name as object_name,
    'Table: ' || tc.table_name || ', Columns: ' || 
    string_agg(kcu.column_name, ', ') || 
    ' → ' || ccu.table_name || '.' || string_agg(ccu.column_name, ', ') as details
  from 
    information_schema.table_constraints as tc 
    join information_schema.key_column_usage as kcu
      on tc.constraint_name = kcu.constraint_name
      and tc.table_schema = kcu.constraint_schema
    join information_schema.constraint_column_usage as ccu
      on ccu.constraint_name = tc.constraint_name
      and ccu.table_schema = tc.constraint_schema
  where 
    tc.constraint_type = 'FOREIGN KEY' 
    and tc.table_schema = 'public'
  group by tc.constraint_name, tc.table_name, ccu.table_name
),

indexes as (
  select 
    'Indexes' as section,
    'Index' as object_type,
    indexname as object_name,
    'Table: ' || tablename || ', Definition: ' || indexdef as details
  from 
    pg_indexes
  where 
    schemaname = 'public'
    and indexname not like '%_pkey'
),

policies as (
  select 
    'Policies' as section,
    'Policy' as object_type,
    policyname as object_name,
    'Table: ' || tablename || 
    ', Action: ' || permissive || ' ' || cmd || 
    ', Roles: ' || roles::text || 
    ', Using: ' || COALESCE(qual, 'N/A') ||
    ', Check: ' || COALESCE(with_check, 'N/A') as details
  from 
    pg_policies
  where 
    schemaname = 'public'
)

select section, object_type, object_name, details from data_structure
union all
select section, object_type, object_name, details from relationships
union all
select section, object_type, object_name, details from indexes
union all
select section, object_type, object_name, details from policies
order by section, object_type, object_name;