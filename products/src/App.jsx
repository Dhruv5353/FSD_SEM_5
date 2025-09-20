import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      // .get("https://fakestoreapi.com/products")
      .get("https://localhost:3000/display-products-api")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        alert("Error fetching products: " + err.message);
      });
  }, []);

  return (
    <div className="container">
      <div className="card-grid">
        {products.map((product) => (
          <div className="card" key={product.id}>
            <img className="card-img" src={product.image} alt={product.title} />
            <div className="card-body">
              <h2 className="card-title">{product.title}</h2>
              {/* <p className="card-description">{product.description}</p> */}
              <p className="card-category">Category: {product.category}</p>
              <p className="card-price">${product.price}</p>
              {/* <button className="card-btn">Add to Cart</button> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
