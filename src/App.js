/* Styles */
import "./scss/main.scss"
import "./scss/curity-theme.scss"
import "./scss/curity-example-app.scss"
import './App.css'
import '../node_modules/pretty-print-json/dist/pretty-print-json.css'

import {useState} from "react";
import HAAPIProcessor from "./components/HAAPIProcessor";
import haapiFetch from "./haapiFetch";

function App() {
  const [tokens, setTokens] = useState(null)

  return (
    <div className="App">
      <header className="App-header">
        <img src="/curity-logo.svg" className="App-logo" alt="logo" />
      </header>
      <main>
        {tokens && <>
          <p>Logged in as { getSubject(tokens) } with access token {tokens.access_token}</p>
        </>}
        {!tokens && <>
          <HAAPIProcessor haapiFetch={haapiFetch} setTokens={setTokens} />
        </>}
      </main>
    </div>
  );
}

const getSubject = (tokens) => {
    const idToken = tokens.id_token
    if (!idToken) {
        return null
    }

    const dataPart = idToken.split('.')[1]
    const claims = JSON.parse(atob(dataPart))
    return claims.sub
}

export default App;
