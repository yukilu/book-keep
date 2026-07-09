import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store'
import { formatMonthLabel, cn } from '@/lib/utils'

export default function MonthSelector() {
  const { selectedMonth, setSelectedMonth } = useAppStore()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(() => Number(selectedMonth.split('-')[0]))

  const changeMonth = (delta: number) => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const date = new Date(y, m - 1 + delta, 1)
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(newMonth)
  }

  const openPicker = () => {
    setPickerYear(Number(selectedMonth.split('-')[0]))
    setPickerOpen(true)
  }

  const selectMonth = (m: number) => {
    setSelectedMonth(`${pickerYear}-${String(m).padStart(2, '0')}`)
    setPickerOpen(false)
  }

  const [curYear, curMonth] = selectedMonth.split('-').map(Number)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="sticky top-0 z-40 bg-[#FAFAF7]">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => changeMonth(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <button
          onClick={openPicker}
          className="flex items-center gap-1 text-base font-semibold text-gray-900 active:opacity-60"
        >
          {formatMonthLabel(selectedMonth)}
        </button>
        <button
          onClick={() => changeMonth(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
          <div className="absolute left-4 right-4 top-full mt-1 z-40 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
              <button
                onClick={() => setPickerYear(pickerYear - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full active:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm font-semibold text-gray-900">{pickerYear}年</span>
              <button
                onClick={() => setPickerYear(pickerYear + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-full active:bg-gray-100"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              {months.map((m) => {
                const isActive = pickerYear === curYear && m === curMonth
                return (
                  <button
                    key={m}
                    onClick={() => selectMonth(m)}
                    className={cn(
                      'py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                    )}
                  >
                    {m}月
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
