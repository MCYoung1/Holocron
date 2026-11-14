const AVATAR_SIGNATURES = {
  'image/jpeg': (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
  'image/png': (data) => data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/gif': (data) => data.length >= 6 &&
    ['GIF87a', 'GIF89a'].includes(data.subarray(0, 6).toString('ascii')),
  'image/webp': (data) => data.length >= 12 &&
    data.subarray(0, 4).toString('ascii') === 'RIFF' &&
    data.subarray(8, 12).toString('ascii') === 'WEBP',
};

export function isValidAvatar(mimeType, data) {
  const signatureMatches = AVATAR_SIGNATURES[mimeType];
  return Buffer.isBuffer(data) &&
    data.length > 0 &&
    data.length <= 2 * 1024 * 1024 &&
    typeof signatureMatches === 'function' &&
    signatureMatches(data);
}
