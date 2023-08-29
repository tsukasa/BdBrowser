/**
 * Compiles a function from a string.
 * @param code - The code to compile.
 * @param args - The arguments to pass to the function.
 * @returns function
 */
export function compileFunction(code, args = []) {
    return eval(`((${args.join(", ")}) => {
        try {
            ${code}
        } catch (e) {
            console.error("Could not load:", e);
            return {
                name: e.name,
                message: e.message,
                stack: e.stack
            };
        }
    })`);
}

export default {compileFunction};
