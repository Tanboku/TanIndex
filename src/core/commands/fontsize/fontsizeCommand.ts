import { CommandType } from "../../command";
import { useTerminalConfigStore } from "../terminal/config/terminalConfigStore";

const fontsizeCommand: CommandType = {
  func: "fontsize",
  name: "字体大小",
  desc: "设置终端字体大小(12-32)",
  alias: ["fs", "font-size"],
  params: [
    {
      key: "size",
      desc: "字体大小(12-32)",
      required: false,
    },
  ],
  options: [],
  action(options, terminal) {
    const { _ } = options;
    const configStore = useTerminalConfigStore();
    if (_.length < 1) {
      terminal.writeTextResult("当前字体大小: " + configStore.fontSize);
      terminal.writeTextResult("使用: fontsize <数字> 设置字体大小(12-32)");
      return;
    }
    const size = parseInt(_[0]);
    if (isNaN(size) || size < 12 || size > 32) {
      terminal.writeTextErrorResult("字体大小必须在 12-32 之间");
      return;
    }
    configStore.setFontSize(size);
    terminal.writeTextSuccessResult("字体大小已设置为: " + size);
  },
};

export default fontsizeCommand;
