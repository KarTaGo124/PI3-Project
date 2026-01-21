// Database connection utilities
// This is a placeholder that will work with any backend database
// Replace with your actual database connection logic

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  guardian_name?: string;
  guardian_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface MetalTest {
  id: number;
  patient_id: number;
  test_date: string;
  lead_level?: number;
  cadmium_level?: number;
  arsenic_level?: number;
  status: 'normal' | 'alert' | 'critical';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Referral {
  id: number;
  patient_id: number;
  specialist_type: string;
  reason: string;
  status: 'pending' | 'completed' | 'cancelled';
  referral_date: string;
  scheduled_date?: string;
  notes?: string;
  pdf_generated: boolean;
  created_at: string;
  updated_at: string;
}

interface AlertRule {
  id: number;
  metal_type: 'lead' | 'cadmium' | 'arsenic';
  critical_threshold: number;
  alert_threshold: number;
  unit: string;
}

// Mock data - replace with actual database calls
const mockPatients: Patient[] = [];
const mockMetalTests: MetalTest[] = [];
const mockReferrals: Referral[] = [];
const mockAlertRules: AlertRule[] = [
  {
    id: 1,
    metal_type: 'lead',
    critical_threshold: 45,
    alert_threshold: 25,
    unit: 'µg/dL',
  },
  {
    id: 2,
    metal_type: 'cadmium',
    critical_threshold: 2.5,
    alert_threshold: 1.5,
    unit: 'µg/L',
  },
  {
    id: 3,
    metal_type: 'arsenic',
    critical_threshold: 15,
    alert_threshold: 8,
    unit: 'µg/L',
  },
];

export async function getAlertRules(): Promise<AlertRule[]> {
  return mockAlertRules;
}

export function determineStatus(value: number, metalType: 'lead' | 'cadmium' | 'arsenic'): 'normal' | 'alert' | 'critical' {
  const rule = mockAlertRules.find(r => r.metal_type === metalType);
  if (!rule) return 'normal';

  if (value >= rule.critical_threshold) return 'critical';
  if (value >= rule.alert_threshold) return 'alert';
  return 'normal';
}

export function getStatusColor(status: 'normal' | 'alert' | 'critical'): string {
  switch (status) {
    case 'critical':
      return 'bg-red-50 text-red-900 border-red-200';
    case 'alert':
      return 'bg-yellow-50 text-yellow-900 border-yellow-200';
    case 'normal':
      return 'bg-green-50 text-green-900 border-green-200';
    default:
      return 'bg-gray-50 text-gray-900 border-gray-200';
  }
}

export const db = {
  patients: mockPatients,
  tests: mockMetalTests,
  referrals: mockReferrals,
};
