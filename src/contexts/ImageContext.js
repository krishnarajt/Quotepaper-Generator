import React, { createContext, useState } from "react";
import axios from "axios";
import { createClient } from "pexels";

export const imageContext = createContext();

const pixabay_api_key = "18846369-871c95044dd7c0f31f2b303e0";
const unsplash_api_key = "UBAXKPq5WgOxU9z7XjLZrt8B0hayG2dv8gh_vyGQg-0";
const pexels_api_key =
  "RfvKt0kQLXP7affcVkFgHWHcsRSD9CGKz91wOPBeLf7suLFEJJdjSWv3";

const ImageContextProvider = (props) => {
  const [image, setImages] = useState("");

  const fetchImages = async (setIsLoading, queries) => {
    setIsLoading(true);
    try {
      // Build the search term from the quote's tags. Guard against the empty /
      // undefined query that used to make Unsplash return HTTP 400.
      const terms = [...queries].flat().filter(Boolean).map(String);
      let query = terms.length ? terms.join(" ") : "nature";
      if (query.includes("Famous Quotes")) {
        query = "nature";
      }
      const q = encodeURIComponent(query);
      const numberOfPhotos = 30;

      // Each provider is isolated so one failing API doesn't break the others.
      let pix = [];
      let uns = [];
      let pex = [];

      try {
        const pixabay_response = await axios.get(
          `https://pixabay.com/api/?key=${pixabay_api_key}&q=${q}&image_type=photo&pretty=true&per_page=200`
        );
        pix = pixabay_response.data.hits.map((image) => image.largeImageURL);
      } catch (error) {
        console.warn("Pixabay failed:", error.message);
      }

      try {
        const unsplash_response = await axios.get(
          `https://api.unsplash.com/search/photos/?query=${q}&client_id=${unsplash_api_key}&per_page=${numberOfPhotos}`
        );
        uns = unsplash_response.data.results.map((image) => image.urls.regular);
      } catch (error) {
        console.warn("Unsplash failed:", error.message);
      }

      try {
        const client = createClient(pexels_api_key);
        const pexels_response = await client.photos.search({
          query,
          per_page: 80,
        });
        pex = (pexels_response.photos ?? []).map((image) => image.src.large2x);
      } catch (error) {
        console.warn("Pexels failed:", error.message);
      }

      const data = [...pix, ...uns, ...pex];
      console.log(`Loaded ${data.length} images for "${query}"`);
      if (data.length > 0) {
        const randomImage = data[Math.floor(Math.random() * data.length)];
        setImages(randomImage);
      }
    } catch (error) {
      console.error("Image fetch failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <imageContext.Provider value={{ image, fetchImages }}>
        {props.children}
      </imageContext.Provider>
    </div>
  );
};

export default ImageContextProvider;
