/*
 *  Copyright 2022 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useState, useEffect } from "react";
import Heading from "../ui-kit/ui-components/Heading";
import { prettyPrintJson } from "pretty-print-json";
import config from "../config";

/* UI Components */
import { Layout, Page, Well, Logo, Checkmark } from "../ui-kit/ui-components";

export default function Authenticated(props) {
  const [userinfo, setUserinfo] = useState(null);
  const [userinfoError, setUserinfoError] = useState(null);

  const decodeToken = (idToken) => {
    const dataPart = idToken.split(".")[1];
    return JSON.parse(atob(dataPart));
  };

  const getSubject = (idToken) => {
    if (!idToken) {
      return null;
    }

    return decodeToken(idToken).sub;
  };

  const { id_token, access_token, expires_in, nonce_token, refresh_token } = props.tokens;

  localStorage.setItem('idToken', id_token);

  useEffect(() => {
    const fetchUserinfo = async () => {
      try {
        const userinfoUrl = `${config.serverBaseUri}oauth/v2/oauth-userinfo`;
        const response = await fetch(userinfoUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUserinfo(data);
      } catch (error) {
        setUserinfoError(error.message);
      }
    };

    if (access_token) {
      fetchUserinfo();
    }
  }, [access_token]);

  return (
    <Layout>
      <Page>
        <Well>
          <Logo />
          <Checkmark />
          <Heading title={`Welcome ${getSubject(id_token)}!`} />

          <div className="example-app-settings active">
            <img
              src="/images/curity-api-react.svg"
              className="py4 mx-auto block"
              style={{ maxWidth: "300px" }}
              alt="Curity HAAPI React Demo"
            />

            <h3>Access Token</h3>
            <pre id="access-token-container" className="json-container">{access_token}</pre>

            <h3>Access Token Claims</h3>
            <pre
                className="json-container"
                dangerouslySetInnerHTML={{
                  __html: prettyPrintJson.toHtml(decodeToken(access_token)),
              }}
            />

            <h3>Access token expires in (seconds)</h3>
            <pre id="token-expire-container" className="json-container">{expires_in}</pre>

            <h3>refresh_token, nonce_token</h3>
            <pre className="json-container">{refresh_token}   {nonce_token}</pre>

            <h3>Userinfo Payload</h3>
            {userinfoError ? (
              <pre className="json-container" style={{ color: 'red' }}>
                Error fetching userinfo: {userinfoError}
              </pre>
            ) : userinfo ? (
              <pre
                className="json-container"
                dangerouslySetInnerHTML={{
                  __html: prettyPrintJson.toHtml(userinfo),
                }}
              />
            ) : (
              <pre className="json-container">Loading userinfo...</pre>
            )}

            <pre
                hidden
                id="accessTokenClaims"
                className="json-container"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(decodeToken(access_token)),
                }}
            />
            <pre
                hidden
                id="idTokenClaims"
                className="json-container"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(decodeToken(id_token)),
                }}
            />
            <pre
                hidden
                id="nonceToken"
                className="json-container"
                dangerouslySetInnerHTML={{
                  __html: nonce_token,
                }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "16px" }}>
            {/* <button className="button button-primary" onClick={() => props.setTokens(null)}>
              Start authentication with the same HAAPI session
            </button> */}
            <button className="button" onClick={() => window.location.reload()}>
              Logout
            </button>
          </div>
        </Well>
      </Page>
    </Layout>
  );
}

