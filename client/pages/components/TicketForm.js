export default function TicketForm({
  title,
  onChangeTitle,
  price,
  onChangePrice,

  onSubmit,
  errors
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => {onChangeTitle(e.target.value)}}
          placeholder="Enter title"
          type="text"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Price</label>
        <input
          value={price}
          onBlur={() => {
            const value = parseFloat(price);
            if (isNaN(value)) {
              return;
            }

            onChangePrice(value.toFixed(2));
          }}
          onChange={(e) => {onChangePrice(e.target.value)}}
          placeholder="Indicate price"
          type="text"
          className="form-control"
        />
      </div>
      {errors}
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}
