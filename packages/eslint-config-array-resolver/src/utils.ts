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
