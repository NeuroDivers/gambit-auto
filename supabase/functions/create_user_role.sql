CREATE OR REPLACE FUNCTION create_user_role(user_id UUID, role_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id, role_name::app_role);
END;
$$;