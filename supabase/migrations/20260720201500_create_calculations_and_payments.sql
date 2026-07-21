-- MiniApps Emprende: persistencia para Informe Profesional (Webpay).
-- Crea calculations (snapshot del cálculo) y payments (intento/estado de pago).
-- Sin APIs ni integración Webpay en este sprint.

-- =============================================================================
-- Tabla calculations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.calculations (
  id uuid PRIMARY KEY,
  data jsonb NOT NULL,
  report_version text NOT NULL DEFAULT 'v1',
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.calculations IS
  'Snapshot del cálculo usado para generar el Informe Profesional.';
COMMENT ON COLUMN public.calculations.id IS
  'Identificador único del cálculo.';
COMMENT ON COLUMN public.calculations.data IS
  'Payload JSON del cálculo (entradas y resultados).';
COMMENT ON COLUMN public.calculations.report_version IS
  'Versión del formato de informe asociado al cálculo.';
COMMENT ON COLUMN public.calculations.created_at IS
  'Fecha y hora de creación del registro.';

-- =============================================================================
-- Tabla payments
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY,
  calculation_id uuid NOT NULL,
  buy_order text UNIQUE NOT NULL,
  session_id text NOT NULL,
  token text,
  amount numeric NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  CONSTRAINT payments_status_check CHECK (
    status IN (
      'pending',
      'paid',
      'failed'
    )
  ),
  CONSTRAINT payments_calculation_id_fkey
    FOREIGN KEY (calculation_id)
    REFERENCES public.calculations (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS payments_status_idx
  ON public.payments (status);

CREATE INDEX IF NOT EXISTS payments_buy_order_idx
  ON public.payments (buy_order);

CREATE INDEX IF NOT EXISTS payments_calculation_id_idx
  ON public.payments (calculation_id);

COMMENT ON TABLE public.payments IS
  'Intentos y estados de pago Webpay asociados a un cálculo.';
COMMENT ON COLUMN public.payments.id IS
  'Identificador único del pago.';
COMMENT ON COLUMN public.payments.calculation_id IS
  'Cálculo asociado al pago (public.calculations.id).';
COMMENT ON COLUMN public.payments.buy_order IS
  'Orden de compra única enviada a Webpay.';
COMMENT ON COLUMN public.payments.session_id IS
  'Identificador de sesión del flujo de pago.';
COMMENT ON COLUMN public.payments.token IS
  'Token de transacción Webpay (nullable hasta iniciarse).';
COMMENT ON COLUMN public.payments.amount IS
  'Monto cobrado en la transacción.';
COMMENT ON COLUMN public.payments.status IS
  'Estado del pago: pending | paid | failed.';
COMMENT ON COLUMN public.payments.created_at IS
  'Fecha y hora de creación del registro.';
COMMENT ON COLUMN public.payments.paid_at IS
  'Fecha y hora de confirmación del pago (si aplica).';
