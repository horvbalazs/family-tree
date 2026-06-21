tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import { z } from 'zod'
import { Gender } from '@org/shared-types'

const { fieldContext, formContext } = createFormHookContexts()

// Allow us to bind components to the form to keep type safety but reduce production boilerplate
// Define this once to have a generator of consistent form instances throughout your app
const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})

export const AddPerson = () => {
  const form = useAppForm({
    validators: {
      onChange: z.object({
        gender: z.enum(Gender),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        birthDate: z.date(),
        deathDate: z.date().optional(),
        profileUrl: z.string().optional(),
      })
    }
  });

}