export interface CodeParts {
  functions: any[];
  arrows: any[];
  methods: any[];
  classes: any[];
}

export interface FilePayload {
  [fileName: string]: CodeParts;
}


export interface normalizedPayloadData {
  nameOfFile: string;
  functions: any[];
  arrows: any[];
  methods: any[];
}