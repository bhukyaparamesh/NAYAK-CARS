import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>NAYAK CARS</h1>
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Admin() {
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [editingCar, setEditingCar] = useState(null);

  const [car, setCar] = useState({
    name: "",
    year: "",
    fuel: "",
    transmission: "",
    reading: "",
    price: "",
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);

  // =========================
  // AUTHENTICATION
  // =========================

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setCheckingAuth(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setCheckingAuth(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // FETCH CARS
  // =========================

  const fetchCars = async () => {
    setLoadingCars(true);

    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        throw error;
      }

      setCars(data || []);
    } catch (error) {
      console.error("Error loading cars:", error);
      alert("Failed to load cars: " + error.message);
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCars();
    }
  }, [session]);

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    setCar({
      ...car,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // IMAGES
  // =========================

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  // =========================
  // ADD CAR
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

console.log("CURRENT USER:", user);
console.log("USER ERROR:", userError);

if (!user) {
  alert("No authenticated user found. Please log in again.");
  return;
}

    if (images.length === 0) {
      alert("Please select at least one car photo.");
      return;
    }

    setUploading(true);

    try {
      const imageUrls = [];

      for (const image of images) {
        const fileName = `${Date.now()}-${image.name}`;

        const { error: uploadError } =
          await supabase.storage
            .from("car-images")
            .upload(fileName, image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("car-images")
            .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
      }

      const { error: insertError } =
        await supabase
          .from("cars")
          .insert({
            name: car.name,
            year: Number(car.year),
            fuel: car.fuel,
            transmission: car.transmission,
            reading: car.reading,
            price: car.price,
            images: imageUrls,
            status: "Available",
          });

      if (insertError) {
        throw insertError;
      }

      alert("Car and photos added successfully!");

      setCar({
        name: "",
        year: "",
        fuel: "",
        transmission: "",
        reading: "",
        price: "",
      });

      setImages([]);

      fetchCars();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add car: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // DELETE CAR
  // =========================

  const handleDeleteCar = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      alert("Car deleted successfully!");

      fetchCars();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete car: " + error.message);
    }
  };

  // =========================
  // EDIT CAR
  // =========================

  const handleEditCar = (selectedCar) => {
    console.log("Editing:", selectedCar);

    setEditingCar({
      ...selectedCar,
    });
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed: " + error.message);
      return;
    }

    setSession(null);
  };

  // =========================
  // AUTH CHECK
  // =========================

  if (checkingAuth) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1>NAYAK CARS</h1>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }
  <p style={{ color: "green", fontWeight: "bold" }}>
  Logged in as: {session?.user?.email || "NO USER FOUND"}
</p>

  // =========================
  // ADMIN DASHBOARD
  // =========================

  return (
  <div className="admin-page">
    <div className="admin-container">

      <p style={{ color: "green", fontWeight: "bold" }}>
        Logged in as: {session?.user?.email || "NO USER FOUND"}
      </p>

      <div className="admin-header">
          <div>
            <h1>NAYAK CARS</h1>
            <h2>Admin Panel</h2>
          </div>

          <button
            type="button"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
        </div>

        {/* =========================
            ADD NEW CAR
        ========================= */}

        <form onSubmit={handleSubmit}>

          <label>Vehicle Name</label>

          <input
            type="text"
            name="name"
            placeholder="Example: Hyundai Grand i10 Sports"
            value={car.name}
            onChange={handleChange}
            required
          />

          <label>
            Registration / Manufacturing Year
          </label>

          <input
            type="number"
            name="year"
            placeholder="Example: 2017"
            value={car.year}
            onChange={handleChange}
            required
          />

          <label>Fuel Type</label>

          <select
            name="fuel"
            value={car.fuel}
            onChange={handleChange}
            required
          >
            <option value="">
              Select fuel
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

          <label>Transmission</label>

          <select
            name="transmission"
            value={car.transmission}
            onChange={handleChange}
            required
          >
            <option value="">
              Select transmission
            </option>

            <option value="Manual">
              Manual
            </option>

            <option value="Automatic">
              Automatic
            </option>
          </select>

          <label>Car Reading</label>

          <input
            type="text"
            name="reading"
            placeholder="Example: 1,01,000 KM"
            value={car.reading}
            onChange={handleChange}
            required
          />

          <label>Price</label>

          <input
            type="text"
            name="price"
            placeholder="Example: ₹4,50,000"
            value={car.price}
            onChange={handleChange}
            required
          />

          <label>Car Photos</label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
          />

          <p className="image-count">
            {images.length} image(s) selected
          </p>

          <button
            type="submit"
            disabled={uploading}
          >
            {uploading
              ? "UPLOADING..."
              : "ADD CAR"}
          </button>

        </form>

        {/* =========================
            EDIT CAR
        ========================= */}

        {editingCar && (
          <div className="edit-car-section">

            <h2>Edit Car</h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  const { error } =
                    await supabase
                      .from("cars")
                      .update({
                        name: editingCar.name,
                        year: Number(
                          editingCar.year
                        ),
                        fuel: editingCar.fuel,
                        transmission:
                          editingCar.transmission,
                        reading:
                          editingCar.reading,
                        price:
                          editingCar.price,
                      })
                      .eq(
                        "id",
                        editingCar.id
                      );

                  if (error) {
                    throw error;
                  }

                  alert(
                    "Car updated successfully!"
                  );

                  setEditingCar(null);

                  fetchCars();
                } catch (error) {
                  console.error(
                    "Update error:",
                    error
                  );

                  alert(
                    "Failed to update car: " +
                      error.message
                  );
                }
              }}
            >

              <label>
                Vehicle Name
              </label>

              <input
                type="text"
                value={
                  editingCar.name || ""
                }
                onChange={(e) =>
                  setEditingCar({
                    ...editingCar,
                    name: e.target.value,
                  })
                }
                required
              />

              <label>Year</label>

              <input
                type="number"
                value={
                  editingCar.year || ""
                }
                onChange={(e) =>
                  setEditingCar({
                    ...editingCar,
                    year: e.target.value,
                  })
                }
                required
              />

              <label>Fuel</label>

              <select
                value={
                  editingCar.fuel || ""
                }
                onChange={(e) =>
                  setEditingCar({
                    ...editingCar,
                    fuel: e.target.value,
                  })
                }
              >
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

              <label>
                Transmission
              </label>

              <select
                value={
                  editingCar.transmission ||
                  ""
                }
                onChange={(e) =>
                  setEditingCar({
                    ...editingCar,
                    transmission:
                      e.target.value,
                  })
                }
              >
                <option value="Manual">
                  Manual
                </option>

                <option value="Automatic">
                  Automatic
                </option>
              </select>

              <label>
                Car Reading
              </label>

              <input
                type="text"
                value={
                  editingCar.reading || ""
                }
                onChange={(e) =>
                  setEditingCar({
                    ...editingCar,
                    reading:
                      e.target.value,
                  })
                }
              />

              <label>Price</label>

              <input
                type="text"
                value={
                  editingCar.price || ""
                }
                onChange={(e) =>
                  setEditingCar({
                    ...editingCar,
                    price:
                      e.target.value,
                  })
                }
              />

              <div className="admin-car-buttons">

                <button type="submit">
                  💾 SAVE CHANGES
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditingCar(null)
                  }
                >
                  CANCEL
                </button>

              </div>

            </form>
          </div>
        )}

        {/* =========================
            EXISTING CARS
        ========================= */}

        <div className="existing-cars">

          <h2>Your Cars</h2>

          {loadingCars ? (
            <p>
              Loading cars...
            </p>
          ) : cars.length === 0 ? (
            <p>
              No cars found.
            </p>
          ) : (
            cars.map((existingCar) => (

              <div
                className="admin-car-card"
                key={existingCar.id}
              >

                {existingCar.images &&
                  existingCar.images.length >
                    0 && (
                    <img
                      src={
                        existingCar.images[0]
                      }
                      alt={
                        existingCar.name
                      }
                      className="admin-car-image"
                    />
                  )}

                <div className="admin-car-info">

                  <h3>
                    {existingCar.name}
                  </h3>

                  <p>
                    <strong>
                      Year:
                    </strong>{" "}
                    {existingCar.year}
                  </p>

                  <p>
                    <strong>
                      Fuel:
                    </strong>{" "}
                    {existingCar.fuel}
                  </p>

                  <p>
                    <strong>
                      Transmission:
                    </strong>{" "}
                    {existingCar.transmission}
                  </p>

                  <p>
                    <strong>
                      Photos:
                    </strong>{" "}
                    {existingCar.images?.length ||
                      0}
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {existingCar.status ||
                      "Available"}
                  </p>

                  <div className="admin-car-buttons">

                    <button
                      type="button"
                      onClick={() =>
                        handleEditCar(
                          existingCar
                        )
                      }
                    >
                      ✏️ EDIT
                    </button>

                    <button
                      type="button"
                    >
                      🖼️ PHOTOS
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCar(
                          existingCar.id
                        )
                      }
                    >
                      🗑️ DELETE
                    </button>

                  </div>

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default Admin;