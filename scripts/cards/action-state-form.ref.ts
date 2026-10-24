interface SubscribeResult {
  ok: boolean;
  error?: string;
}

interface SubscribeFormProps {
  subscribe: (email: string) => Promise<SubscribeResult>;
}

interface FormState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

function SubscribeForm({ subscribe }: SubscribeFormProps): JSX.Element {
  const [state, formAction, isPending] = useActionState(
    async (_previous: FormState, formData: FormData): Promise<FormState> => {
      const email = String(formData.get('email') || '').trim();
      if (!email) return { status: 'error', message: 'Enter an email' };
      const result = await subscribe(email);
      return result.ok
        ? { status: 'success', message: `Subscribed ${email}` }
        : { status: 'error', message: result.error ?? 'Unknown error' };
    },
    { status: 'idle', message: '' }
  );

  return (
    <form action={formAction}>
      <input name="email" aria-label="Email" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Subscribing…' : 'Subscribe'}
      </button>
      <p role="status">{state.message}</p>
    </form>
  );
}
