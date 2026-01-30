-- Allow authenticated users to create/update THEIR own subscription row.
-- NOTE: This enables "demo" plan activation from the client. If you later integrate payments,
-- you should restrict this and activate plans via server-side webhooks/admin only.

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscriptions;
CREATE POLICY "Users can create their own subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

