// ============================================================================
// SHARED COMPILER UPLOAD MODELS
// Base + Generic + Language Extensions
// ============================================================================

/**
 * 1. BASE MODEL (shared across ALL compilers)
 * This is the only mandatory structure for ingestion.
 */
export interface BaseUploadModel {
  name: string;
  size: number;
  fileContent: string;
  filePath?: string;
  language: string;
}

/**
 * 2. GENERIC WRAPPER
 * Allows compiler-specific metadata injection WITHOUT breaking base schema.
 */
export interface CompilerUploadModel<TMeta = unknown> {
  base: BaseUploadModel;
  meta?: TMeta;
}

// ============================================================================
// 3. LANGUAGE-SPECIFIC METADATA MODELS
// These are OPTIONAL extensions per compiler
// ============================================================================

export interface GoUploadMeta {
  modulePath?: string;
  goVersion?: string;
}

export interface CsharpUploadMeta {
  assemblyName?: string;
  csharpVersion?: string;
}

export interface JavaUploadMeta {
  classpath?: string[];
  jdkVersion?: string;
}

export interface PythonUploadMeta {
  venv?: string;
  pythonVersion?: string;
}

export interface ZigUploadMeta {
  zigVersion?: string;
  buildMode?: "debug" | "release";
}

export interface RustUploadMeta {
  cargoManifestPath?: string;
  rustVersion?: string;
}

export interface KotlinUploadMeta {
  jvmTarget?: string;
  kotlinVersion?: string;
}

// ============================================================================
// 4. FINAL COMPILER-SPECIFIC TYPES (USED IN YOUR SYSTEM)
// ============================================================================

export type CsharpUploadModel = CompilerUploadModel<CsharpUploadMeta>;

export type GoUploadModel = CompilerUploadModel<GoUploadMeta>;

export type JavaUploadModel = CompilerUploadModel<JavaUploadMeta>;

export type PythonUploadModel = CompilerUploadModel<PythonUploadMeta>;

export type ZigUploadModel = CompilerUploadModel<ZigUploadMeta>;

export type RustUploadModel = CompilerUploadModel<RustUploadMeta>;

export type KotlinUploadModel = CompilerUploadModel<KotlinUploadMeta>;