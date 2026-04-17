CREATE OR REPLACE FUNCTION public.recompute_housing_rating(_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _avg numeric;
  _count integer;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO _avg, _count
  FROM public.housing_ratings
  WHERE listing_id = _listing_id;

  UPDATE public.housing_listings
  SET average_rating = ROUND(_avg, 2),
      total_ratings = _count,
      updated_at = now()
  WHERE id = _listing_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.recompute_restaurant_rating(_restaurant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _avg numeric;
  _count integer;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO _avg, _count
  FROM public.restaurant_ratings
  WHERE restaurant_id = _restaurant_id;

  UPDATE public.restaurants
  SET average_rating = ROUND(_avg, 2),
      total_ratings = _count,
      updated_at = now()
  WHERE id = _restaurant_id;
END;
$$;