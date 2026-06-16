import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export type UploadedFilePayload = {
  name: string;
  mimeType: string;
  contentBase64: string;
};

export type ParsedFile = {
  name: string;
  text: string;
  error?: string;
};

export class DocumentParser {
  public async parseFiles(files: UploadedFilePayload[]): Promise<ParsedFile[]> {
    const results: ParsedFile[] = [];

    for (const file of files) {
      try {
        const text = await this.parseSingle(file);
        results.push({ name: file.name, text });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown parsing error.';
        results.push({ name: file.name, text: '', error: message });
      }
    }

    return results;
  }

  private async parseSingle(file: UploadedFilePayload): Promise<string> {
    const lowerName = file.name.toLowerCase();
    const buffer = Buffer.from(file.contentBase64, 'base64');

    if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
      return buffer.toString('utf8');
    }

    if (lowerName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    }

    if (lowerName.endsWith('.pdf')) {
      const result = await pdfParse(buffer);
      return (result.text ?? '').replace(/\s+/g, ' ').trim();
    }

    throw new Error(`Unsupported file type for ${file.name}.`);
  }
}
