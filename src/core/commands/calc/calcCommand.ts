import { CommandType } from "../../command";

const calcCommand: CommandType = {
  func: "calc",
  name: "计算器",
  desc: "执行数学计算",
  alias: ["cal", "calculate", "math"],
  params: [
    {
      key: "expression",
      desc: "数学表达式",
      required: true,
    },
  ],
  options: [],
  action(options, terminal) {
    const { _ } = options;
    if (_.length < 1) {
      terminal.writeTextErrorResult("参数不足，请提供数学表达式");
      return;
    }
    const expression = _.join(" ");
    try {
      const sanitized = expression
        .replace(/x/gi, "*")
        .replace(/×/g, "*")
        .replace(/÷/g, "/");
      const result = Function('"use strict"; return (' + sanitized + ')')();
      if (typeof result === "number" && !isNaN(result)) {
        terminal.writeTextSuccessResult(expression + " = " + result);
      } else {
        terminal.writeTextErrorResult("无效的表达式");
      }
    } catch {
      terminal.writeTextErrorResult("计算错误，请检查表达式");
    }
  },
};

export default calcCommand;
