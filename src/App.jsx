import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import ErrorPage from './components/Error.jsx';


function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [error, setErorr] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    async function fetchUserPlaces() {
      try {
        setIsFetching(true);
        const response = await fetch("http://localhost:3000/user-places");
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error("Could not fetch user places");
        }
        setUserPlaces(responseData.places);
        setIsFetching(false);
      } catch (err) {
        setError({ message: err.message || "Something went bad" });
        setIsFetching(false);
      }
    }
    fetchUserPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      const response = await fetch("http://localhost:3000/user-places", {
        method: "PUT",
        body: JSON.stringify({ places: [selectedPlace, ...userPlaces] }),
        headers: { "Content-Type": "application/json" }
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error("Could not add place to visit list");
      }
    } catch (err) {
      setErorr({ message: err.message || "Something went wrong" });
      setUserPlaces(userPlaces);
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try {
      const response = await fetch("http://localhost:3000/user-places", {
        method: "PUT",
        body: JSON.stringify({ places: userPlaces.filter((place) => place.id !== selectedPlace.current.id) }),
        headers: { "Content-Type": "application/json" }
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error("Removing place failed");
      }
    } catch (err) {
      setErorr({ message: err.message || "Removing place failed" });
      setUserPlaces(userPlaces);
    }

    setModalIsOpen(false);
  }, [userPlaces]);

  function resetError() {
    setErorr(null);
  }

  return (
    <>
      <Modal open={error ? true : false} onClose={resetError}>
        {error &&
          <ErrorPage
            title="An error occurred!"
            message={error.message}
            onConfirm={resetError}>
          </ErrorPage>}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
