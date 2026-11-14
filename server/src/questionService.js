export function isValidQuestion(questionType, options, correctIndex) {
  const expectedOptionCount = questionType === 'true_false'
    ? 2
    : questionType === 'multiple_choice'
      ? 4
      : 0;

  return expectedOptionCount > 0 &&
    Array.isArray(options) &&
    options.length === expectedOptionCount &&
    options.every((option) => typeof option === 'string' && option.trim().length > 0) &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex < expectedOptionCount;
}
