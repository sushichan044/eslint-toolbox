/**
 * Safely execute a function in a specified directory.
 *
 * It will automatically restore the current working directory after the function is executed, regardless of whether the function throws an error or not.
 *
 * @param directory The directory to execute the function in.
 * @param function_ The function to execute.
 * @returns The result of the function.
 */
export const runInDirectory = async <T>(
  directory: string,
  function_: () => Awaitable<T>,
): Promise<T> => {
  const cwd = process.cwd();

  process.chdir(directory);

  try {
    return await function_();
  } finally {
    process.chdir(cwd);
  }
};

/**
 * Check if the ruleId is a non-empty string.
 */
export const isNonEmptyString = (
  maybeString?: unknown,
): maybeString is string => {
  return typeof maybeString === "string" && maybeString !== "";
};

type Awaitable<T> = Promise<T> | T;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NO_OP_FN = () => {};
const NO_RESULT = Symbol("NO_RESULT");

/**
 *  Execute a function with silent logs.
 *
 * `console.warn`, `console.error`, and `console.trace` will not be silenced.
 * @param function_
 * @returns
 */
export const executeWithSilentLogs = async <T>(
  function_: () => Awaitable<T>,
): Promise<T> => {
  const original = {
    debug: console.debug,
    info: console.info,
    log: console.log,
  };

  console.log = NO_OP_FN;
  console.info = NO_OP_FN;
  console.debug = NO_OP_FN;

  let res:
    | {
        data: T;
        err: null;
      }
    | {
        data: typeof NO_RESULT;
        err: Error;
      } = {
    data: NO_RESULT,
    err: new Error("No result returned from the callback"),
  };

  try {
    res = {
      data: await function_(),
      err: null,
    };
  } catch (error) {
    if (error instanceof Error) {
      res.err = error;
    } else {
      res.err = new Error(String(error));
    }
  } finally {
    console.log = original.log;
    console.info = original.info;
    console.debug = original.debug;
  }

  if (res.err) {
    throw res.err;
  }

  return res.data;
};
