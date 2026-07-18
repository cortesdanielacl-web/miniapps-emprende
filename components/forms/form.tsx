"use client"

import * as React from "react"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form"

import { FormInput } from "@/components/forms/form-input"
import { cn } from "@/lib/utils"

type FormProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  onSubmit: (values: TFieldValues) => void | Promise<void>
  className?: string
  children: React.ReactNode
}

/**
 * Thin Form wrapper around React Hook Form + Zod-ready providers.
 */
function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  className,
  children,
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-4", className)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  )
}

type FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  name: TName
  label: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  required?: boolean
  hint?: string
  disabled?: boolean
} & Omit<ControllerProps<TFieldValues, TName>, "name" | "render" | "control">

/**
 * Controlled field bound to React Hook Form context.
 */
function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder,
  type = "text",
  required,
  hint,
  disabled,
  ...controllerProps
}: FormFieldProps<TFieldValues, TName>) {
  const { control } = useFormContext<TFieldValues>()

  return (
    <Controller
      control={control}
      name={name}
      {...controllerProps}
      render={({ field, fieldState }) => (
        <FormInput
          id={String(name)}
          label={label}
          placeholder={placeholder}
          type={type}
          required={required}
          hint={hint}
          disabled={disabled}
          error={fieldState.error?.message}
          name={field.name}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
        />
      )}
    />
  )
}

export { Form, FormField }
