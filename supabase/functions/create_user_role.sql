
CREATE OR REPLACE FUNCTION create_user_role(user_id UUID, role_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET role_id = (SELECT id FROM roles WHERE name = role_name)
  WHERE id = user_id;
END;
$$;
