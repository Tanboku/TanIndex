<template>
  <div
    class="tan-terminal-wrapper"
    :style="wrapperStyle"
    @click="handleClickWrapper"
  >
    <div ref="terminalRef" class="tan-terminal" :style="mainStyle">
      <a-collapse
        v-model:activeKey="activeKeys"
        :bordered="false"
        expand-icon-position="right"
      >
        <template v-for="(output, index) in outputList" :key="index">
          <a-collapse-panel
            v-if="output.collapsible"
            :key="index"
            class="terminal-row"
            :style="{ color: textColor }"
          >
            <template #header>
              <span style="user-select: none; margin-right: 10px">
                {{ prompt }}
              </span>
              <span>{{ output.text }}</span>
            </template>
            <div
              v-for="(result, idx) in output.resultList"
              :key="idx"
              class="terminal-row"
              :style="{ color: textColor, fontSize: fontSizePx }"
            >
              <content-output :output="result" />
            </div>
          </a-collapse-panel>
          <template v-else>
            <template v-if="output.type === 'command'">
              <div class="terminal-row" :style="{ color: textColor, fontSize: fontSizePx }">
                <span style="user-select: none; margin-right: 10px">{{
                  prompt
                }}</span>
                <span>{{ output.text }}</span>
              </div>
              <div
                v-for="(result, idx) in output?.resultList"
                :key="idx"
                class="terminal-row"
                :style="{ color: textColor, fontSize: fontSizePx }"
              >
                <content-output :output="result" />
              </div>
            </template>
            <template v-else>
              <div class="terminal-row" :style="{ color: textColor, fontSize: fontSizePx }">
                <content-output :output="output" />
              </div>
            </template>
          </template>
        </template>
      </a-collapse>
      <div class="terminal-row" :style="{ color: textColor, fontSize: fontSizePx }">
        <a-input
          ref="commandInputRef"
          v-model:value="inputCommand.text"
          :disabled="isRunning"
          class="command-input"
          :placeholder="inputCommand.placeholder"
          :bordered="false"
          autofocus
          @press-enter="doSubmitCommand"
        >
          <template #addonBefore>
            <span class="command-input-prompt" :style="{ color: configStore.currentTheme.promptColor }">{{ prompt }}</span>
          </template>
        </a-input>
      </div>
      <div v-if="hint && !isRunning" class="terminal-row" style="color: #bbb">
        hint：{{ hint }}
      </div>
      <div style="margin-bottom: 16px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  Ref,
  ref,
  StyleValue,
  toRefs,
  watchEffect,
} from "vue";
import CommandOutputType = TanTerminal.CommandOutputType;
import OutputType = TanTerminal.OutputType;
import CommandInputType = TanTerminal.CommandInputType;
import { registerShortcuts } from "./shortcuts";
import TerminalType = TanTerminal.TerminalType;
import TextOutputType = TanTerminal.TextOutputType;
import useHistory from "./history";
import ContentOutput from "./ContentOutput.vue";
import OutputStatusType = TanTerminal.OutputStatusType;
import { useTerminalConfigStore } from "../../core/commands/terminal/config/terminalConfigStore";
import useHint from "./hint";
import UserType = User.UserType;
import { LOCAL_USER } from "../../core/commands/user/userConstant";

interface TanTerminalProps {
  height?: string | number;
  fullScreen?: boolean;
  user?: UserType;
  onSubmitCommand?: (inputText: string) => void;
}

const props = withDefaults(defineProps<TanTerminalProps>(), {
  height: "400px",
  fullScreen: false,
  user: LOCAL_USER as any,
});

const { user } = toRefs(props);

const terminalRef = ref();
const activeKeys = ref<number[]>([]);
const outputList = ref<OutputType[]>([]);
const commandList = ref<CommandOutputType[]>([]);
const commandInputRef = ref();

const isRunning = ref(false);

const configStore = useTerminalConfigStore();

const textColor = computed(() => configStore.currentTheme.color);
const fontSizePx = computed(() => configStore.fontSize + "px");

const initCommand: CommandInputType = {
  text: "",
  placeholder: "",
};

const inputCommand = ref<CommandInputType>({
  ...initCommand,
});

let currentNewCommand: CommandOutputType;

const {
  commandHistoryPos,
  showPrevCommand,
  showNextCommand,
  listCommandHistory,
} = useHistory(commandList.value, inputCommand);

const { hint, setHint, debounceSetHint } = useHint();

const doSubmitCommand = async () => {
  isRunning.value = true;
  setHint("");
  let inputText = inputCommand.value.text;
  if (inputText.startsWith("!")) {
    const commandIndex = Number(inputText.substring(1));
    const command = commandList.value[commandIndex - 1];
    if (command) {
      inputText = command.text;
    }
  }
  const newCommand: CommandOutputType = {
    text: inputText,
    type: "command",
    resultList: [],
  };
  currentNewCommand = newCommand;
  await props.onSubmitCommand?.(inputText);
  outputList.value.push(newCommand);
  if (inputText) {
    commandList.value.push(newCommand);
    commandHistoryPos.value = commandList.value.length;
  }
  inputCommand.value = { ...initCommand };
  activeKeys.value.push(outputList.value.length - 1);
  setTimeout(() => {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
  }, 50);
  isRunning.value = false;
};

watchEffect(() => {
  debounceSetHint(inputCommand.value.text);
});

const prompt = computed(() => {
  return `[${user.value.username}]$`;
});

const mainStyle = computed(() => {
  const fullScreenStyle: StyleValue = {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  const baseStyle = props.fullScreen
    ? fullScreenStyle
    : {
        height: props.height,
      };
  const bg = configStore.background;
  if (bg.startsWith("http")) {
    return baseStyle;
  }
  return {
    ...baseStyle,
    background: "rgba(0, 0, 0, " + configStore.opacity + ")",
  };
});

const wrapperStyle = computed(() => {
  const { background } = configStore;
  const style: StyleValue = {
    ...mainStyle.value,
  };
  if (background.startsWith("http")) {
    style.background = "url(" + background + ")";
  } else {
    style.background = background;
  }
  return style;
});

const clear = () => {
  outputList.value = [];
};

const writeTextResult = (text: string, status?: OutputStatusType) => {
  const newOutput: TextOutputType = {
    text,
    type: "text",
    status,
  };
  currentNewCommand.resultList.push(newOutput);
};

const writeTextErrorResult = (text: string) => {
  writeTextResult(text, "error");
};

const writeTextSuccessResult = (text: string) => {
  writeTextResult(text, "success");
};

const writeResult = (output: OutputType) => {
  currentNewCommand.resultList.push(output);
};

const writeTextOutput = (text: string, status?: OutputStatusType) => {
  const newOutput: TextOutputType = {
    text,
    type: "text",
    status,
  };
  outputList.value.push(newOutput);
};

const setCommandCollapsible = (collapsible: boolean) => {
  currentNewCommand.collapsible = collapsible;
};

const writeOutput = (newOutput: OutputType) => {
  outputList.value.push(newOutput);
};

const focusInput = () => {
  commandInputRef.value.focus();
};

const isInputFocused = () => {
  return (
    (commandInputRef.value.input as HTMLInputElement) == document.activeElement
  );
};

const setTabCompletion = () => {
  if (hint.value) {
    inputCommand.value.text = `${hint.value.split(" ")[0]}${
      hint.value.split(" ").length > 1 ? " " : ""
    }`;
  }
};

const toggleAllCollapse = () => {
  if (activeKeys.value.length === 0) {
    activeKeys.value = outputList.value.map((_, index) => {
      return index;
    });
  } else {
    activeKeys.value = [];
  }
};

const terminal: TerminalType = {
  writeTextResult,
  writeTextErrorResult,
  writeTextSuccessResult,
  writeResult,
  writeTextOutput,
  writeOutput,
  clear,
  focusInput,
  isInputFocused,
  setTabCompletion,
  doSubmitCommand,
  showNextCommand,
  showPrevCommand,
  listCommandHistory,
  toggleAllCollapse,
  setCommandCollapsible,
};

onMounted(() => {
  registerShortcuts(terminal);
  const { welcomeTexts } = configStore;
  if (welcomeTexts?.length > 0) {
    welcomeTexts.forEach((welcomeText) => {
      terminal.writeTextOutput(welcomeText);
    });
  } else {
    terminal.writeTextOutput(
      `Welcome to TanIndex, coolest browser index for geeks!` +
        `<a href="//github.com/liyupi/yuindex" target='_blank'> GitHub Open Source</a>`
    );
    terminal.writeTextOutput(
      `Author <a href="//docs.qq.com/doc/DUFFRVWladXVjeUxW" target="_blank">coder_tanmo</a>` +
        `: please input 'help' to enjoy`
    );
    terminal.writeTextOutput("<br/>");
  }
});

function handleClickWrapper(event: Event): void {
  //@ts-ignore
  if (event.target.className === "tan-terminal") {
    focusInput();
  }
}

defineExpose({
  terminal,
});
</script>

<style scoped>
.tan-terminal-wrapper {
  background: black;
}

.tan-terminal {
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  overflow: scroll;
}

.tan-terminal::-webkit-scrollbar {
  display: none;
}

.tan-terminal
  :deep(.ant-collapse-icon-position-right
    > .ant-collapse-item
    > .ant-collapse-header) {
  color: white;
  padding: 0;
}

.tan-terminal :deep(.ant-collapse) {
  background: none;
}

.tan-terminal :deep(.ant-collapse-borderless > .ant-collapse-item) {
  border: none;
}

.tan-terminal :deep(.ant-collapse-content > .ant-collapse-content-box) {
  padding: 0;
}

.command-input {
  caret-color: white;
}

.command-input :deep(input) {
  color: white !important;
  font-size: 16px;
  padding: 0 10px;
}

.command-input :deep(.ant-collapse-content > .ant-collapse-content-box) {
  padding: 0;
}

.command-input :deep(.ant-input-group-addon) {
  background: none;
  border: none;
  padding: 0;
}

.command-input-prompt {
  background: transparent;
}

.terminal-row {
  font-family: courier-new, courier, monospace;
}
</style>
