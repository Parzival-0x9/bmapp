import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthGate } from '@/components/auth-gate';
import { useAppStore } from '@/lib/store';

describe('AuthGate', () => {
  beforeEach(() => {
    useAppStore.setState({
      authUser: null,
      tables: [],
      sessions: {},
      rates: { defaultHourlyRate: 15 },
      toast: null
    });
  });

  it('gates content until login', async () => {
    render(
      <AuthGate>
        <div>Protected</div>
      </AuthGate>
    );

    expect(screen.queryByText('Protected')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Staff name'), 'Morgan');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Protected')).toBeInTheDocument();
  });
});
