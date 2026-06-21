import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import Resume from '../models/Resume.model.js';

export const parseResumePDF = async (pdfBuffer) => {
  try {
    const uint8Array = new Uint8Array(
      pdfBuffer.buffer,
      pdfBuffer.byteOffset,
      pdfBuffer.byteLength
    );

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      fullText += strings.join(' ') + ' ';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const saveResume = async (userId, fileName, extractedText) => {
  const resume = await Resume.findOneAndUpdate(
    { userId },
    { fileName, extractedText },
    { upsert: true, new: true }
  );
  return resume;
};
