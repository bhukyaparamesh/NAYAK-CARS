import { useState } from "react";
import { supabase } from "../supabase";

function Admin() {
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

  const handleChange = (e) => {
    setCar({
      ...car,
      [e.target.name]: e.target.value,
    });
  };

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please select at least one car photo.");
      return;
    }

    setUploading(true);

    try {
      const imageUrls = [];

      // Upload every selected image
      for (const image of images) {
        const fileName = `${Date.now()}-${image.name}`;

        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(fileName, image);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("car-images")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
      }

      // Save car + image URLs to database
      const { error: insertError } = await supabase
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
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add car: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>NAYAK CARS</h1>
        <h2>Admin Panel</h2>

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

          <label>Registration / Manufacturing Year</label>
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
            <option value="">Select fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
          </select>

          <label>Transmission</label>
          <select
            name="transmission"
            value={car.transmission}
            onChange={handleChange}
            required
          >
            <option value="">Select transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
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

          <button type="submit" disabled={uploading}>
            {uploading ? "UPLOADING..." : "ADD CAR"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Admin;