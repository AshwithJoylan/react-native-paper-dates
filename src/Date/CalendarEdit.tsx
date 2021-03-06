import * as React from 'react'
import {
  View,
  StyleSheet,
  TextInput as TextInputNative,
  Keyboard,
} from 'react-native'

import { CalendarDate, ModeType } from './Calendar'
import { LocalState } from './DatePickerModalContent'
import TextInputWithMask from '../TextInputMask'
import { useTheme } from 'react-native-paper'

function CalendarEdit({
  mode,
  state,
  label = '',
  startLabel = 'Start',
  endLabel = 'End',
  collapsed,
  onChange,
}: {
  mode: ModeType
  label?: string
  startLabel?: string
  endLabel?: string
  state: LocalState
  collapsed: boolean
  onChange: (s: LocalState) => any
}) {
  const dateInput = React.useRef<TextInputNative | null>(null)
  const startInput = React.useRef<TextInputNative | null>(null)
  const endInput = React.useRef<TextInputNative | null>(null)

  // when switching views focus, or un-focus text input
  React.useEffect(() => {
    // hide open keyboard
    if (collapsed) {
      Keyboard.dismiss()
    }

    const inputsToFocus = [dateInput.current, startInput.current].filter(
      (n) => n
    ) as TextInputNative[]

    const inputsToBlur = [
      dateInput.current,
      startInput.current,
      endInput.current,
    ].filter((n) => n) as TextInputNative[]

    if (collapsed) {
      inputsToBlur.forEach((ip) => ip.blur())
    } else {
      inputsToFocus.forEach((ip) => ip.focus())
    }
  }, [mode, startInput, endInput, dateInput, collapsed])

  const onSubmitStartInput = React.useCallback(() => {
    if (endInput.current) {
      endInput.current.focus()
    }
  }, [endInput])

  const onSubmitEndInput = React.useCallback(() => {
    // TODO: close modal and persist range
  }, [])

  const onSubmitInput = React.useCallback(() => {
    // TODO: close modal and persist range
  }, [])

  return (
    <View style={styles.root}>
      <View style={styles.inner}>
        {mode === 'single' ? (
          <CalendarInput
            ref={dateInput}
            label={label}
            value={state.date}
            onChange={(date) => onChange({ ...state, date })}
            onSubmitEditing={onSubmitInput}
          />
        ) : null}
        {mode === 'range' ? (
          <>
            <CalendarInput
              ref={startInput}
              label={startLabel}
              value={state.startDate}
              onChange={(startDate) => onChange({ ...state, startDate })}
              returnKeyType={'next'}
              onSubmitEditing={onSubmitStartInput}
            />
            <View style={styles.separator} />
            <CalendarInput
              ref={endInput}
              label={endLabel}
              value={state.endDate}
              onChange={(endDate) => onChange({ ...state, endDate })}
              isEndDate
              onSubmitEditing={onSubmitEndInput}
            />
          </>
        ) : null}
      </View>
    </View>
  )
}

function CalendarInputPure(
  {
    label,
    value,
    onChange,
    isEndDate,
    returnKeyType,
    onSubmitEditing,
    locale,
  }: {
    locale?: undefined | string
    label: string
    value: CalendarDate
    onChange: (d: Date | undefined) => any
    isEndDate?: boolean
    returnKeyType?: string
    onSubmitEditing?: () => any
  },
  ref: any
) {
  const theme = useTheme()
  const formatter = React.useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }, [locale])

  const inputFormat = React.useMemo(() => {
    // TODO: something cleaner and more universal?
    const inputDate = formatter.format(new Date(Date.UTC(2020, 10 - 1, 1)))
    return inputDate
      .replace('2020', 'YYYY')
      .replace('10', 'MM')
      .replace('01', 'DD')
  }, [formatter])

  const formattedValue = formatter.format(value)
  const onChangeText = (date: string) => {
    const dayIndex = inputFormat.indexOf('DD')
    const monthIndex = inputFormat.indexOf('MM')
    const yearIndex = inputFormat.indexOf('YYYY')

    const day = Number(date.slice(dayIndex, dayIndex + 2))
    const year = Number(date.slice(yearIndex, yearIndex + 4))
    const month = Number(date.slice(monthIndex, monthIndex + 2))
    if (isEndDate) {
      onChange(new Date(year, month - 1, day, 23, 59, 59))
    } else {
      onChange(new Date(year, month - 1, day))
    }
  }
  return (
    <TextInputWithMask
      ref={ref}
      value={formattedValue}
      style={styles.input}
      label={`${label} (${inputFormat})`}
      keyboardType={'number-pad'}
      placeholder={inputFormat}
      mask={inputFormat}
      onChangeText={onChangeText}
      returnKeyType={returnKeyType}
      onSubmitEditing={onSubmitEditing}
      keyboardAppearance={theme.dark ? 'dark' : 'default'}
    />
  )
}

const CalendarInput = React.forwardRef(CalendarInputPure)

const styles = StyleSheet.create({
  root: { padding: 12 },
  inner: { flexDirection: 'row' },
  input: { flex: 1 },
  separator: { width: 12 },
})

export default React.memo(CalendarEdit)
