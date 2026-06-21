export const parseGroqJSON = (text) => {
  try {
    let cleanText = text.trim();
    // Remove markdown code block markers if present
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?\n?/, '');
      cleanText = cleanText.replace(/\n?```\s*$/, '');
    }
    return JSON.parse(cleanText.trim());
  } catch (error) {
    console.error('Failed to parse Groq JSON response:', error.message);
    console.error('Raw text was:', text);
    throw new Error('Failed to parse AI response. The AI returned an unexpected format.');
  }
};
