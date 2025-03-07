
-- This is a replacement for the existing link_user_to_client function
-- We're modifying it to link to customers table instead of the non-existent clients table

CREATE OR REPLACE FUNCTION public.link_user_to_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Try to find and link existing customer by email
  UPDATE customers 
  SET user_id = NEW.id
  WHERE customer_email = NEW.email
  AND user_id IS NULL;
  
  RETURN NEW;
END;
$function$;

-- We need to drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Recreate the trigger to run the updated function
CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.link_user_to_client();
