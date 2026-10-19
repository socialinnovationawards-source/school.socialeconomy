export function normalizeArticleSearchText(value) {
  return value
    .replaceAll('ي', 'ی')
    .replaceAll('ى', 'ی')
    .replaceAll('ك', 'ک')
    .trim()
    .toLocaleLowerCase('fa');
}
