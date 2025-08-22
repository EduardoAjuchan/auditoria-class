'use client';

type AlertProps = {
  type?: 'success' | 'error' | 'info';
  message: string;
};

export default function Alert({ type = 'info', message }: AlertProps) {
  const colors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  };

  return (
    <div
      className={`w-full rounded-xl px-4 py-2 text-sm font-medium ${colors[type]} transition`}
      role="alert"
    >
      {message}
    </div>
  );
}