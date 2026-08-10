-- RM-005 (prep): normalizar idioma. Interno siempre en inglés: `programas` -> `programs`.
-- (La policy provisional se elimina en 0004.)

alter table public.programas rename to programs;
