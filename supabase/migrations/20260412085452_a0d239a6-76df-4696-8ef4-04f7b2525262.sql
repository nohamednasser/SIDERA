ALTER TABLE public.exam_submissions 
ADD COLUMN effort_status text NOT NULL DEFAULT 'genuine',
ADD COLUMN effort_score integer DEFAULT 100,
ADD COLUMN time_per_question_avg real DEFAULT 0,
ADD COLUMN answer_pattern_flag boolean DEFAULT false;