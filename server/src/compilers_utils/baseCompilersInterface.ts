export interface BaseCompilerInterface {
  compiler: {
    execute: (payload: any) => Promise<any>;
  };
  analysis?: {
    freeTier?: (data: any) => Promise<any>;
    paidTier?: (data: any) => Promise<any>;
  }; utils: {
    normalize: (data: any) => any;
    deepScan: (data: any) => any;
    extract: (files: any) => any;
  };
}

// export interface BaseCompilerInterface<TInput, TOutput, TAnalysis = unknown> {
//   compiler: {
//     execute: (payload: TInput) => Promise<TOutput>;
//   };
//   analysis?: {
//     freeTier?: (data: TOutput) => Promise<TAnalysis>;
//     paidTier?: (data: TOutput) => Promise<TAnalysis>;
//   };
// }