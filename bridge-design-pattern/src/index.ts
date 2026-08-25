// ----------------------------------- Bridge design pattern demo -----------------------------------

// --------------- Behind the scenes code / logic ---------------

// This allows us to read input from the terminal.
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Available devices to switch input too.
const AVAILABLE_DEVICES_LABEL = "TV, Sound Bar, Media Box";

// Volume range shared by all devices 
// Note: the range is between 0 and 100.
const MIN_VOLUME = 0;
const MAX_VOLUME = 100;
const DEFAULT_VOLUME = 15;

// Shared commands on every device.
const SHARED_COMMAND_HINT = "switch input | overview | quit";

// This is just used to create spacing between sections. 
// Example: printBlankLines(2) will print 2 blank lines.
function printBlankLines(count = 1): void {
  for (let i = 0; i < count; i++) {
    console.log("");
  }
}

// This just prints a visual divider between sections.
// Example: printDivider() will print a line of dashes.
function printDivider(): void {
  console.log("  ───────────────────────────────────────────────────────────");
}

// This prints a section header with spacing above and below.
// Example: printSection("DEVICE STATUS") will print a section header with the title "DEVICE STATUS".
function printSection(title: string): void {
  printBlankLines(1);
  printDivider();
  console.log(`  ${title}`);
  printDivider();
  printBlankLines(1);
}

// This prints the outcome of a command before the next screen redraws.
// Example: printResult("RESULT", "The result of the command.") will print a section header with the title "RESULT" and the result of the command.
function printResult(...lines: string[]): void {
  printSection("RESULT");
  for (const line of lines) {
    console.log(line);
  }
  printBlankLines(2);
}

// This builds the interactive prompt, e.g. "UniversalRemote [ TV ]> "
function buildPrompt(device: Device | null): string {
  const label = device ? device.name : "Device not selected";
  return `UniversalRemote [ ${label} ]> `;
}

// This prints the action the user just performed (remote delegating to the device).
function printActionPerformed(commandLabel: string, targetDevice: Device | null): void {
  const target = targetDevice ? targetDevice.name : "Device not selected";
  printBlankLines(1);
  printSection("ACTION PERFORMED");
  console.log("  [ CLICK ]");
  console.log(`  UniversalRemote ------------- ${commandLabel} -------------> [${target}]`);
  printBlankLines(1);
}

// This builds RESULT lines — device feedback first, then status or other details.
function buildResultLines(deviceFeedback: string | null, ...lines: string[]): string[] {
  const result: string[] = [];
  if (deviceFeedback) {
    result.push(`  ${deviceFeedback}`);
  }
  for (const line of lines) {
    result.push(line.startsWith("  ") ? line : `  ${line}`);
  }
  return result;
}

// This function asks the user a question and returns the answer.
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer: string) => resolve(answer.trim().toLowerCase()));
  });
}

// This returns the command list shown on screen — device-specific for LEFT / RIGHT.
function getCommandHint(device: Device | null): string {
  if (!device) {
    return `1 | 2 | 3 (connect device) | ${SHARED_COMMAND_HINT}`;
  }

  const hints = device.getRemoteButtonHints();
  return `power | up (${hints.up}) | down (${hints.down}) | left (${hints.left}) | right (${hints.right}) | ${SHARED_COMMAND_HINT}`;
}

// Universal remote (Abstraction)
// This holds a reference to a device and delegates button presses to it.
class UniversalRemote {
  constructor(private device: Device | null = null) {}

  get activeDevice(): Device | null {
    return this.device;
  }

  // Swap the device at runtime (Key aspect of the Bridge pattern).
  setDevice(device: Device): void {
    this.device = device;
  }

  // Toggle the power of the device. Returns a message to show in RESULT (if any).
  togglePower(): string | null {
    return this.device?.togglePower() ?? null;
  }

  // Press the up button on the device.
  pressUp(): string | null {
    return this.device?.upButton() ?? null;
  }

  // Press the down button on the device.
  pressDown(): string | null {
    return this.device?.downButton() ?? null;
  }

  // Press the left button on the device.
  pressLeft(): string | null {
    return this.device?.leftButton() ?? null;
  }

  // Press the right button on the device.
  pressRight(): string | null {
    return this.device?.rightButton() ?? null;
  }
}

// This is used to track the state of each device.
// Example: { isOn: true, volume: 50, channel: 3 }
interface DeviceState {
  isOn: boolean;
  volume: number;
  channel: number;
}

// This is the text hints for the UP, DOWN, LEFT, RIGHT buttons on the remote.
interface RemoteButtonHints {
  up: string;
  down: string;
  left: string;
  right: string;
}

// This is the current value of the UP/DOWN and LEFT/RIGHT buttons on the device.
interface RemoteButtonValues {
  upDown: string; // Volume — what the up and down buttons change
  leftRight: string; // Channel, input, or title — what left and right buttons change
}

// Device interface
// This is the implementor — the "how" side of the bridge.
// Every device must respond to these commands, but each device does it differently.
interface Device {
  readonly name: string;
  getStatus(): string;
  getRemoteButtonHints(): RemoteButtonHints;
  getCurrentButtonValues(): RemoteButtonValues;
  togglePower(): string;
  upButton(): string | null;
  downButton(): string | null;
  leftButton(): string | null;
  rightButton(): string | null;
}

// This saves the state of the devices when the user switches inputs.
class DeviceRegistry {
  private readonly devices: Device[] = [new TV(), new SoundBar(), new MediaBox()];

  // This gets the device based on the user's choice.
  getDevice(choice: string): Device | null {
    switch (choice) {
      case "1":
        return this.devices[0];
      case "2":
        return this.devices[1];
      case "3":
        return this.devices[2];
      default:
        return null;
    }
  }

  // This returns all devices.
  // Used for the overview option so the user can see all devices and their current state.
  getAllDevices(): Device[] {
    return [...this.devices];
  }
}

// TV - Device (Concrete Implementor)
class TV implements Device {
  readonly name = "TV";
  private static readonly MIN_CHANNEL = 1;
  private static readonly MAX_CHANNEL = 10;
  private state: DeviceState = { isOn: false, volume: DEFAULT_VOLUME, channel: 3 };

  private readonly channelDescriptions: Record<number, string> = {
    1: "The Weather Channel",
    2: "ABC News",
    3: "ESPN",
    4: "AMC",
    5: "MTV",
    6: "TNT",
    7: "Food Network",
    8: "HGTV",
    9: "Discovery Channel",
    10: "Comedy Central",
  };

  getRemoteButtonHints(): RemoteButtonHints {
    return { up: "vol + 1", down: "vol - 1", left: "channel -", right: "channel +" };
  }

  getStatus(): string {
    const power = this.state.isOn ? "ON" : "OFF";
    return `[TV] Power: ${power} | Volume: ${this.state.volume} | Channel: ${this.state.channel}`;
  }

  getCurrentButtonValues(): RemoteButtonValues {
    return {
      upDown: `${this.state.volume}`,
      leftRight: `${this.state.channel}`,
    };
  }

  private getChannelDescription(): string {
    return this.channelDescriptions[this.state.channel] ?? "Unknown channel";
  }

  togglePower(): string {
    if (this.state.isOn) {
      return this.powerOff();
    }
    return this.powerOn();
  }

  private powerOn(): string {
    this.state.isOn = true;
    return `[TV] Screen lights up. Channel ${this.state.channel} — ${this.getChannelDescription()}.`;
  }

  private powerOff(): string {
    this.state.isOn = false;
    return "[TV] Screen goes dark. Goodbye!";
  }

  upButton(): string | null {
    if (!this.state.isOn) {
      return "[TV] TV is off — press power first.";
    }

    this.state.volume = Math.min(MAX_VOLUME, this.state.volume + 1);
    return null;
  }

  downButton(): string | null {
    if (!this.state.isOn) {
      return "[TV] TV is off — press power first.";
    }

    this.state.volume = Math.max(MIN_VOLUME, this.state.volume - 1);
    return null;
  }

  rightButton(): string | null {
    if (this.state.channel >= TV.MAX_CHANNEL) {
      return `[TV] Already at channel ${TV.MAX_CHANNEL} (maximum).`;
    }

    this.state.channel += 1;
    return `[TV] Channel ${this.state.channel} — ${this.getChannelDescription()}`;
  }

  leftButton(): string | null {
    if (this.state.channel <= TV.MIN_CHANNEL) {
      return `[TV] Already at channel ${TV.MIN_CHANNEL} (minimum).`;
    }

    this.state.channel -= 1;
    return `[TV] Channel ${this.state.channel} — ${this.getChannelDescription()}`;
  }
}

// Sound bar - Device (Concrete Implementor)
class SoundBar implements Device {
  readonly name = "Sound Bar";
  private state: DeviceState = { isOn: false, volume: DEFAULT_VOLUME, channel: 1 };

  getRemoteButtonHints(): RemoteButtonHints {
    return { up: "vol + 5", down: "vol - 5", left: "input -", right: "input +" };
  }

  getStatus(): string {
    const power = this.state.isOn ? "ON" : "OFF";
    return `[Sound Bar] Power: ${power} | Volume: ${this.state.volume} | Input: HDMI ${this.state.channel}`;
  }

  getCurrentButtonValues(): RemoteButtonValues {
    return {
      upDown: `${this.state.volume}`,
      leftRight: `HDMI ${this.state.channel}`,
    };
  }

  togglePower(): string {
    if (this.state.isOn) {
      return this.powerOff();
    }
    return this.powerOn();
  }

  private powerOn(): string {
    this.state.isOn = true;
    return "[Sound Bar] Powering on... \"And it's a beautiful day at Nelson Road!\"";
  }

  private powerOff(): string {
    this.state.isOn = false;
    return "[Sound Bar] Powering down.";
  }

  upButton(): string | null {
    if (!this.state.isOn) {
      return "[Sound Bar] Sound bar is off — press power first.";
    }

    this.state.volume = Math.min(MAX_VOLUME, this.state.volume + 5);
    return null;
  }

  downButton(): string | null {
    if (!this.state.isOn) {
      return "[Sound Bar] Sound bar is off — press power first.";
    }

    this.state.volume = Math.max(MIN_VOLUME, this.state.volume - 5);
    return null;
  }

  rightButton(): string | null {
    if (!this.state.isOn) {
      return "[Sound Bar] Sound bar is off — press power first.";
    }

    this.state.channel += 1;
    return `[Sound Bar] Switched to HDMI ${this.state.channel} — Match day audio`;
  }

  leftButton(): string | null {
    if (!this.state.isOn) {
      return "[Sound Bar] Sound bar is off — press power first.";
    }

    this.state.channel = Math.max(1, this.state.channel - 1);
    return `[Sound Bar] Switched to HDMI ${this.state.channel} — Pre-game playlist`;
  }
}

// Media box - Device (Concrete Implementor)
class MediaBox implements Device {
  readonly name = "Media Box";
  private state: DeviceState = { isOn: false, volume: DEFAULT_VOLUME, channel: 1 };
  private readonly shows = [
    "Ted Lasso — Season 4",
    "Friends — Season 2",
    "The Office — Season 6",
    "Parks and Recreation - Season 3",
    "Avengers: Endgame",
    "Iron Man",
  ];

  getRemoteButtonHints(): RemoteButtonHints {
    return { up: "vol + 10%", down: "vol - 10%", left: "prev title", right: "next title" };
  }

  getStatus(): string {
    const power = this.state.isOn ? "ON" : "OFF";
    const titleLabel = this.state.isOn
      ? `Title: "${this.shows[this.state.channel - 1]}"`
      : "Title: Nothing playing...";
    return `[Media Box] Power: ${power} | Volume: ${this.state.volume}% | ${titleLabel}`;
  }

  getCurrentButtonValues(): RemoteButtonValues {
    const leftRight = !this.state.isOn
      ? "Nothing playing..."
      : `"${this.shows[this.state.channel - 1]}"`;
    return {
      upDown: `${this.state.volume}%`,
      leftRight,
    };
  }

  togglePower(): string {
    if (this.state.isOn) {
      return this.powerOff();
    }
    return this.powerOn();
  }

  private powerOn(): string {
    this.state.isOn = true;
    return `[Media Box] Booting up... Now playing: "${this.shows[this.state.channel - 1]}"`;
  }

  private powerOff(): string {
    this.state.isOn = false;
    return "[Media Box] Going to sleep. Resume anytime!";
  }

  upButton(): string | null {
    if (!this.state.isOn) {
      return "[Media Box] Media box is off — press power first.";
    }
    this.state.volume = Math.min(MAX_VOLUME, this.state.volume + 10);
    return null;
  }

  downButton(): string | null {
    if (!this.state.isOn) {
      return "[Media Box] Media box is off — press power first.";
    }
    this.state.volume = Math.max(MIN_VOLUME, this.state.volume - 10);
    return null;
  }

  rightButton(): string | null {
    if (!this.state.isOn) {
      return "[Media Box] Media box is off — press power first.";
    }
    this.state.channel = Math.min(this.shows.length, this.state.channel + 1);
    return `[Media Box] Next title: "${this.shows[this.state.channel - 1]}"`;
  }

  leftButton(): string | null {
    if (!this.state.isOn) {
      return "[Media Box] Media box is off — press power first.";
    }
    this.state.channel = Math.max(1, this.state.channel - 1);
    return `[Media Box] Previous title: "${this.shows[this.state.channel - 1]}"`;
  }
}





// --- DEMO! In the terminal, run "npm run dev" to start! ---
async function main(): Promise<void> {
  console.log("\n=============== Bridge Design Pattern: Universal Remote ===============\n");
  console.log("Notes:\n");
  console.log("- One remote. Many devices.\n");
  console.log("- The remote (abstraction) is separate from the device (implementation).\n");
  console.log("- Same buttons (UP, DOWN, LEFT, RIGHT) — each device responds differently.\n");
  console.log("------------------------------------------------------------------------\n\n\n");

  try {
    await runDemo();
  } finally {
    rl.close();
  }
}

// This prints the full status screen shown before each command prompt.
function printScreen(remote: UniversalRemote): void {
  const device = remote.activeDevice;

  printBlankLines(2);
  printSection("DEVICE STATUS");

  if (device) {
    console.log(`  Currently selected device:  ${device.name}`);
    printBlankLines(1);
    console.log(`  ${device.getStatus()}`);
    printBlankLines(1);
    const hints = device.getRemoteButtonHints();
    console.log(
      `  Remote mapping:  UP = ${hints.up}   DOWN = ${hints.down}   LEFT = ${hints.left}   RIGHT = ${hints.right}`
    );
    console.log(`  Volume range: ${MIN_VOLUME}–${MAX_VOLUME} (default ${DEFAULT_VOLUME})`);
    if (device.name === "TV") {
      console.log("  TV channels: 1–10 (default channel 3)");
    }
  } else {
    console.log("  Currently selected device:  (none — not connected yet)");
    printBlankLines(1);
    console.log("  Available device inputs:");
    console.log("    1 — TV");
    console.log("    2 — Sound Bar");
    console.log("    3 — Media Box");
    printBlankLines(1);
    console.log("  Tip: type 1, 2, or 3 — or switch input — to connect a device.");
  }

  printSection("COMMANDS");
  console.log(`  ${getCommandHint(device)}`);
  printBlankLines(2);
}

// This warns the user when they try a command with no device connected.
function warnNoDevice(): void {
  console.log("  No device connected.");
  console.log("  Type switch input — or just 1, 2, or 3 — to pick TV, Sound Bar, or Media Box.");
}

// This prints the current state of every device input.
function printOverview(registry: DeviceRegistry): void {
  printSection("OVERVIEW");
  for (const device of registry.getAllDevices()) {
    console.log(`  ${device.getStatus()}`);
  }
  printBlankLines(2);
}

// This connects a device and prints a confirmation message.
function connectDevice(device: Device): void {
  printResult(`  Currently selected device: ${device.name}`, `  ${device.getStatus()}`);
}

// This returns the RESULT label for LEFT / RIGHT based on the active device.
function getLeftRightResultLabel(device: Device): string {
  switch (device.name) {
    case "TV":
      return "Current channel";
    case "Sound Bar":
      return "Current input";
    default:
      return "Current title";
  }
}

// This function lets the user pick a device and send commands through the remote.
async function runDemo(): Promise<void> {
  const registry = new DeviceRegistry();
  const remote = new UniversalRemote();

  console.log("Pick a device input to control:\n");
  console.log("  1 — TV");
  console.log("  2 — Sound Bar");
  console.log("  3 — Media Box");
  console.log("\n  (or press Enter to start with no device selected) \n\n");

  const choice = await question("Question: Which device input? [1/2/3]: ");
  const initialDevice = choice === "" ? null : registry.getDevice(choice);

  if (choice !== "" && !initialDevice) {
    console.log("\n  Unknown choice — starting with no device selected.\n");
  } else if (initialDevice) {
    remote.setDevice(initialDevice);
    console.log(`\n  Currently selected device: ${initialDevice.name}`);
    console.log(`  Available device inputs: [${AVAILABLE_DEVICES_LABEL}]\n`);
  } else {
    console.log("\n  Currently selected device: (none)");
    console.log(`  Available device inputs: [${AVAILABLE_DEVICES_LABEL}]`);
    console.log("  Tip: type switch input (or 1, 2, or 3) to connect a device.\n");
  }

  let running = true;
  while (running) {
    printScreen(remote);

    const command = await question(buildPrompt(remote.activeDevice));

    // Shortcut: typing 1, 2, or 3 connects a device directly (same as switch input).
    if (command === "1" || command === "2" || command === "3") {
      const pickedDevice = registry.getDevice(command);
      if (pickedDevice) {
        printActionPerformed(`connect ${pickedDevice.name}`, pickedDevice);
        remote.setDevice(pickedDevice);
        connectDevice(pickedDevice);
      }
      continue;
    }

    switch (command) {
      case "power": {
        printActionPerformed("power", remote.activeDevice);
        if (!remote.activeDevice) {
          warnNoDevice();
          printBlankLines(2);
          break;
        }
        const feedback = remote.togglePower();
        printResult(...buildResultLines(feedback, remote.activeDevice.getStatus()));
        break;
      }
      case "up":
      case "vol+": {
        printActionPerformed("UP (volume +)", remote.activeDevice);
        if (!remote.activeDevice) {
          warnNoDevice();
          printBlankLines(2);
          break;
        }
        const feedback = remote.pressUp();
        const values = remote.activeDevice.getCurrentButtonValues();
        printResult(...buildResultLines(feedback, `Current volume: ${values.upDown}`));
        break;
      }
      case "down":
      case "vol-": {
        printActionPerformed("DOWN (volume -)", remote.activeDevice);
        if (!remote.activeDevice) {
          warnNoDevice();
          printBlankLines(2);
          break;
        }
        const feedback = remote.pressDown();
        const values = remote.activeDevice.getCurrentButtonValues();
        printResult(...buildResultLines(feedback, `Current volume: ${values.upDown}`));
        break;
      }
      case "left":
      case "ch-":
      case "input-":
      case "prev": {
        const device = remote.activeDevice;
        const hints = device?.getRemoteButtonHints();
        const leftHint = hints?.left ?? "left";
        printActionPerformed(`LEFT (${leftHint})`, device);
        if (!device) {
          warnNoDevice();
          printBlankLines(2);
          break;
        }
        const feedback = remote.pressLeft();
        const values = device.getCurrentButtonValues();
        printResult(
          ...buildResultLines(
            feedback,
            `${getLeftRightResultLabel(device)}: ${values.leftRight}`,
            device.getStatus()
          )
        );
        break;
      }
      case "right":
      case "ch+":
      case "input+":
      case "next": {
        const device = remote.activeDevice;
        const hints = device?.getRemoteButtonHints();
        const rightHint = hints?.right ?? "right";
        printActionPerformed(`RIGHT (${rightHint})`, device);
        if (!device) {
          warnNoDevice();
          printBlankLines(2);
          break;
        }
        const feedback = remote.pressRight();
        const values = device.getCurrentButtonValues();
        printResult(
          ...buildResultLines(
            feedback,
            `${getLeftRightResultLabel(device)}: ${values.leftRight}`,
            device.getStatus()
          )
        );
        break;
      }
      case "switch input":
      case "switch": {
        printActionPerformed("switch input", remote.activeDevice);
        printBlankLines(1);
        console.log("  Available device inputs:");
        console.log("    1 — TV");
        console.log("    2 — Sound Bar");
        console.log("    3 — Media Box");
        printBlankLines(1);
        const newChoice = await question("  Question: Which device input? [1/2/3]: ");
        const newDevice = registry.getDevice(newChoice);
        if (!newDevice) {
          printResult("  Unknown choice — device not changed.");
          break;
        }
        remote.setDevice(newDevice);
        connectDevice(newDevice);
        break;
      }
      case "overview": {
        printActionPerformed("overview", remote.activeDevice);
        printOverview(registry);
        break;
      }
      case "quit":
      case "q":
        printActionPerformed("quit", remote.activeDevice);
        printBlankLines(1);
        console.log("  Putting the remote down. Have a good day!");
        printBlankLines(2);
        running = false;
        break;
      default:
        printBlankLines(1);
        console.log(`  Unknown command: "${command}" \n`);
        console.log(`  Try one of the following commands: `);
        console.log(`  ${getCommandHint(remote.activeDevice)}`);
        printBlankLines(2);
    }
  }
}

void main();
