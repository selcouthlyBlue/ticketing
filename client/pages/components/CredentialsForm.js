export default function CredentialsForm({
  email,
  onChangeEmail,
  password,
  onChangePassword,

  onSubmit,
  errors
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          onChange={onChangeEmail}
          placeholder="Email"
          type="email"
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          onChange={onChangePassword}
          placeholder="************"
          type="password"
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
