"use client"

import { useState } from "react"
import { Card, CardHeader, CardBody } from "@/components/ui/Card"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { formatFees, formatSalary } from "@/lib/insights"
import { POPULAR_ROLES } from "@/lib/constants"

interface SavedCollege {
  id: string
  name: string
  totalFees: number
  placementStats: Array<{ year: number; avgSalary: number }>
}

interface ROIResult {
  paybackMonths: number
  netGain5Years: number
  breakEvenYear: number
  monthlyDisposable: number
}

interface ROIData {
  college: { id: string; name: string; totalFees: number }
  userROI: ROIResult
  avgPlacementROI: ROIResult
  avgPlacementSalary: number
}

interface ROICalculatorProps {
  colleges: SavedCollege[]
}

export function ROICalculator({ colleges }: ROICalculatorProps) {
  const [selectedCollegeId, setSelectedCollegeId] = useState(colleges[0]?.id ?? "")
  const [selectedRole, setSelectedRole] = useState("")
  const [customPackage, setCustomPackage] = useState("")
  const [roiData, setRoiData] = useState<ROIData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedRoleData = POPULAR_ROLES.find((r) => r.label === selectedRole)
  const monthlyPackage = customPackage
    ? parseInt(customPackage) / 12
    : selectedRoleData?.avgMonthlyPackage ?? 0

  async function calculate() {
    if (!selectedCollegeId || monthlyPackage < 1000) {
      setError("Select a college and enter/choose a package.")
      return
    }
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch(
        `/api/insights/roi?collegeId=${selectedCollegeId}&expectedMonthlyPackage=${Math.round(monthlyPackage)}`
      )
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setRoiData(data.data)
    } finally {
      setIsLoading(false)
    }
  }

  const annualPackage = monthlyPackage * 12

  return (
    <Card>
      <CardHeader>
        <h2 className="font-serif text-xl text-gray-900">ROI Calculator</h2>
        <p className="text-xs text-gray-500 mt-0.5">Calculate your return on investment for each saved college</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <Select
          label="College"
          options={colleges.map((c) => ({ label: c.name, value: c.id }))}
          value={selectedCollegeId}
          onChange={(e) => setSelectedCollegeId(e.target.value)}
          placeholder="Select a college"
        />

        <Select
          label="Expected Role"
          options={POPULAR_ROLES.map((r) => ({ label: `${r.label} (~${formatSalary(r.avgMonthlyPackage * 12)} p.a.)`, value: r.label }))}
          value={selectedRole}
          onChange={(e) => { setSelectedRole(e.target.value); setCustomPackage("") }}
          placeholder="Choose a role"
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Or enter custom annual CTC</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
            <input
              type="number"
              placeholder="e.g. 1200000"
              value={customPackage}
              onChange={(e) => { setCustomPackage(e.target.value); setSelectedRole("") }}
              className="w-full rounded-lg border border-gray-300 bg-white pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {annualPackage > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Monthly: {formatSalary(monthlyPackage)} · Annual: {formatSalary(annualPackage)}
            </p>
          )}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button onClick={calculate} loading={isLoading} className="w-full">
          Calculate ROI
        </Button>

        {roiData && (
          <div className="bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100 fade-in-up">
            <h3 className="font-serif text-base text-indigo-900">{roiData.college.name}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Total Fees</p>
                <p className="numeric text-2xl text-gray-900">{formatFees(roiData.college.totalFees)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Payback Period</p>
                <p className={`numeric text-2xl ${roiData.userROI.paybackMonths === Infinity ? "text-red-600" : "text-gray-900"}`}>
                  {roiData.userROI.paybackMonths === Infinity ? "Never" : `${roiData.userROI.paybackMonths}`}<span className="text-sm text-gray-400 font-sans"> {roiData.userROI.paybackMonths === Infinity ? "" : "months"}</span>
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Net Gain (5 Years)</p>
                <p className={`numeric text-2xl ${roiData.userROI.netGain5Years >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {roiData.userROI.netGain5Years >= 0 ? "+" : ""}{formatSalary(roiData.userROI.netGain5Years)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500">Break-even Year</p>
                <p className="text-base font-bold text-gray-900">
                  {roiData.userROI.breakEvenYear === Infinity ? "N/A" : `Year ${roiData.userROI.breakEvenYear}`}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 text-xs text-amber-800">
              <strong>Avg Placement:</strong> {formatSalary(roiData.avgPlacementSalary)} p.a. ·
              <strong> Avg ROI:</strong> {formatFees(roiData.avgPlacementROI.netGain5Years)} net gain in 5 years
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
