-- Update handle_new_user function to only set admin@admin.com as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Guest'),
    CASE
      WHEN NEW.email = 'admin@admin.com' THEN 'admin'::public.app_role
      ELSE 'guest'::public.app_role
    END
  );
  RETURN NEW;
END;
$function$;