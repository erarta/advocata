-- =============================================================================
-- Supabase Storage Setup: Message Attachments Bucket
-- =============================================================================
-- This script sets up the storage bucket for message attachments
-- Run this in Supabase SQL Editor after running migrations
-- =============================================================================

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  false,  -- Private bucket (requires authentication)
  52428800,  -- 50 MB max file size
  ARRAY[
    -- Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',

    -- Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',

    -- Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',

    -- Audio
    'audio/mpeg',
    'audio/mp4',
    'audio/ogg',
    'audio/wav',
    'audio/webm',

    -- Video
    'video/mp4',
    'video/mpeg',
    'video/ogg',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================================================
-- Storage Policies for message-attachments bucket
-- =============================================================================

-- Policy 1: Users can view attachments in their consultations
CREATE POLICY "Users can view message attachments in their consultations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-attachments'
  AND (
    -- Check if user is part of the consultation
    EXISTS (
      SELECT 1
      FROM message_attachments ma
      JOIN messages m ON m.id = ma."messageId"
      JOIN consultations c ON c.id = m."consultationId"
      WHERE ma."fileUrl" = storage.objects.name
      AND (c."clientId" = auth.uid() OR c."lawyerId" = auth.uid())
    )
  )
);

-- Policy 2: Users can upload attachments in their consultations
CREATE POLICY "Users can upload message attachments in their consultations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-attachments'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Users can delete their own attachments
CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-attachments'
  AND (
    EXISTS (
      SELECT 1
      FROM message_attachments ma
      JOIN messages m ON m.id = ma."messageId"
      WHERE ma."fileUrl" = storage.objects.name
      AND m."senderId" = auth.uid()
    )
  )
);

-- =============================================================================
-- Helper Function: Generate secure file path
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_attachment_path(
  p_consultation_id UUID,
  p_user_id UUID,
  p_file_name TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_extension TEXT;
  v_timestamp TEXT;
  v_random TEXT;
  v_path TEXT;
BEGIN
  -- Extract file extension
  v_extension := LOWER(substring(p_file_name from '\.([^.]*)$'));

  -- Generate timestamp
  v_timestamp := to_char(NOW(), 'YYYYMMDD_HH24MISS');

  -- Generate random string (8 chars)
  v_random := substr(md5(random()::text), 1, 8);

  -- Construct path: consultations/{consultation_id}/{user_id}/{timestamp}_{random}.{ext}
  v_path := format(
    'consultations/%s/%s/%s_%s.%s',
    p_consultation_id,
    p_user_id,
    v_timestamp,
    v_random,
    v_extension
  );

  RETURN v_path;
END;
$$;

-- =============================================================================
-- Helper Function: Get attachment URL
-- =============================================================================

CREATE OR REPLACE FUNCTION get_attachment_url(
  p_file_path TEXT,
  p_expiry_seconds INT DEFAULT 3600
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bucket_url TEXT;
  v_signed_url TEXT;
BEGIN
  -- Get Supabase storage URL from environment
  -- In production, this should be configured in your app
  v_bucket_url := current_setting('app.supabase_storage_url', true);

  IF v_bucket_url IS NULL THEN
    v_bucket_url := 'https://your-project.supabase.co/storage/v1';
  END IF;

  -- For now, return unsigned URL (you'll generate signed URLs in backend)
  v_signed_url := format(
    '%s/object/message-attachments/%s',
    v_bucket_url,
    p_file_path
  );

  RETURN v_signed_url;
END;
$$;

-- =============================================================================
-- Trigger: Auto-cleanup orphaned attachments
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_orphaned_attachments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete storage object when message_attachment record is deleted
  PERFORM storage.delete_object(
    'message-attachments',
    OLD."fileUrl"
  );

  RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_cleanup_orphaned_attachments
AFTER DELETE ON message_attachments
FOR EACH ROW
EXECUTE FUNCTION cleanup_orphaned_attachments();

-- =============================================================================
-- View: Attachment Statistics
-- =============================================================================

CREATE OR REPLACE VIEW message_attachment_stats AS
SELECT
  c.id AS consultation_id,
  COUNT(ma.id) AS total_attachments,
  SUM(ma."fileSize") AS total_size_bytes,
  ROUND(SUM(ma."fileSize")::NUMERIC / 1024 / 1024, 2) AS total_size_mb,
  COUNT(DISTINCT ma."mimeType") AS unique_mime_types,
  json_agg(
    DISTINCT jsonb_build_object(
      'mimeType', ma."mimeType",
      'count', (SELECT COUNT(*) FROM message_attachments WHERE "mimeType" = ma."mimeType")
    )
  ) AS mime_type_breakdown
FROM consultations c
LEFT JOIN messages m ON m."consultationId" = c.id
LEFT JOIN message_attachments ma ON ma."messageId" = m.id
WHERE m."deletedAt" IS NULL
GROUP BY c.id;

-- =============================================================================
-- Grant Permissions
-- =============================================================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION generate_attachment_path TO authenticated;
GRANT EXECUTE ON FUNCTION get_attachment_url TO authenticated;

-- Grant select on stats view
GRANT SELECT ON message_attachment_stats TO authenticated;

-- =============================================================================
-- Example Usage
-- =============================================================================

-- Example 1: Generate file path for upload
-- SELECT generate_attachment_path(
--   'a0000000-0000-0000-0000-000000000001'::UUID,
--   '11111111-1111-1111-1111-111111111111'::UUID,
--   'contract.pdf'
-- );
-- Result: consultations/a0000000-0000-0000-0000-000000000001/11111111-1111-1111-1111-111111111111/20250118_143022_a3b4c5d6.pdf

-- Example 2: Get attachment URL
-- SELECT get_attachment_url('consultations/a0000000-0000-0000-0000-000000000001/file.pdf');

-- Example 3: View attachment statistics for a consultation
-- SELECT * FROM message_attachment_stats
-- WHERE consultation_id = 'a0000000-0000-0000-0000-000000000001';

-- =============================================================================
-- Notes
-- =============================================================================

-- 1. File Organization:
--    - Files are organized by consultation and user
--    - Path structure: consultations/{consultation_id}/{user_id}/{timestamp}_{random}.{ext}
--    - This makes it easy to clean up all files when a consultation is deleted
--
-- 2. Security:
--    - Files are private (public = false)
--    - RLS policies ensure users can only access files from their consultations
--    - File upload requires authentication
--    - Users can only delete their own attachments
--
-- 3. File Limits:
--    - Max file size: 50 MB
--    - Allowed types: Images, Documents, Archives, Audio, Video
--    - Adjust limits in bucket configuration as needed
--
-- 4. Backend Integration:
--    - Use Supabase Storage SDK to generate signed URLs
--    - Example (TypeScript):
--      const { data } = await supabase.storage
--        .from('message-attachments')
--        .createSignedUrl(filePath, 3600) // 1 hour expiry
--
-- 5. Cleanup:
--    - Orphaned attachments are auto-deleted when message_attachments record is removed
--    - Consider implementing scheduled cleanup job for unreferenced files
--
-- 6. Monitoring:
--    - Use message_attachment_stats view to monitor storage usage
--    - Set up alerts for consultations exceeding storage quotas
