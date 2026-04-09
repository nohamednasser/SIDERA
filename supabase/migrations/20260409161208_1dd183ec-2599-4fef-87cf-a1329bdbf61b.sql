
-- Create lab_logs table
CREATE TABLE public.lab_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    grade TEXT NOT NULL DEFAULT 'G10',
    hypothesis TEXT DEFAULT '',
    procedure_text TEXT DEFAULT '',
    conclusion TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_log_data_points table
CREATE TABLE public.lab_log_data_points (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    log_id UUID NOT NULL REFERENCES public.lab_logs(id) ON DELETE CASCADE,
    data_set TEXT NOT NULL DEFAULT 'Set 1',
    x_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    y_value DOUBLE PRECISION NOT NULL DEFAULT 0,
    x_label TEXT DEFAULT 'X',
    y_label TEXT DEFAULT 'Y',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_log_data_points ENABLE ROW LEVEL SECURITY;

-- Lab logs policies
CREATE POLICY "Students can view own lab logs"
ON public.lab_logs FOR SELECT
TO authenticated
USING (student_email = (auth.jwt() ->> 'email') OR is_admin(auth.uid()));

CREATE POLICY "Students can insert own lab logs"
ON public.lab_logs FOR INSERT
TO authenticated
WITH CHECK (student_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Students can update own lab logs"
ON public.lab_logs FOR UPDATE
TO authenticated
USING (student_email = (auth.jwt() ->> 'email'))
WITH CHECK (student_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Students can delete own lab logs"
ON public.lab_logs FOR DELETE
TO authenticated
USING (student_email = (auth.jwt() ->> 'email'));

CREATE POLICY "Admins can delete any lab logs"
ON public.lab_logs FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Data points policies
CREATE POLICY "Students can view own data points"
ON public.lab_log_data_points FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.lab_logs l
    WHERE l.id = lab_log_data_points.log_id
    AND (l.student_email = (auth.jwt() ->> 'email') OR is_admin(auth.uid()))
));

CREATE POLICY "Students can insert own data points"
ON public.lab_log_data_points FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.lab_logs l
    WHERE l.id = lab_log_data_points.log_id
    AND l.student_email = (auth.jwt() ->> 'email')
));

CREATE POLICY "Students can update own data points"
ON public.lab_log_data_points FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.lab_logs l
    WHERE l.id = lab_log_data_points.log_id
    AND l.student_email = (auth.jwt() ->> 'email')
));

CREATE POLICY "Students can delete own data points"
ON public.lab_log_data_points FOR DELETE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.lab_logs l
    WHERE l.id = lab_log_data_points.log_id
    AND l.student_email = (auth.jwt() ->> 'email')
));
