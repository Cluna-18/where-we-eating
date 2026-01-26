import "./App.css";

function RestaurantList({ restaurants }) {
  if (restaurants.length === 0) {
    return <p className="text-black">No restaurants found.</p>;
  }

  return (
  <div className="table-wrapper">
    <table className="restaurant-table">
      <thead>
        <tr>
          <th>Name of Restaurant</th>
          <th>Service Style</th>
          <th>Price</th>
          <th>Dish / Type Focused</th>
        </tr>
      </thead>
      <tbody>
        {restaurants.map((rest) => (
          <tr key={rest.id}>
            <td>{rest.name}</td>
            <td>{rest.serviceStyle}</td>
            <td>
              {rest.price === 1 ? "$" : rest.price === 2 ? "$$" : rest.price === 3 ? "$$$" : rest.price}
            </td>
            <td>{rest.dish_type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

}

export default RestaurantList;
