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

import React, {useEffect} from "react"

/* UI Components */
import { Layout, Page, Well } from "../../ui-components";

const PreSelectedSelector = (props) => {
  const { actions, submitForm, authenticator } = props
  useEffect( () => {
    const options = actions[0].model.options
    const chosenOption = options.find(option => option.title === authenticator)
    submitForm(chosenOption.model.href, chosenOption.model.method)
  }, [])


  return (
    <Layout>
      <Page>
        <Well>
        </Well>
      </Page>
    </Layout>
  )
}

export default PreSelectedSelector
