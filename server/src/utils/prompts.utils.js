export const parseGroqJSON = (text) => {
  try {
    const jsonMatch = text.match(/[\{\[][\s\S]*[\}\]]/);
    if (!jsonMatch) {
      throw new Error('No JSON structure found in response.');
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Failed to parse Groq JSON response:', error.message);
    console.error('Raw text was:', text);
    throw new Error('Failed to parse AI response. The AI returned an unexpected format.');
  }
};
