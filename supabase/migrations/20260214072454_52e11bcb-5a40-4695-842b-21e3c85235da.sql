
-- 1. Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can see their own roles, admins can see all
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Add lat/lng columns to housing_listings
ALTER TABLE public.housing_listings
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;

-- 3. Assign admin roles to specified emails via a trigger on signup + direct insert for existing users
-- Create a function to auto-assign admin role for specific emails
CREATE OR REPLACE FUNCTION public.assign_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN ('dhisharjain03@gmail.com', 'ahmatabdelkerimnassour@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  -- Always assign 'user' role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_admin_on_signup();

-- Assign admin roles to existing users with those emails
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email IN ('dhisharjain03@gmail.com', 'ahmatabdelkerimnassour@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign user role to all existing users
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Create admin-only security definer function to get all users data
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'total_listings', (SELECT count(*) FROM housing_listings),
    'total_groups', (SELECT count(*) FROM community_groups),
    'total_events', (SELECT count(*) FROM events),
    'users', (
      SELECT json_agg(row_to_json(u))
      FROM (
        SELECT
          au.id,
          au.email,
          au.created_at as signup_date,
          au.last_sign_in_at as last_active,
          au.raw_user_meta_data->>'display_name' as display_name,
          (SELECT count(*) FROM housing_listings hl WHERE hl.user_id = au.id) as listings_count,
          (SELECT count(*) FROM group_members gm WHERE gm.user_id = au.id) as groups_joined,
          (SELECT count(*) FROM event_attendees ea WHERE ea.user_id = au.id) as events_interested,
          (SELECT count(*) FROM group_messages gmsg WHERE gmsg.user_id = au.id) as messages_posted
        FROM auth.users au
        ORDER BY au.created_at DESC
      ) u
    )
  ) INTO result;

  RETURN result;
END;
$$;
