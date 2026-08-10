-- Consolidated entry point for all blog additions made in this update.
-- In psql, run this file directly. In Supabase SQL Editor, open and run the
-- two referenced scripts together in one query tab (the editor does not
-- support psql \i include commands):
--   admin/upsert-hf-20260810-blogs.sql
--   admin/upsert-blog-md-one-per-missing-category.sql
--
-- Both scripts are idempotent: they use INSERT ... ON CONFLICT (id) DO UPDATE.
-- Run the Hugging Face script first, followed by the category-selection script.

begin;

-- Supabase SQL Editor users: paste the contents of the two scripts listed
-- above at this point, then run the complete transaction.

commit;
