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

import {useEffect, useState} from "react"
import StartAuthorization from "./StartAuthorization";

/* UI Authenticators */
import UsernamePassword from "../ui-kit/authenticators/UsernamePassword";

/* UI Containers */
import Selector from "../ui-kit/containers/Selector";

/* UI Components */
import { Spinner, Error, Layout, Page, Well, Logo } from "../ui-kit/ui-components";

import UsernamePasswordContinue from "../ui-kit/authenticators/UsernamePasswordContinue";
import ShowRawResponse from "./ShowRawResponse";
import RedirectStep from "./RedirectStep";
import {prettyPrintJson} from "pretty-print-json";
import config from "../config";

export default function HAAPIProcessor(props) {
    const { haapiFetch, setTokens } = props
    const [ step, setStep ] = useState({ name: null, haapiResponse: null, inputProblem: null })
    const [missingResponseType, setMissingResponseType ] = useState(null)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ codeVerifier, setCodeVerifier ] = useState(null)
    const [ followRedirects, setFollowRedirects ] = useState(true)

    useEffect( () => {

        if (step.name === 'authorization-complete') {
            const fetchTokens = async () => {
                const tokensResponse = await getTokens(step.haapiResponse.properties.code, codeVerifier)
                const tokens = await tokensResponse.json()
                setTokens(tokens)
            }

            fetchTokens()
        }
    }, [setTokens, step, codeVerifier])

    const processAuthenticationStep = () => {
        const { haapiResponse } = step
        const view = haapiResponse.metadata.viewName

        switch (view) {
            case 'authenticator/html-form/forgot-account-id/get':
            case 'authenticator/html-form/reset-password/get':
            case 'authenticator/username/authenticate/get':
            case 'authenticator/html-form/authenticate/get':
            case 'authenticator/html-form/create-account/get':
                return <UsernamePassword
                    haapiResponse={haapiResponse}
                    submitForm={(formState, url, method) => submitForm(formState, url, method)}
                    isLoading={isLoading}
                    clickLink={(url) => clickLink(url)}
                    inputProblem={step.inputProblem}
                />
            case 'views/select-authenticator/index':
                return <Selector
                        actions={haapiResponse.actions}
                        submitForm={(url, method) => submitForm( null, url, method)}
                        />
            case 'authenticator/html-form/reset-password/post':
            case 'authenticator/html-form/forgot-account-id/post':
            case 'authenticator/html-form/create-account/post':
                return <UsernamePasswordContinue
                    haapiResponse={haapiResponse}
                    isLoading={isLoading}
                    submitForm={(url, method) => submitForm(null, url, method)}
                />
            default:
                setStep({ name: 'unknown-step', haapiResponse: step.haapiResponse })
                setMissingResponseType('Authentication Step')
        }
    }

    const startAuthorization = async () => {
        setStep({ name: 'loading', haapiResponse: null })
        setIsLoading(true)

        const codeVerifier = generateRandomString(64)
        setCodeVerifier(codeVerifier)
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        const url = new URL(config.authorizationEndpoint)
        const queryParams = url.searchParams
        queryParams.append('client_id', config.clientId)
        queryParams.append('scope', config.scope)
        queryParams.append('response_type', 'code')
        queryParams.append('code_challenge_method', 'S256')
        queryParams.append('code_challenge', codeChallenge)
        queryParams.append('redirect_uri', config.redirectUri)

        const haapiResponse = await callHaapi(url)

        setStep({ name: 'process-result', haapiResponse })
    }

    const submitForm = async (formState, url, method) => {
        setIsLoading(true)
        const haapiResponse = await callHaapi(
            url,
            method,
            formState
        )

        setStep({ name: 'process-result', haapiResponse})
    }

    const processHaapiResult = async () => {
        const { haapiResponse } = step
        setIsLoading(false)
        switch (haapiResponse.type) {
            case 'redirection-step':
                if (followRedirects) {
                    return await processRedirect()
                } else {
                    setStep({ name: 'show-redirect-step', haapiResponse })
                }
                break
            case 'authentication-step':
                setStep({ name: 'authentication-step', haapiResponse })
                break
            case 'registration-step':
                setStep({ name: 'registration-step', haapiResponse })
                break
            case 'https://curity.se/problems/incorrect-credentials':
                setStep({ name: step.haapiResponse.type, haapiResponse: step.haapiResponse, problem: haapiResponse })
                break
            case 'oauth-authorization-response':
                setStep({ name: 'authorization-complete', haapiResponse })
                break
            case 'https://curity.se/problems/invalid-input':
                setStep({ name: step.haapiResponse.type, haapiResponse: step.haapiResponse, inputProblem: haapiResponse })
                break
            default:
                setStep({ name: 'unknown-step', haapiResponse })
                setMissingResponseType('step type')
        }
    }

    useEffect(() => {
        switch (step.name) {
            case 'process-result':
                processHaapiResult()
                break
            case 'continue-redirect-step':
                processRedirect()
                break
            default:
                break
        }
    }, [ step ])

    const clickLink = async (url) => {
        const haapiResponse = await callHaapi(
            url,
            "GET",
            null
        )

        setStep({ name: 'process-result', haapiResponse })
    }

    const processRedirect = async () => {
        const action = step.haapiResponse.actions[0]

        if (action.template === 'form' && action.kind === 'redirect') {
            const haapiResponse = await callHaapi(
                action.model.href,
                action.model.method,
                getRedirectBody(action.model.fields)
            )

            setStep({ name: 'process-result', haapiResponse })
            return
        }

        setStep({ name: 'unknown-step', haapiResponse: step.haapiResponse})
        setMissingResponseType('Redirect Step')
    }

    const callHaapi = async (url, method = 'GET', body = null) => {
        const init = { method }
        if (body) {
            init.body = body
        }

        const response = await haapiFetch(url, init)

        return await response.json()
    }

    let stepComponent

    switch (step.name) {
        case 'loading':
        case 'authorization-complete':
        case 'continue-redirect-step':
        case 'process-result':
            stepComponent = <Spinner/>
            break
        case 'authentication-step':
        case 'registration-step':
            stepComponent = processAuthenticationStep()
            break
        case 'show-redirect-step':
            stepComponent = <RedirectStep continueFlow={() => setStep({ name: 'continue-redirect-step', haapiResponse: step.haapiResponse })}/>
            break
        case 'unknown-step':
            stepComponent =
            <Layout>
                <Page>
                    <Well>
                        <Logo />
                        <Error message={`Unknown ${missingResponseType}`} />
                        <div className="example-app-settings active">
                            <h3>Response</h3>
                            <pre className="json-container" dangerouslySetInnerHTML={{ __html: prettyPrintJson.toHtml(step.haapiResponse)}}></pre>
                        </div>
                    </Well>
                </Page>
            </Layout>
            break
        default:
            stepComponent =
            <Layout>
                <Page>
                    <Well>
                        <Logo />
                        {step.problem && <Error message={step.problem.title} />}
                        <div className="area">
                            <h1 className="center">Please log in</h1>
                        </div>
                        <StartAuthorization startAuthorization={() => startAuthorization()} />
                    </Well>
                </Page>
            </Layout>
    }

    return (<>
        {/* {step.problem && <Error message={step.problem.title} />} */}
        {stepComponent}
        <div className="example-app-settings active">

        <img
          src="/images/curity-api-react.svg"
          className="py4 mx-auto block"
          style={{ maxWidth: "300px" }}
          alt="Curity HAAPI React Demo"
        />

        <h1>HAAPI demo application with React</h1>

        <h3 className="white">Settings</h3>
        <div className="form-field flex flex-center">
            <input className="mr1" type="checkbox" id="toggleFollowRedirects" name="toggleFollowRedirects" checked={followRedirects} onChange={() => setFollowRedirects(!followRedirects)} />
            <label htmlFor="toggleFollowRedirects">Follow Redirects</label>
        </div>
        {step.haapiResponse && <ShowRawResponse haapiResponse={step.haapiResponse} forceVisibility={step.name === 'show-redirect-step'} />}
        </div>
    </>)
}

const getTokens = async (code, codeVerifier) => await fetch('https://localhost:8443/oauth/v2/oauth-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=react-client&grant_type=authorization_code&code=${code}&code_verifier=${codeVerifier}&redirect_uri=http://localhost:3000/`,
        mode: 'cors'
    })

const getRedirectBody = (fields) => {
    if (!fields) {
        return null
    }

    const body = {}

    fields.forEach(field => {
        body[field.name] = field.value
    })

    return body
}

const generateRandomString = (length) => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

const generateCodeChallenge = async (codeVerifier) => {
    const digest = await crypto.subtle.digest("SHA-256",
        new TextEncoder().encode(codeVerifier))

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
