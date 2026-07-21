import { defineStore } from "pinia";

/**
 * 终端配置状态存储
 *
 * @author tanmo
 */
/**
 * 主题类型
 */
export interface ThemeType {
  name: string;
  label: string;
  background: string;
  color: string;
  promptColor: string;
}

/**
 * 内置主题列表
 */
export const THEMES: ThemeType[] = [
  { name: "default", label: "经典黑", background: "black", color: "#ffffff", promptColor: "#00ff00" },
  { name: "green", label: "绿野仙踪", background: "#0a1a0a", color: "#00ff41", promptColor: "#ff6600" },
  { name: "blue", label: "深蓝海洋", background: "#0a0e27", color: "#7ec8e3", promptColor: "#00d4ff" },
  { name: "amber", label: "琥珀时光", background: "#1a0e00", color: "#ffb000", promptColor: "#ff6600" },
  { name: "purple", label: "紫夜星空", background: "#120a1a", color: "#d4b0ff", promptColor: "#b060ff" },
  { name: "white", label: "极简白", background: "#f5f5f5", color: "#333333", promptColor: "#0066cc" },
];

export const useTerminalConfigStore = defineStore("terminalConfig", {
  state: () => ({
    background: "black",
    showHint: true,
    welcomeTexts: [] as string[],
    theme: "default" as string,
    fontSize: 16,
    opacity: 0.6,
  }),
  getters: {
    currentTheme(): ThemeType {
      return THEMES.find((t) => t.name === this.theme) || THEMES[0];
    },
  },
  persist: {
    key: "terminal-config-store",
    storage: window.localStorage,
    beforeRestore: (context) => {
      console.log("load terminalConfigStore data start");
    },
    afterRestore: (context) => {
      console.log("load terminalConfigStore data end");
    },
  },
  actions: {
    setBackground(url: string) {
      if (!url) {
        return;
      }
      this.background = url;
    },
    /**
     * 设置主题
     */
    setTheme(themeName: string) {
      const theme = THEMES.find((t) => t.name === themeName);
      if (theme) {
        this.theme = themeName;
        this.background = theme.background;
      }
    },
    /**
     * 设置字体大小
     */
    setFontSize(size: number) {
      if (size >= 12 && size <= 32) {
        this.fontSize = size;
      }
    },
    /**
     * 设置透明度
     */
    setOpacity(opacity: number) {
      if (opacity >= 0 && opacity <= 1) {
        this.opacity = opacity;
      }
    },
    /**
     * 设置或反转提示
     */
    setOrToggleShowHint(hint?: string): boolean {
      if (!hint) {
        this.showHint = !this.showHint;
        return this.showHint;
      }
      if (hint === "on") {
        this.showHint = true;
      } else if (hint === "off") {
        this.showHint = false;
      }
      return this.showHint;
    },
    setWelcomeTexts(welcomeTexts: string[]) {
      this.welcomeTexts = welcomeTexts;
    },
    reset() {
      this.$reset();
    },
  },
});
