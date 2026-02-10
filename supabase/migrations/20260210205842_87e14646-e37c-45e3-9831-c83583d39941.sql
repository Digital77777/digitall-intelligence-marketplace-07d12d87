INSERT INTO public.user_roles (user_id, role)
VALUES ('fce177b9-604d-4e7c-b904-5f18ccf1ec73', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;