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

import React from "react"

const FormField = (props) => {
  const { type, name, label, onChange, fieldProblem, value} = props
  let formType, autofocus, fieldValue;

  switch (type) {
    case "username":
    case "phonenumber":
      formType = "text"
      autofocus = true
      break
    case "password":
      formType = "password"
      break
    case "checkbox":
        formType = "checkbox"
        fieldValue = 'off'
          break
    case "hidden":
        formType = "input"
        fieldValue = value
        onChange({
            target: {
                value: fieldValue
            }
        })
          break
    default:
      formType = "text"
  }

  const classes = "block full-width mb1 field-light " + (fieldProblem ? "is-error" : "")  + (formType === "input" ? " hidden" : undefined )

  return (
    <div className="form-field">
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        type={formType}
        name={name}
        id={name}
        className={classes}
        autoCapitalize="none"
        autoFocus={autofocus}
        autoComplete={name}
        data-lpignore="true"
        value={fieldValue}
        onChange={onChange}
      />
        {fieldProblem && <div className="is-error-danger is-error">{fieldProblem.detail}</div>}
    </div>
  )
}

export default FormField
