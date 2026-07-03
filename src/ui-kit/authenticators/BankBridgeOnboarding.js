import React from "react";

/* UI Components */
import { Layout, Page, Well, Logo, Heading, Button } from "../ui-components";

/*
 * Renders the bank-bridge onboarding authentication action
 * (viewName: authentication-action/bank-bridge-onboarding/index).
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
    const status = fieldValue("status")
    const alreadyExists = status === "AlreadyExists"

    const submit = () => {
        const body = new URLSearchParams(fields.map((field) => [field.name, field.value || ""]))
        props.submitForm(body, model.href, model.method)
    }

    const openWebView = () => window.open(webViewUrl, "_blank", "noopener,noreferrer")

    const renderBody = () => {
        if (webViewUrl) {
            return (
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
            )
        }
        if (alreadyExists) {
            return (
                <div className="area">
                    <p>You already have an account at the bank. Continue to proceed.</p>
                </div>
            )
        }
        return (
            <div className="area">
                <p className="error">
                    No bank onboarding URL was returned, so the web view can't be opened.
                    Onboarding is not complete. This usually means the onboarding link
                    wasn't issued upstream (check the bank-bridge / plugin logs).
                </p>
                <p>You can continue to let the server re-evaluate the onboarding status.</p>
            </div>
        )
    }

    return (
        <Layout>
            <Page>
                <Well>
                    <Logo />
                    <Heading title={title || "Bank onboarding"} />
                    {messages && messages.map((message, index) => (
                        <div key={index} className={message.classList.join(" ")}>{message.text}</div>
                    ))}
                    {renderBody()}
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
