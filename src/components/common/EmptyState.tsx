import { BiSearch } from 'react-icons/bi';

interface EmptyStateProps {
  text?: string;
}

export function EmptyState({ text = 'No stocks match your filters.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <BiSearch size={48} />
      <p className="mt-3 text-sm">{text}</p>
    </div>
  );
}