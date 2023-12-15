import vm from "node:vm";

declare function execute(payload: any, context: object): Promise<any>;

export const SCRIPT_TIMEOUT = 1_000;

export const runWithTimeout = async <T>(
  script: vm.Script,
  payload: any,
  context: any
): Promise<T | "timeout"> => {
  script.runInThisContext();

  const timeout = new Promise<"timeout">((resolve) =>
    setTimeout(() => resolve("timeout"), SCRIPT_TIMEOUT)
  );

  const call = new Promise<T>((resolve) =>
    setTimeout(() => execute(payload, context).then(resolve), 0)
  );

  return Promise.race([timeout, call]);
};
