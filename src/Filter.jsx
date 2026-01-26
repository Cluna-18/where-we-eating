// src/Filter.jsx
export default function Filter({
  onCategoryChange,
  onPriceChange,
  onRadiusChange,
  radiusMiles,
}) {
  return (
    <div className="filters">
      <div className="filterGroup">
        <label className="filterLabel" htmlFor="serviceStyle">
          Service Style
        </label>
        <select
          id="serviceStyle"
          className="filterSelect"
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Casual Dining">Casual Dining</option>
          <option value="Cafe">Cafe</option>
          <option value="Seafood">Seafood</option>
        </select>
      </div>

      <div className="filterGroup">
        <label className="filterLabel" htmlFor="priceRange">
          Price
        </label>
        <select
          id="priceRange"
          className="filterSelect"
          onChange={(e) => onPriceChange(e.target.value)}
        >
          <option value="">All</option>
          <option value="1">$</option>
          <option value="2">$$</option>
          <option value="3">$$$</option>
        </select>
      </div>

      <div className="filterGroup">
        <label className="filterLabel" htmlFor="radius">
          Search Radius
        </label>
        <select
          id="radius"
          className="filterSelect"
          value={radiusMiles}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
        >
          <option value={1}>1 mile</option>
          <option value={3}>3 miles</option>
          <option value={5}>5 miles</option>
          <option value={10}>10 miles</option>
          <option value={15}>15 miles</option>
        </select>
      </div>
    </div>
  );
}
