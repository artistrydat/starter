-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view owned or shared itineraries" ON public.trip_itineraries;

-- Create separate non-recursive policies
CREATE POLICY "Users can view their own itineraries" 
  ON public.trip_itineraries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared itineraries" 
  ON public.trip_itineraries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shared_itineraries si
      WHERE si.itinerary_id = id AND si.user_id = auth.uid()
    )
  );
