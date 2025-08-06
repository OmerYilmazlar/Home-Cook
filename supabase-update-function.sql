-- Create a function to update user profiles that bypasses RLS
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id TEXT,
  profile_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  -- Update the user record
  UPDATE users 
  SET 
    name = COALESCE(profile_data->>'name', name),
    email = COALESCE(profile_data->>'email', email),
    phone = COALESCE(profile_data->>'phone', phone),
    avatar = COALESCE(profile_data->>'avatar', avatar),
    bio = COALESCE(profile_data->>'bio', bio),
    address = COALESCE(profile_data->>'address', address),
    latitude = CASE 
      WHEN profile_data->>'latitude' IS NOT NULL 
      THEN (profile_data->>'latitude')::FLOAT 
      ELSE latitude 
    END,
    longitude = CASE 
      WHEN profile_data->>'longitude' IS NOT NULL 
      THEN (profile_data->>'longitude')::FLOAT 
      ELSE longitude 
    END,
    cuisine_types = CASE 
      WHEN profile_data->'cuisine_types' IS NOT NULL 
      THEN profile_data->'cuisine_types'
      ELSE cuisine_types 
    END,
    available_for_pickup = CASE 
      WHEN profile_data->>'available_for_pickup' IS NOT NULL 
      THEN (profile_data->>'available_for_pickup')::BOOLEAN 
      ELSE available_for_pickup 
    END,
    favorites = CASE 
      WHEN profile_data->'favorites' IS NOT NULL 
      THEN profile_data->'favorites'
      ELSE favorites 
    END,
    updated_at = COALESCE(profile_data->>'updated_at', NOW()::TEXT)
  WHERE id = user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_user_profile TO authenticated;
