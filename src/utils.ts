import * as path from "jsr:@std/path@1";

/**
 * Nice colors for printing things to the console in a non brain-hurt way. 
 */
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Helper function for sleeping for a given number of milliseconds. 
 * @param ms The number of milliseconds to sleep for.
 * @returns A promise that resolves after the given number of milliseconds.
 */
export function sleep({ ms }: { ms: number }): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper function for logging to the console with a given color. 
 * @param message The message to log.
 * @param color The color to log the message in.
 * @returns void
 */
function _logWithColor(message: string, color: keyof typeof colors): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Helper function for logging to the console with a given color.
 * @param message The message to log.
 * @param color The color to log the message in.
 * @returns void
 */
export function textWithColor(
  message: string,
  color: keyof typeof colors,
): string {
  return `${colors[color]}${message}${colors.reset}`;
}

/**
 * Helper function for logging to the console with a given color.
 * @param message The message to log.
 * @param integerSelect The integer to select the color.
 * @param returnColor Whether to return a color object or a string. 
 * @returns Record<string, string> | string
 * 
 */
export function textWithIntSelectedColor(
  message: string,
  integerSelect: number,
  returnColor: boolean,
): Record<string, string> | string {
  // for cycling through updates and changing colors on the go
  const choices: (keyof typeof colors)[] = Object.keys(colors).filter((color) =>
    color !== "reset"
  ) as (keyof typeof colors)[];
  const index = (integerSelect - 1) % choices.length; // Subtracting 1 because arrays are 0-indexed
  const colorChoice: keyof typeof colors = choices[index];
  if (!returnColor) {
    return `${colors[colorChoice]}${message}${colors.reset}`;
  } else {
    return {
      text: `${colors[colorChoice]}${message}${colors.reset}`,
      color: colorChoice,
    };
  }
}


/**
 * Helper function for running many async functions concurrently. 
 * @param n The number of times to run the function.
 * @param callable The function to run.
 * @param callableArgs The arguments to pass to the function.
 * @returns An array of resolved promises Promise<TReturn[]> 
 *
 */
export const runMany = async <TArgs, TReturn>({
  n,
  callable,
  callableArgs,
}: {
  n: number;
  callable: (callableArgs: TArgs) => Promise<TReturn>;
  callableArgs: TArgs;
}): Promise<TReturn[]> => {
  const t0 = performance.now();

  // Create an array of Promises by invoking the callable function `n` times
  const tasks = Array.from({ length: n }, () => callable(callableArgs));

  const results = await Promise.all(tasks);

  const t1 = performance.now();
  console.log(
    `This call executed ${
      textWithColor(String(n), "yellow")
    } times.\nThe total time taken was ${
      textWithColor((t1 - t0).toFixed(3), "green")
    } milliseconds.\nThe average time per execution was ${
      textWithColor(((t1 - t0) / n).toFixed(3), "magenta")
    } milliseconds.`,
  );
  return results;
};

/**
 * Helper function for getting the mime type of a file based on its extension. 
 * @param filePath The path to the file.
 * @returns The mime type of the file. 
 *
 */
export const getMimeType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".txt": "text/plain",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    // Add more as needed
  };
  return mimeTypes[ext] || "application/octet-stream";
};
