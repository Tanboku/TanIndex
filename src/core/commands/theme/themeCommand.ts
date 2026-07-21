import { CommandType } from "../../command";
import { useTerminalConfigStore, THEMES } from "../terminal/config/terminalConfigStore";

const themeCommand: CommandType = {
  func: "theme",
  name: "主题",
  desc: "切换终端主题或查看可用主题列表",
  alias: ["color", "colorscheme"],
  params: [
    {
      key: "name",
      desc: "主题名称，不指定则显示列表",
      required: false,
    },
  ],
  options: [
    {
      key: "list",
      desc: "列出所有可用主题",
      alias: ["l"],
      type: "boolean",
      defaultValue: false,
    },
  ],
  action(options, terminal) {
    const { _, list } = options;
    const configStore = useTerminalConfigStore();
    if (list || _.length === 0) {
      terminal.writeTextSuccessResult("可用主题列表:");
      THEMES.forEach((theme) => {
        const current = configStore.theme === theme.name ? " <当前" : "";
        terminal.writeTextResult("  " + theme.name + " - " + theme.label + current);
      });
      terminal.writeTextResult("使用: theme <名称> 切换主题");
      return;
    }
    const name = _[0].toLowerCase();
    const theme = THEMES.find((t) => t.name === name);
    if (theme) {
      configStore.setTheme(name);
      terminal.writeTextSuccessResult("主题已切换为: " + theme.label);
    } else {
      terminal.writeTextErrorResult("未找到主题 \"" + name + "\"，输入 \"theme --list\" 查看可用主题");
    }
  },
};

export default themeCommand;
