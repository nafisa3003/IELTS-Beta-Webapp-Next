-- Allow admins to upload audio files into the listening-audio bucket
create policy "admin uploads listening audio"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listening-audio'
  and public.current_app_role() = 'admin'
);

-- Allow admins to update/replace existing audio files
create policy "admin updates listening audio"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'listening-audio'
  and public.current_app_role() = 'admin'
);

-- Allow admins to delete audio files
create policy "admin deletes listening audio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listening-audio'
  and public.current_app_role() = 'admin'
);

-- Public read (needed for the <audio> tag to actually play the file for students)
create policy "anyone reads listening audio"
on storage.objects
for select
to public
using (bucket_id = 'listening-audio');
