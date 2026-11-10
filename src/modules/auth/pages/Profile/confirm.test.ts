import { describe, expect, it } from 'vitest';

import { deleteConfirmation } from './confirm';

describe('deleteConfirmation', () => {
  it('sends the email when the account email is typed', () => {
    expect(deleteConfirmation(' Ann@Example.com ', 'ann@example.com')).toEqual({
      email: ' Ann@Example.com ',
    });
  });

  it('sends anything else as the password', () => {
    expect(deleteConfirmation('secret-password', 'ann@example.com')).toEqual({
      password: 'secret-password',
    });
  });
});
