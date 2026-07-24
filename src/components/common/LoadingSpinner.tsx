import { BiLoaderAlt } from 'react-icons/bi';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export function LoadingSpinner({ size = 32, text = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <BiLoaderAlt className="animate-spin" size={size} />
      <p className="mt-3 text-sm">{text}</p>
    </div>
  );
}