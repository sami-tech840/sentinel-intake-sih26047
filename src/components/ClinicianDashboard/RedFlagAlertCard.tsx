import React from 'react';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';
import { RedFlagAlert, RedFlagSeverity } from '../../types';

interface RedFlagAlertCardProps {
  alert: RedFlagAlert;
  onToggleResolve?: (alertId: string) => void;
  isClinicianEditable?: boolean;
}

export const RedFlagAlertCard: React.FC<RedFlagAlertCardProps> = ({
  alert,
  onToggleResolve,
  isClinicianEditable = true,
}) => {
  const getSeverityStyle = (severity: RedFlagSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-300',
          badgeBg: 'bg-rose-700 text-white',
          iconColor: 'text-rose-700',
          titleColor: 'text-rose-950',
          icon: AlertOctagon,
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          badgeBg: 'bg-amber-600 text-white',
          iconColor: 'text-amber-700',
          titleColor: 'text-amber-950',
          icon: AlertTriangle,
        };
      case 'MEDIUM':
      default:
        return {
          bg: 'bg-amber-50/60',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-900 border border-amber-300',
          iconColor: 'text-amber-600',
          titleColor: 'text-slate-900',
          icon: Info,
        };
    }
  };

  const style = getSeverityStyle(alert.severity);
  const Icon = style.icon;

  return (
    <div
      id={`red-flag-${alert.id}`}
      className={`p-4 rounded-xl border transition-all ${
        alert.resolved
          ? 'bg-slate-50 border-slate-200 opacity-75'
          : `${style.bg} ${style.border} shadow-2xs`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 shrink-0 ${alert.resolved ? 'text-slate-400' : style.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${style.badgeBg}`}>
                {alert.severity} Risk
              </span>
              <span className="text-[11px] font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                {alert.category}
              </span>
              {alert.resolved && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Acknowledged by Clinician
                </span>
              )}
            </div>

            <h4 className={`text-sm font-bold ${style.titleColor}`}>
              {alert.title}
            </h4>

            <p className="text-xs text-slate-700 leading-relaxed">
              {alert.description}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-200/60 text-xs flex items-start gap-1.5 text-slate-800">
              <strong className="text-slate-900 shrink-0">Action Required:</strong>
              <span>{alert.clinicalActionNeeded}</span>
            </div>
          </div>
        </div>

        {/* Resolve toggle */}
        {isClinicianEditable && onToggleResolve && (
          <button
            type="button"
            onClick={() => onToggleResolve(alert.id)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              alert.resolved
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-100 shadow-2xs'
            }`}
          >
            {alert.resolved ? 'Re-open' : 'Acknowledge'}
          </button>
        )}
      </div>
    </div>
  );
};
