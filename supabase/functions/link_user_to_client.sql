
-- This is a replacement for the existing link_user_to_client function
-- We're modifying it to create a new customer record if one doesn't exist with proper fields

CREATE OR REPLACE FUNCTION public.link_user_to_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  customer_exists BOOLEAN;
BEGIN
  -- Check if customer with this email already exists
  SELECT EXISTS (
    SELECT 1 FROM customers 
    WHERE customer_email = NEW.email
  ) INTO customer_exists;
  
  IF customer_exists THEN
    -- If customer exists, link them to the user
    UPDATE customers 
    SET user_id = NEW.id,
        profile_id = NEW.id
    WHERE customer_email = NEW.email
    AND (user_id IS NULL OR profile_id IS NULL);
  ELSE
    -- If customer doesn't exist, create a new customer record
    INSERT INTO customers (
      customer_email,
      customer_first_name,
      customer_last_name,
      user_id,
      profile_id
    ) VALUES (
      NEW.email,
      COALESCE(NEW.first_name, ''),
      COALESCE(NEW.last_name, ''),
      NEW.id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- We need to drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Recreate the trigger to run the updated function
CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.link_user_to_client();
