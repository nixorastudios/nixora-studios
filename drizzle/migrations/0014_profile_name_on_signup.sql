CREATE OR REPLACE FUNCTION public.create_profile_on_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, left(trim(coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')), 120))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_on_signup();
INSERT INTO public.profiles (id, display_name)
SELECT id, left(trim(coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', '')), 120) FROM auth.users
ON CONFLICT (id) DO NOTHING;