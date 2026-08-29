import { useEffect, useState } from "react";
import "./App.css";
import Admin from "./admin/Admin";
import { supabase } from "./supabase";

function CarGallery({ images, carName }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = fullScreen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [fullScreen]);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + images.length) % images.length
    );
  };

  return (
    <>
      <div className="car-gallery">
        <div
  className="main-image-wrapper"
  onClick={() => setFullScreen(true)}
  onTouchStart={(e) => {
    e.currentTarget.touchStartX = e.touches[0].clientX;
  }}
  onTouchEnd={(e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchStartX = e.currentTarget.touchStartX;

    if (touchStartX === undefined) return;

    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > 50) {
      if (swipeDistance < 0) {
        nextImage();
      } else {
        previousImage();
      }
    }
  }}
>
          <img
            src={images[selectedImage]}
            alt={carName}
            className="car-image"
          />

          <div className="zoom-text">
            🔍 Click to view full screen
          </div>
        </div>

        {images.length > 1 && (
          <div className="car-thumbnails">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${carName} ${index + 1}`}
                className={`car-thumbnail ${
                  selectedImage === index ? "active" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        )}
      </div>

      {fullScreen && (
        <div className="fullscreen-gallery-overlay">

          <button
            className="close-gallery"
            onClick={() => setFullScreen(false)}
          >
            ✕
          </button>

          {images.length > 1 && (
            <button
              className="gallery-arrow left"
              onClick={previousImage}
            >
              ‹
            </button>
          )}

          <img
            src={images[selectedImage]}
            alt={carName}
            className="fullscreen-image"
          />

          {images.length > 1 && (
            <button
              className="gallery-arrow right"
              onClick={nextImage}
            >
              ›
            </button>
          )}

          <div className="image-counter">
            {selectedImage + 1} / {images.length}
          </div>

        </div>
      )}
    </>
  );
}

function App() {
  const [cars, setCars] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
  const saved = localStorage.getItem("nayakWishlist");
  return saved ? JSON.parse(saved) : [];
});
const toggleWishlist = (carId) => {
  setWishlist((prev) => {
    const updated = prev.includes(carId)
      ? prev.filter((id) => id !== carId)
      : [...prev, carId];

    localStorage.setItem("nayakWishlist", JSON.stringify(updated));
    return updated;
  });
};

  const isAdmin = window.location.pathname === "/admin";

  useEffect(() => {
    const getCars = async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("status", "Available")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading cars:", error);
        return;
      }

      console.log("CARS FROM SUPABASE:", data);
      setCars(data || []);
    };

    getCars();
  }, []);

  if (isAdmin) {
    return <Admin />;
  }

  return (
    <div className="app">

      <header className="header">

        <div className="top-blessing">
          Jai Sevalal & Jai Tulja Bhavani
        </div>

        <div className="logo">
          NAYAK CARS
        </div>

        <nav>
          <a href="#home">Home</a>
          <a href="#cars">Cars</a>
          <a href="#wishlist">
  Wishlist ❤️ ({wishlist.length})
</a>
        </nav>

      </header>

      <main>

        <section className="hero" id="home">

          <div className="hero-content">

            <p className="small-title">
              WELCOME TO
            </p>

            <h1>
              NAYAK CARS
            </h1>

            <p>
              Find quality pre-owned cars at the right price.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("cars")
                  .scrollIntoView()
              }
            >
              VIEW CARS
            </button>

          </div>

        </section>

        <section className="cars-section" id="cars">

          <div className="car-tools">

            <input
              type="text"
              placeholder="Search cars..."
            />

            <select defaultValue="">
  <option value="">
    All Cars
  </option>

  <option value="petrol">
    Petrol
  </option>

  <option value="diesel">
    Diesel
  </option>

  <option value="petrol-cng">
    Petrol + CNG
  </option>

  <option value="petrol-lpg">
    Petrol + LPG
  </option>

  <option value="diesel-cng">
    Diesel + CNG
  </option>

  <option value="diesel-lpg">
    Diesel + LPG
  </option>

  <option value="cng">
    CNG
  </option>

  <option value="lpg">
    LPG
  </option>

  <option value="electric">
    Electric
  </option>

  <option value="automatic">
    Automatic
  </option>

  <option value="manual">
    Manual
  </option>
</select>

          </div>

          <div className="section-heading">

            <p>
              OUR COLLECTION
            </p>

            <h2>
              AVAILABLE CARS
            </h2>

          </div>

          <div className="cars-grid">

            {cars.length === 0 ? (

              <div className="empty-message">

                <h3>
                  No cars available
                </h3>

                <p>
                  Please check back soon.
                </p>

              </div>

            ) : (

              cars.map((car) => (

                <div
  className="car-card"
  key={car.id}
>
  <button
    className="wishlist-button"
    onClick={() => toggleWishlist(car.id)}
  >
    {wishlist.includes(car.id) ? "❤️" : "♡"}
  </button>

                  {car.images &&
                  car.images.length > 0 ? (

                    <CarGallery
                      images={car.images}
                      carName={car.name}
                    />

                  ) : (

                    <div className="car-image-placeholder">
                      🚗
                    </div>

                  )}

                  <div className="car-info">

                    <h3>
                      {car.name}
                    </h3>

                    <div className="car-details">

                      <span>
                        {car.year}
                      </span>

                      <span>
                        {car.fuel}
                      </span>

                      <span>
                        {car.transmission}
                      </span>

                    </div>

                    <p className="car-reading">
                      {car.reading}
                    </p>

                    <h4>
                      {car.price}
                    </h4>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>
        <section className="wishlist-section" id="wishlist">
  <div className="section-heading">
    <p>YOUR SAVED CARS</p>
    <h2>WISHLIST ❤️</h2>
  </div>

  {wishlist.length === 0 ? (
    <div className="empty-message">
      <h3>No cars in your wishlist</h3>
      <p>Tap the ♡ button on a car to save it here.</p>
    </div>
  ) : (
    <div className="cars-grid">
  {cars
    .filter((car) => wishlist.includes(car.id))
    .map((car) => (
      <div className="car-card" key={car.id}>
        
        {car.images && car.images.length > 0 ? (
          <CarGallery
            images={car.images}
            carName={car.name}
          />
        ) : (
          <div className="car-image-placeholder">
            🚗
          </div>
        )}

        <div className="car-info">
          <h3>{car.name}</h3>

          <div className="car-details">
            <span>{car.year}</span>
            <span>{car.fuel}</span>
            <span>{car.transmission}</span>
          </div>

          <p className="car-reading">
            {car.reading}
          </p>

          <h4>
            {car.price}
          </h4>

          <button
            className="wishlist-button"
            onClick={() => toggleWishlist(car.id)}
          >
            ❤️ Remove from Wishlist
          </button>
        </div>

      </div>
    ))}
</div>
  )}
</section>

      </main>

    </div>
  );
}

export default App;