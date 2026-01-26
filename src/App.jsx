
import { useMemo, useState } from "react";
import RestaurantList from "./RestaurantList";
import Filter from "./Filter";
import WheelCanvas from "./WheelCanvas";
import useNearbyRestaurants from "./useNearbyRestaurants";
import "./App.css";

export default function App() {
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [radiusMiles, setRadiusMiles] = useState(5);

  const { restaurants, loading, error } = useNearbyRestaurants(radiusMiles);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (category && r.serviceStyle !== category) return false;
      if (price && r.price !== Number(price)) return false;
      return true;
    });
  }, [restaurants, category, price]);

  return (
    <div className="app-bg">
      <div className="bubble b1" />
      <div className="bubble b2" />
      <div className="bubble b3" />

      <div className="container">
        <header className="hero">
          
          <h1 className="heroTitle">Where do you want 2 eat<span className="heroBadgeText">
      <img src="/burgerLogo.png" alt="Icon" 
      style={{ width: '60px', height: '60px' }} />
      </span></h1>
          <p className="heroSubtitle">
            Spin the wheel, filter by vibe, and let fate pick tonight's food.
          </p>
        </header>

        <main className="layout">
          <section className="card wheelCard">
            <div className="cardHeader">
              <h2 className="cardTitle">Spin to decide</h2>
              <p className="cardMeta">
                {loading
                  ? "Finding restaurants near you…"
                  : `${filteredRestaurants.length} match(es) in ${radiusMiles} mile(s)`}
              </p>
            </div>

            <div className="wheelWrap">
              {loading ? (
                <div className="stateBox">
                  <div className="spinner" />
                  <p>Loading nearby places…</p>
                </div>
              ) : error ? (
                <div className="stateBox error">
                  <p>{error}</p>
                </div>
              ) : filteredRestaurants.length === 0 ? (
                <div className="stateBox">
                  <p>No matches. Try a bigger radius or fewer filters.</p>
                </div>
              ) : (
                <WheelCanvas restaurants={filteredRestaurants} />
              )}
            </div>
          </section>

          <aside className="side">
            <section className="card">
              <div className="cardHeader">
                <h2 className="cardTitle">Filters</h2>
                <p className="cardMeta">Narrow it down before you spin</p>
              </div>

              <Filter
                onCategoryChange={setCategory}
                onPriceChange={setPrice}
                onRadiusChange={setRadiusMiles}
                radiusMiles={radiusMiles}
              />
            </section>

            <section className="card listCard">
              <div className="cardHeader">
                <h2 className="cardTitle">Nearby picks</h2>
                <p className="cardMeta">
                  Showing {filteredRestaurants.length} place(s)
                </p>
              </div>

              <div className="listWrap">
                <RestaurantList restaurants={filteredRestaurants} />
              </div>
            </section>
          </aside>
        </main>

        <footer className="footer">
          <span>Tip: Change radius to discover more options.</span>
        </footer>
      </div>
    </div>
  );
}
