import { useEffect, useState } from 'react';
import Places from './Places.jsx';
import ErrorPage from './Error.jsx';

export default function AvailablePlaces({ onSelectPlace }) {

  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [receivedError, setReceivedError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function fetchAvaliablePlaces() {
      try {
        setIsFetching(true);
        const response = await fetch("http://localhost:3000/places");
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error("Could not fetch places");
        }
        setAvailablePlaces(responseData.places);
        setIsFetching(false);
      } catch (err) {
        setReceivedError({ message: err.message || "Something went bad" });
        setIsFetching(false);
      }
    }
    fetchAvaliablePlaces();
  }, []);

  if (receivedError) {
    return (<ErrorPage title="An error occurred!" message={receivedError.message} />);
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
      isLoading={isFetching}
      loadingText="Fetching places"
      onSelectPlace={onSelectPlace}
    />
  );
}
