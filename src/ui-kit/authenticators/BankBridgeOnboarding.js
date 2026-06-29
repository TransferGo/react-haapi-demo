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

import React from "react";

/* UI Components */
import { Layout, Page, Well, Logo, Heading, Button } from "../ui-components";

/*
 * Renders the bank-bridge onboarding authentication action
 * (viewName: authentication-action/bank-bridge-onboarding/index).
 *
 * The action is a "continue" form carrying three hidden fields: mode, webViewUrl
 * and processId. When webViewUrl is present the user must open the bank's
 * onboarding web view, complete it, then submit the form to continue the flow.
 * When it is absent (e.g. the user is already onboarded) the form is submitted
 * directly to advance the flow.
 */
export default function BankBridgeOnboarding(props) {
    const { actions, messages } = props.haapiResponse
    const { model, title } = actions[0]
    const fields = model.fields || []

    const fieldValue = (name) => {
        const field = fields.find((f) => f.name === name)
        return field && field.value ? field.value : null
    }

    const webViewUrl = fieldValue("webViewUrl")

    const submit = () => {
        const body = new URLSearchParams(fields.map((field) => [field.name, field.value || ""]))
        props.submitForm(body, model.href, model.method)
    }

    const openWebView = () => window.open(webViewUrl, "_blank", "noopener,noreferrer")

    return (
        <Layout>
            <Page>
                <Well>
                    <Logo />
                    <Heading title={title || "Bank onboarding"} />
                    {messages && messages.map((message, index) => (
                        <div key={index} className={message.classList.join(" ")}>{message.text}</div>
                    ))}
                    {webViewUrl ? (
                        <div className="area">
                            <p>Open the bank onboarding page, complete it, then continue.</p>
                            <Button
                                title="Open bank onboarding"
                                kind="regular"
                                authenticator="html-form"
                                loading={false}
                                submitForm={openWebView}
                            />
                        </div>
                    ) : (
                        <div className="area">
                            <p className="error">
                                No bank onboarding URL was returned, so the web view can't be opened.
                                Onboarding is not complete. This usually means the onboarding link
                                wasn't issued upstream (check the bank-bridge / plugin logs).
                            </p>
                            <p>You can continue to let the server re-evaluate the onboarding status.</p>
                        </div>
                    )}
                    <Button
                        title={model.actionTitle || "Continue"}
                        kind="regular"
                        authenticator="html-form"
                        loading={props.isLoading}
                        submitForm={submit}
                    />
                </Well>
            </Page>
        </Layout>
    )
}
