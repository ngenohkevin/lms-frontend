import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className='from-accent/5 via-background to-muted/10 min-h-screen bg-gradient-to-br'>
      <div className='flex min-h-screen'>
        <div className='flex flex-1 items-center justify-center p-8'>
          <div className='w-full max-w-md space-y-8'>{children}</div>
        </div>
        <div className='from-accent/20 to-accent/5 hidden flex-1 items-center justify-center bg-gradient-to-br p-8 lg:flex'>
          <div className='space-y-6 text-center'>
            <h2 className='text-foreground text-3xl font-bold'>
              Welcome to LMS
            </h2>
            <p className='text-muted-foreground max-w-md text-lg'>
              Manage your library with our premium, modern solution designed for
              efficiency and ease of use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
