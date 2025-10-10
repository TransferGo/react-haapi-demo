import React from "react"

/* UI Components */
import { Layout, Page, Well, Logo, Heading, Button, FormElement } from "../../ui-components";

const FormSelector = (props) => {
  const { actions, submitForm } = props
  const options = actions[0].model.options
  const title = actions[0].title

  const handleSubmit = (model) => {
    // Convert fields array to URLSearchParams for form submission
    const fields = new URLSearchParams(model.fields.map(field => [field.name, field.value]))
    submitForm(fields, model.href, model.method)
  }

  return (
    <Layout>
      <Page>
        <Well>
          <Logo />
          <Heading title={title} />

          {options.map(({ title, kind, model }) => (
            <FormElement key={title}>
              <Button 
                title={title} 
                authenticator={kind} 
                type="social" 
                loading={false} 
                submitForm={() => handleSubmit(model)} 
              />
            </FormElement>
          ))}
        </Well>
      </Page>
    </Layout>
  )
}

export default FormSelector

