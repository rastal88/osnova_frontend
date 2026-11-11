import { describe, expect, it } from 'vitest';

import { changeLines, plainText } from './changes';

const text = plainText('yes', 'no');

describe('changeLines', () => {
  it('shows a change as before and after', () => {
    expect(
      changeLines({ role: ['user', 'moderator'], groups: [[], ['Team', 'Sales']] }, text),
    ).toEqual([
      { field: 'role', before: 'user', after: 'moderator' },
      { field: 'groups', before: '—', after: 'Team, Sales' },
    ]);
  });

  it('shows the filters of an export as values', () => {
    expect(changeLines({ status: 'done', q: 'ann' }, text)).toEqual([
      { field: 'status', value: 'done' },
      { field: 'q', value: 'ann' },
    ]);
  });

  it('writes empty, boolean and masked values', () => {
    expect(
      changeLines({ enabled: [true, false], 'params.token': ['********', '********'] }, text),
    ).toEqual([
      { field: 'enabled', before: 'yes', after: 'no' },
      { field: 'params.token', before: '********', after: '********' },
    ]);
    expect(changeLines(null, text)).toEqual([]);
    expect(changeLines({ name: [null, 'Sales'] }, text)).toEqual([
      { field: 'name', before: '—', after: 'Sales' },
    ]);
  });

  it('names known values, also inside lists', () => {
    const named = plainText('yes', 'no', (field, value) =>
      field.startsWith('role') ? `role:${value}` : value,
    );
    expect(changeLines({ role: ['user', 'sales'], roles: [[], ['sales']] }, named)).toEqual([
      { field: 'role', before: 'role:user', after: 'role:sales' },
      { field: 'roles', before: '—', after: 'role:sales' },
    ]);
  });
});
