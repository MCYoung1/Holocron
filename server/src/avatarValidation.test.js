import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidAvatar } from './avatarValidation.js';

test('accepts supported avatar formats with matching file signatures', () => {
  assert.equal(isValidAvatar('image/jpeg', Buffer.from([0xff, 0xd8, 0xff])), true);
  assert.equal(isValidAvatar('image/png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
  assert.equal(isValidAvatar('image/gif', Buffer.from('GIF89a')), true);
  assert.equal(isValidAvatar('image/webp', Buffer.from('RIFF0000WEBP')), true);
});

test('rejects unsupported, empty, mismatched, and oversized avatars', () => {
  assert.equal(isValidAvatar('image/svg+xml', Buffer.from('<svg/>')), false);
  assert.equal(isValidAvatar('image/png', Buffer.from('not a png')), false);
  assert.equal(isValidAvatar('image/jpeg', Buffer.alloc(0)), false);
  assert.equal(isValidAvatar('image/jpeg', Buffer.alloc(2 * 1024 * 1024 + 1)), false);
});
