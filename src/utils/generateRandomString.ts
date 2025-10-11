export default function generateRandomString(length: number = 16): string {
  const characters: string = 'abcdefghijklmnopqrstuvwxyz0123456789_';
  let result: string = '';

  for (let i = 0; i < length; i += 1) {
    const randomIndex: number = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}
