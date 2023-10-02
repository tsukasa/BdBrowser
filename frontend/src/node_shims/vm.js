/**
 * Compiles a function from a string.
 * @param code - The code to compile.
 * @param args - The arguments to pass to the function.
 * @returns function
 */
export function compileFunction(code, args = []) {
    try {
        // eslint-disable-next-line no-eval
        return eval(`((${args.join(", ")}) => {
            try {
                ${code}
            }
            catch (e) {
                console.error("Could not load:", e);
            }
        })`);
    }
    catch (error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }
}

export default {compileFunction};
