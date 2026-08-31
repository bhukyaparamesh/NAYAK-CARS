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
      {/* CAR IMAGE */}
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

            const distance = touchEndX - touchStartX;

            if (Math.abs(distance) > 50) {
              if (distance < 0) {
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

        {/* THUMBNAILS */}
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

      {/* FULL SCREEN */}
      {fullScreen && (
        <div
          className="fullscreen-gallery-overlay"
          onClick={() => setFullScreen(false)}
        >
          {/* CLOSE */}
          <button
            className="close-gallery"
            onClick={(e) => {
              e.stopPropagation();
              setFullScreen(false);
            }}
          >
            ✕
          </button>

          {/* LEFT */}
          {images.length > 1 && (
            <button
              className="gallery-arrow left"
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
            >
              ‹
            </button>
          )}

          {/* FULL IMAGE */}
          <img
            src={images[selectedImage]}
            alt={carName}
            className="fullscreen-image"
            onClick={(e) => e.stopPropagation()}
          />

          {/* RIGHT */}
          {images.length > 1 && (
            <button
              className="gallery-arrow right"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              ›
            </button>
          )}

          {/* COUNTER */}
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

  // SEARCH + FILTER STATES
  const [search, setSearch] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");

  const toggleWishlist = (carId) => {
    setWishlist((prev) => {
      const updated = prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : [...prev, carId];

      localStorage.setItem(
        "nayakWishlist",
        JSON.stringify(updated)
      );

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

  // FILTER CARS
  const filteredCars = cars.filter((car) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      `${car.name || ""} ${car.year || ""} ${
        car.fuel || ""
      } ${car.transmission || ""} ${car.reading || ""}`
        .toLowerCase()
        .includes(searchText);

    const matchesFuel =
      !fuelFilter || car.fuel === fuelFilter;

    const matchesTransmission =
      !transmissionFilter ||
      car.transmission === transmissionFilter;

    return (
      matchesSearch &&
      matchesFuel &&
      matchesTransmission
    );
  });

  if (isAdmin) {
    return <Admin />;
  }

  return (
    <div className="app">
      {/* HEADER */}

      <header className="header">
        <div className="top-blessing">
          Jai Sevalal & Jai Tulja Bhavani
        </div>

        <div className="logo">
          NAYAK CARS
        </div>

        <nav>
          <a href="#home">Home</a>

          <a href="#cars">
            Cars
          </a>

          <a href="#wishlist">
            Wishlist ❤️ ({wishlist.length})
          </a>
        </nav>
      </header>

      <main>
        {/* HERO */}

        {/* HERO */}
<section className="hero" id="home">

  <div className="hero-car-line"></div>

  <div className="hero-side-left"></div>
  <div className="hero-side-right"></div>

  <div className="hero-content">

    <p className="hero-welcome">
      || JAI SEVALAL || &nbsp; | &nbsp; || JAI TULJA BHAVANI ||
    </p>

    <div className="hero-curve"></div>

    <h1>
      <span>NAYAK CARS</span>
      <strong>ON YOUR SCREEN</strong>
    </h1>

    <div className="hero-divider">
      <span></span>
      <b>◆</b>
      <span></span>
    </div>

    <p className="hero-description">
      Quality used cars, carefully selected and fairly priced.
      <br />
      Browse from home, then come take the wheel.
    </p>

    <div className="hero-trust">
      <i></i>
      YOUR TRUST, OUR PROMISE
      <i></i>
    </div>

    <button
      className="hero-view-button"
      onClick={() =>
        document
          .getElementById("cars")
          .scrollIntoView({
            behavior: "smooth",
          })
      }
    >
      VIEW CARS
    </button>

  </div>

  {/* SIDE CAR DESIGN */}
  <div className="hero-car">

    <div className="car-roof"></div>

    <div className="car-window front"></div>
    <div className="car-window back"></div>

    <div className="car-body-line"></div>

    <div className="car-wheel wheel-left"></div>
    <div className="car-wheel wheel-right"></div>

    <div className="car-light"></div>

  </div>

</section>

        {/* AVAILABLE CARS */}

        <section
          className="cars-section"
          id="cars"
        >
          {/* SEARCH + FILTERS */}

          <div className="car-tools">
            <input
              type="text"
              placeholder="Search cars, year, fuel..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {/* FUEL */}

            <select
              value={fuelFilter}
              onChange={(e) =>
                setFuelFilter(e.target.value)
              }
            >
              <option value="">
                All Fuel Types
              </option>

              <option value="Petrol">
                Petrol
              </option>

              <option value="Diesel">
                Diesel
              </option>

              <option value="Petrol + CNG">
                Petrol + CNG
              </option>

              <option value="Petrol + LPG">
                Petrol + LPG
              </option>

              <option value="Diesel + CNG">
                Diesel + CNG
              </option>

              <option value="Diesel + LPG">
                Diesel + LPG
              </option>

              <option value="CNG">
                CNG
              </option>

              <option value="LPG">
                LPG
              </option>

              <option value="Electric">
                Electric
              </option>
            </select>

            {/* TRANSMISSION */}

            <select
              value={transmissionFilter}
              onChange={(e) =>
                setTransmissionFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Transmissions
              </option>

              <option value="Manual">
                Manual
              </option>

              <option value="Automatic">
                Automatic
              </option>
            </select>

            {/* CLEAR FILTERS */}

            {(search ||
              fuelFilter ||
              transmissionFilter) && (
              <button
                className="clear-filters"
                onClick={() => {
                  setSearch("");
                  setFuelFilter("");
                  setTransmissionFilter("");
                }}
              >
                CLEAR
              </button>
            )}
          </div>

          {/* SECTION TITLE */}

          <div className="section-heading">
            <p>
              OUR COLLECTION
            </p>

            <h2>
              AVAILABLE CARS
            </h2>

            {(search ||
              fuelFilter ||
              transmissionFilter) && (
              <span>
                Showing {filteredCars.length} of{" "}
                {cars.length} cars
              </span>
            )}
          </div>

          {/* CARS */}

          <div className="cars-grid">
            {filteredCars.length === 0 ? (
              <div className="empty-message">
                <h3>
                  No cars found
                </h3>

                <p>
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              filteredCars.map((car) => (
                <div
                  className="car-card"
                  key={car.id}
                >
                  {/* WISHLIST */}

                  <button
                    className="wishlist-button"
                    onClick={() =>
                      toggleWishlist(car.id)
                    }
                  >
                    {wishlist.includes(car.id)
                      ? "❤️"
                      : "♡"}
                  </button>

                  {/* IMAGE */}

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

                  {/* CAR INFORMATION */}

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

        {/* WISHLIST */}

        <section
          className="wishlist-section"
          id="wishlist"
        >
          <div className="section-heading">
            <p>
              YOUR SAVED CARS
            </p>

            <h2>
              WISHLIST ❤️
            </h2>
          </div>

          {wishlist.length === 0 ? (
            <div className="empty-message">
              <h3>
                No cars in your wishlist
              </h3>

              <p>
                Tap the ♡ button on a car to save it here.
              </p>
            </div>
          ) : (
            <div className="cars-grid">
              {cars
                .filter((car) =>
                  wishlist.includes(car.id)
                )
                .map((car) => (
                  <div
                    className="car-card"
                    key={car.id}
                  >
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

                      <button
                        className="wishlist-button"
                        onClick={() =>
                          toggleWishlist(car.id)
                        }
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