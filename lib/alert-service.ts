// Alert service for monitoring and notifying about metal exposure thresholds

export interface AlertNotification {
  id: string;
  patientId: number;
  patientName: string;
  metalType: 'lead' | 'cadmium' | 'arsenic';
  value: number;
  unit: string;
  threshold: 'alert' | 'critical';
  severity: 'alert' | 'critical';
  timestamp: Date;
  read: boolean;
}

export interface AlertRuleConfig {
  metalType: 'lead' | 'cadmium' | 'arsenic';
  normalMax: number;
  alertThreshold: number;
  criticalThreshold: number;
  unit: string;
}

// Default alert rules
export const DEFAULT_ALERT_RULES: AlertRuleConfig[] = [
  {
    metalType: 'lead',
    normalMax: 25,
    alertThreshold: 25,
    criticalThreshold: 45,
    unit: 'µg/dL',
  },
  {
    metalType: 'cadmium',
    normalMax: 1.5,
    alertThreshold: 1.5,
    criticalThreshold: 2.5,
    unit: 'µg/L',
  },
  {
    metalType: 'arsenic',
    normalMax: 8,
    alertThreshold: 8,
    criticalThreshold: 15,
    unit: 'µg/L',
  },
];

// In-memory storage for alerts (replace with database in production)
let activeAlerts: AlertNotification[] = [];
let alertHistory: AlertNotification[] = [];

export class AlertService {
  static validateValue(
    value: number,
    metalType: 'lead' | 'cadmium' | 'arsenic'
  ): {
    status: 'normal' | 'alert' | 'critical';
    severity?: 'alert' | 'critical';
  } {
    const rule = DEFAULT_ALERT_RULES.find(r => r.metalType === metalType);
    if (!rule) return { status: 'normal' };

    if (value >= rule.criticalThreshold) {
      return { status: 'critical', severity: 'critical' };
    }
    if (value >= rule.alertThreshold) {
      return { status: 'alert', severity: 'alert' };
    }
    return { status: 'normal' };
  }

  static createAlert(
    patientId: number,
    patientName: string,
    metalType: 'lead' | 'cadmium' | 'arsenic',
    value: number
  ): AlertNotification | null {
    const validation = this.validateValue(value, metalType);
    if (validation.status === 'normal') return null;

    const rule = DEFAULT_ALERT_RULES.find(r => r.metalType === metalType)!;

    const alert: AlertNotification = {
      id: `alert-${Date.now()}-${Math.random()}`,
      patientId,
      patientName,
      metalType,
      value,
      unit: rule.unit,
      threshold: validation.status,
      severity: validation.severity!,
      timestamp: new Date(),
      read: false,
    };

    activeAlerts.push(alert);
    alertHistory.push(alert);

    return alert;
  }

  static getActiveAlerts(): AlertNotification[] {
    return activeAlerts.filter(a => !a.read);
  }

  static getCriticalAlerts(): AlertNotification[] {
    return this.getActiveAlerts().filter(a => a.severity === 'critical');
  }

  static getAlertSummary() {
    const active = this.getActiveAlerts();
    const critical = this.getCriticalAlerts();
    const alerts = active.filter(a => a.severity === 'alert');

    return {
      totalActive: active.length,
      critical: critical.length,
      alerts: alerts.length,
      criticalAlerts: critical,
      alertNotifications: alerts,
    };
  }

  static markAsRead(alertId: string): void {
    const alert = activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      activeAlerts = activeAlerts.filter(a => !a.read);
    }
  }

  static markAllAsRead(): void {
    activeAlerts.forEach(a => (a.read = true));
    activeAlerts = [];
  }

  static dismissAlert(alertId: string): void {
    activeAlerts = activeAlerts.filter(a => a.id !== alertId);
  }

  static getAlertHistory(limit: number = 50): AlertNotification[] {
    return alertHistory.slice(-limit);
  }

  static clearHistory(): void {
    alertHistory = [];
  }

  static getRule(
    metalType: 'lead' | 'cadmium' | 'arsenic'
  ): AlertRuleConfig | undefined {
    return DEFAULT_ALERT_RULES.find(r => r.metalType === metalType);
  }

  static getAllRules(): AlertRuleConfig[] {
    return [...DEFAULT_ALERT_RULES];
  }
}

// Helper to determine alert status badge color
export function getAlertStatusColor(severity: 'alert' | 'critical'): string {
  return severity === 'critical'
    ? 'bg-red-100 text-red-800'
    : 'bg-yellow-100 text-yellow-800';
}

// Helper to get notification message
export function getAlertMessage(alert: AlertNotification): string {
  const metalName = {
    lead: 'Plomo',
    cadmium: 'Cadmio',
    arsenic: 'Arsénico',
  }[alert.metalType];

  const severityText =
    alert.severity === 'critical'
      ? 'CRÍTICO - DERIVACIÓN URGENTE'
      : 'Alerta - Requiere monitoreo';

  return `${alert.patientName}: ${metalName} ${alert.value} ${alert.unit} - ${severityText}`;
}
