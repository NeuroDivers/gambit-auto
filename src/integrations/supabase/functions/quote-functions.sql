
CREATE OR REPLACE FUNCTION public.generate_quote_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    year TEXT;
    next_number INTEGER;
BEGIN
    year := to_char(current_date, 'YYYY');
    
    SELECT COALESCE(MAX(NULLIF(regexp_replace(quote_number, '^EST-\d{4}-', ''), '')), '0')::integer + 1
    INTO next_number
    FROM quotes
    WHERE quote_number LIKE 'EST-' || year || '-%';
    
    RETURN 'EST-' || year || '-' || LPAD(next_number::text, 4, '0');
END;
$function$;
