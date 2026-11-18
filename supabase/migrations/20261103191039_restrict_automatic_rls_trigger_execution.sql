-- El disparador DDL sigue invocando esta función internamente.
-- Evitar que clientes de la Data API puedan invocarla como RPC.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
