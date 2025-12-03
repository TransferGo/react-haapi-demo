import React from "react";

import { Layout, Page, Well, Logo, Heading } from "../ui-components";

export default function FinishFlow(props) {
    const { haapiResponse } = props
    const { messages } = haapiResponse

    const firstMessage = messages && messages.length > 0 ? messages[0] : null
    const isHeading = firstMessage && firstMessage.classList.includes("heading")

    return (
        <Layout>
            <Page>
                <Well>
                    <Logo />
                    {firstMessage && (
                        <div className="area">
                            {isHeading ? (
                                <Heading title={firstMessage.text} />
                            ) : (
                                <div className={`center mb3 ${firstMessage.classList.join(" ")}`} style={{ fontSize: '1.1rem', padding: '1rem 0' }}>
                                    {firstMessage.text}
                                </div>
                            )}
                        </div>
                    )}
                </Well>
            </Page>
        </Layout>
    )
}

