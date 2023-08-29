/**
 * Compiles a function from a string.
 * @param code - The code to compile.
 * @param args - The arguments to pass to the function.
 * @returns function
 */
export function compileFunction(code, args = []) {
    try {
        return eval(`((${args.join(", ")}) => {
            try {
                ${code}
            } catch (e) {
                console.error("Could not load:", e);
            }
        })`);
    } catch(err) {
        return {
            name: err.name,
            message: err.message,
            stack: err.stack
        };
    }
}

export default {compileFunction};
