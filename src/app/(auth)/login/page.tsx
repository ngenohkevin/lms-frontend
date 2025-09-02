export default function LoginPage(): JSX.Element {
  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-2xl font-bold'>Sign in to LMS</h1>
        <p className='text-muted-foreground'>
          Enter your credentials to access your account
        </p>
      </div>

      <div className='bg-card/50 rounded-2xl border p-8 backdrop-blur-sm'>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='librarian@example.com'
              className='bg-background/50 focus:ring-accent w-full rounded-lg border px-3 py-2 backdrop-blur-sm focus:ring-2 focus:outline-none'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium'>
              Password
            </label>
            <input
              id='password'
              type='password'
              placeholder='••••••••'
              className='bg-background/50 focus:ring-accent w-full rounded-lg border px-3 py-2 backdrop-blur-sm focus:ring-2 focus:outline-none'
            />
          </div>

          <button className='bg-accent text-accent-foreground hover:bg-accent/90 w-full rounded-lg px-4 py-2 font-medium transition-colors'>
            Sign In
          </button>
        </div>
      </div>

      <p className='text-muted-foreground text-center text-sm'>
        Demo credentials: librarian@example.com / password123
      </p>
    </div>
  );
}
