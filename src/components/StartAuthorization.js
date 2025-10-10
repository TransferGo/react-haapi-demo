import { useState } from "react";

export default function StartAuthorization(props) {
  const { startAuthorization } = props;

  const [scopes, setScopes] = useState(new Set(["openid", "user"]));
  const [acrValues, setAcrValues] = useState("");

  const onChange = (name, checked) => {
    if (checked) scopes.add(name);
    else scopes.delete(name);
    const newSet = new Set(Array.from(scopes));
    setScopes(newSet);
  };

  return (
    <div className="login-container">
      <h3>Select scopes</h3>
      <Checkbox
        name="openid"
        checked={scopes.has("openid")}
        onChange={onChange}
      />
      <Checkbox name="user" checked={scopes.has("user")} onChange={onChange} />
      <Checkbox
        name="business"
        checked={scopes.has("business")}
        onChange={onChange}
      />
      <h3>Enter ACR value (optional)</h3>
      <div className="form-field mb1">
        <input
          type="text"
          id="acr_values"
          name="acr_values"
          className="block full-width mb1 field-light"
          value={acrValues}
          onChange={(event) => setAcrValues(event.target.value)}
        />
      </div>
      <button
        onClick={() => startAuthorization(Array.from(scopes).join(" "), acrValues)}
        className="button button-primary button-fullwidth"
        id="submit"
        data-qa="start"
      >
        Login
      </button>
    </div>
  );
}

const Checkbox = ({ name, checked, onChange }) => {
  return (
    <div>
      <label htmlFor={name} className="label">
        {name}
      </label>
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(name, event.target.checked)}
      />
    </div>
  );
};
