import React from "react"
import { Layout, Page, Well, Logo, Button, Heading } from "../ui-components"

export default function PasskeyAuthenticator(props) {
    const { actions } = props.haapiResponse
    const firstAction = actions[0]
    const title = firstAction.title || "Login with passkeys"

    return (
        <Layout>
            <Page>
                <Well>
                    <Logo />
                    <Heading title={title} />
                    {props.onContinue && (
                        <Button
                            title="Continue"
                            submitForm={props.onContinue}
                            kind="regular"
                            loading={props.isLoading}
                        />
                    )}
                </Well>
            </Page>
        </Layout>
    )
}
