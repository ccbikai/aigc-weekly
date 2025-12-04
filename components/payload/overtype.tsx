'use client'

import type { OverType as OverTypeInstance } from 'overtype'
import type { TextareaFieldClientComponent } from 'payload'
import {
  fieldBaseClass,
  FieldDescription,
  FieldError,
  FieldLabel,
  RenderCustomComponent,
  useField,
  useTheme,
} from '@payloadcms/ui'
import OverType from 'overtype'
import { useEffect, useRef } from 'react'

const editorStyle = {
  border: '1px solid var(--theme-elevation-150)',
  color: 'var(--theme-elevation-800)',
  boxShadow: '0 2px 2px -1px #0000001a',
}
const minHeight = 300

export const OvertypeFieldComponent: TextareaFieldClientComponent = (props) => {
  const {
    field: {
      admin: { className, description, placeholder, style } = {},
      label,
      localized,
      required,
    },
    path,
    readOnly,
  } = props

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    disabled,
    setValue,
    showError,
    value,
  } = useField<string>({
    path,
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<OverTypeInstance | null>(null)
  const { theme } = useTheme()

  const isDisabled = Boolean(readOnly || disabled)
  const htmlID = `field-${path.replace(/\./g, '__')}`

  useEffect(() => {
    if (!containerRef.current)
      return

    const [instance] = OverType.init(containerRef.current, {
      autoResize: true,
      fontSize: '12px',
      lineHeight: '20px',
      padding: '8px 15px',
      minHeight: `${minHeight}px`,
      onChange: (val: string) => {
        setValue(val)
      },
      placeholder: typeof placeholder === 'string' ? placeholder : '',
      showStats: true,
      theme: theme === 'dark' ? 'cave' : 'solar',
      toolbar: true,
      textareaProps: {
        id: htmlID,
        name: path,
        readOnly: isDisabled,
      },
      value: '',
    })

    editorRef.current = instance

    return () => {
      instance?.destroy()
      editorRef.current = null
    }
  }, [htmlID, isDisabled, theme, path, placeholder, setValue])

  useEffect(() => {
    if (!editorRef.current)
      return

    const nextValue = value ?? ''
    const currentValue = editorRef.current.getValue()
    if (nextValue !== currentValue) {
      editorRef.current.setValue(nextValue)
    }
  }, [value])

  useEffect(() => {
    if (editorRef.current?.textarea) {
      editorRef.current.textarea.readOnly = isDisabled
    }
  }, [isDisabled])

  const classNames = [
    fieldBaseClass,
    'textarea',
    'overtype',
    className,
    showError && 'error',
    isDisabled && 'read-only',
  ].filter(Boolean).join(' ')

  return (
    <div className={classNames} style={style}>
      <RenderCustomComponent
        CustomComponent={Label}
        Fallback={(
          <FieldLabel
            htmlFor={htmlID}
            label={label}
            localized={localized}
            path={path}
            required={required}
          />
        )}
      />
      <div className={`${fieldBaseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={Error}
          Fallback={<FieldError path={path} showError={showError} />}
        />
        {BeforeInput}
        <div className="textarea-outer" style={{ minHeight: `${minHeight + 90}px`, ...editorStyle }}>
          <div ref={containerRef} />
        </div>
        {AfterInput}
        <RenderCustomComponent
          CustomComponent={Description}
          Fallback={<FieldDescription description={description} path={path} />}
        />
      </div>
    </div>
  )
}
