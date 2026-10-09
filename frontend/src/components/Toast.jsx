import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export function Toast({ message, type = 'error', onDismiss }) {
  const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = type === 'error' ? 'text-red-900' : 'text-green-900';
  const icon = type === 'error' ? AlertTriangle : CheckCircle;
  const IconComponent = icon;

  return (
    <div className={`fixed bottom-6 right-6 max-w-sm z-50 flex items-center gap-3 p-3 border rounded-lg ${bgColor} ${textColor}`}>
      <IconComponent size={18} />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onDismiss} className="hover:opacity-70 transition">
        <X size={16} />
      </button>
    </div>
  );
}
