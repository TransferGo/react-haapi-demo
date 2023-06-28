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

import React, {useState} from "react";

/* UI Containers */
import Form from "../containers/Form";

/* UI Components */
import { Layout, Page, Well, Logo } from "../ui-components";

export default function IdTokenAuthenticator(props) {
    const { actions, links, messages } = props.haapiResponse
    const { model, title } = actions[0]

    const [state, setState] = useState(new URLSearchParams({'idToken': null}))

    const onChange = (name, value) => {
        setState((prevState) => {
            prevState.set('idToken', prevState.get('idToken') === localStorage.getItem('idToken') ? null : localStorage.getItem('idToken'))
            return prevState
        })
    }

    const computedTitle =
        (messages && messages.find(m => m.classList.includes("heading"))?.text)
        || title
        || model.title

    const modifiedModel = {
        ...model,
        fields: [
            {
                name: "checkbox",
                type: "checkbox",
                label: "Send Id Token?"
            }
        ]
    }

    return (
        <Layout>
            <Page>
                <Well>
                    <Logo />
                    <Form
                        model={modifiedModel}
                        computedTitle={computedTitle}
                        headingTitle={title}
                        actions={actions}
                        links={links}
                        submitForm={() => props.submitForm(state, model.href, model.method)}
                        onChange={onChange}
                        isLoading={props.isLoading}
                        clickLink={props.clickLink}
                        inputProblem={props.inputProblem}
                    />
                </Well>
            </Page>
        </Layout>
    )
}
