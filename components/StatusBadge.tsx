interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  // Crime status
  Open: 'bg-red-100 text-red-700',
  Closed: 'bg-green-100 text-green-700',
  'Under Investigation': 'bg-blue-100 text-blue-700',
  // Criminal status
  Arrested: 'bg-red-100 text-red-700',
  Wanted: 'bg-yellow-100 text-yellow-700',
  Released: 'bg-green-100 text-green-700',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
