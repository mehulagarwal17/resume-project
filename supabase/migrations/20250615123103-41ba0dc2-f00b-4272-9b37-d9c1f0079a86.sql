
-- Allow authenticated users to upload (insert) their resumes (WITH CHECK required for INSERT)
CREATE POLICY "Authenticated users can upload their resumes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view/download (select) their own resumes
CREATE POLICY "Authenticated users can view their resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own resumes
CREATE POLICY "Authenticated users can delete their resumes"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resumes' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- (Optional) Allow authenticated users to update metadata for resumes
CREATE POLICY "Authenticated users can update their resumes"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'resumes' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
