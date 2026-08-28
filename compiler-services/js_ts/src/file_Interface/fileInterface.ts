import { Readable } from "stream";

export interface FileUploadModel {
  name: string;
  size: number;
  language: string;
  file: Readable;        // original stream
  fileContent?: string; // sanitized text
}
