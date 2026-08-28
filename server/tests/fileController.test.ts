import { FileController } from "../src/module/adapters/controllers/FileController.js";
import { expect, jest, it, describe } from "@jest/globals";

type ControllerCase = {
  name: string;
  handler: keyof Pick<
    FileController,
    | "getCsharpAnalyzer"
    | "getGoFileAnalyzer"
    | "getJavaFileAnalyzer"
    | "getPythonFileAnalyzer"
    | "getRustFileAnalyzer"
    | "get_js_ts_Analyzer"
  >;
  language: string;
  compilerTask: string;
};

const controllerCases: ControllerCase[] = [
  {
    name: "C#",
    handler: "getCsharpAnalyzer",
    language: "csharp",
    compilerTask: "csharp_compiler",
  },
  {
    name: "Go",
    handler: "getGoFileAnalyzer",
    language: "go",
    compilerTask: "go_compiler",
  },
  {
    name: "Java",
    handler: "getJavaFileAnalyzer",
    language: "java",
    compilerTask: "java_compiler",
  },
  {
    name: "Python",
    handler: "getPythonFileAnalyzer",
    language: "python",
    compilerTask: "python_compiler",
  },
  {
    name: "Rust",
    handler: "getRustFileAnalyzer",
    language: "rust",
    compilerTask: "rust_compiler",
  },
  {
    name: "TypeScript / JavaScript",
    handler: "get_js_ts_Analyzer",
    language: "typescript",
    compilerTask: "ts_js_compiler",
  },
];

function createReplyMock() {
  const reply = {
    code: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };

  return reply;
}

function createController() {
  const workerClient = {
    execute: jest.fn(),
  };

  const controller = new FileController(
    {} as any,
    {} as any,
    workerClient as any
  );

  return { controller, workerClient };
}

describe("FileController", () => {
  it.each<ControllerCase>(controllerCases)(
    "calls the $name analyzer flow with the correct language and compiler task",
    async ({ handler, language, compilerTask }: ControllerCase) => {
      const { controller, workerClient } = createController();
      const fileToStream = jest.fn().mockResolvedValue({
        success: true,
        data: [
          {
            name: "example-file.ts",
            content: "console.log('hello');",
            language,
          },
        ],
      });
      const sanitizedFiles = [
        {
          name: "example-file.ts",
          content: "console.log('hello');",
          language,
        },
      ];
      const analysisResult = {
        success: true,
        data: {
          language,
          compilerTask,
          analyzed: true,
        },
      };

      (controller as any).fileToStream = fileToStream;
      workerClient.execute
        .mockResolvedValueOnce({ success: true, data: sanitizedFiles })
        .mockResolvedValueOnce(analysisResult);

      const request = { parts: jest.fn() };
      const reply = createReplyMock();

      await (controller as any)[handler](request, reply);

      expect(fileToStream).toHaveBeenCalledWith(request, language);
      expect(workerClient.execute).toHaveBeenNthCalledWith(
        1,
        "payloadDeepScan",
        sanitizedFiles
      );
      expect(workerClient.execute).toHaveBeenNthCalledWith(
        2,
        compilerTask,
        sanitizedFiles
      );
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(analysisResult);
    }
  );

  it("returns 400 when fileToStream fails before analysis starts", async () => {
    const { controller, workerClient } = createController();
    const fileToStream = jest.fn().mockResolvedValue({
      success: false,
      data: undefined,
    });

    (controller as any).fileToStream = fileToStream;

    const request = { parts: jest.fn() };
    const reply = createReplyMock();

    await controller.getGoFileAnalyzer(request as any, reply as any);

    expect(fileToStream).toHaveBeenCalledWith(request, "go");
    expect(workerClient.execute).not.toHaveBeenCalled();
    expect(reply.code).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(undefined);
  });
});
