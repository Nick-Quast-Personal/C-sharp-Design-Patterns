// ----------------------------------- Adapter design pattern demo -----------------------------------

// --------------- Behind the scenes code / logic ---------------

// This allows us to read input from the terminal.
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// City details
interface City {
  readonly name: string;
  readonly state: string;
  readonly country: string;
}

// This formats the city details for display (e.g. "Phoenix, Arizona, USA").
function formatCity(city: City): string {
  return `${city.name}, ${city.state}, ${city.country}`;
}

// Cities available in the legacy weather API.
const AVAILABLE_CITIES: readonly City[] = [
  { name: "Phoenix", state: "Arizona", country: "USA" },
  { name: "London", state: "England", country: "UK" },
  { name: "Tokyo", state: "Tokyo", country: "Japan" },
];

// Roles in the adapter pattern — used to label each step in the demo.
type PatternRole = "CLIENT" | "ADAPTER" | "ADAPTEE";

// Display labels for each pattern role in the demo.
const ROLE_LABELS: Record<PatternRole, string> = {
  CLIENT: "CLIENT - Weather App",
  ADAPTER: "ADAPTER - CelsiusToFahrenheitAdapter",
  ADAPTEE: "ADAPTEE - LegacyCelsiusWeatherApi",
};

// Prints the step number, the role, and the message for the demo.
function printFlowStep(step: number, total: number, role: PatternRole, message: string): void {
  console.log(`\n  Step ${step}/${total}  [${ROLE_LABELS[role]}]`);
  console.log(`           ${message}`);
}

// Asks the user a question and returns the answer.
function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer: string) => resolve(answer.trim()));
  });
}

// Waits for the user to press Enter before the demo starts.
async function pressEnterToStart(): Promise<void> {
  await question("\n        Press Enter to start");
}

// Waits for the user to press Enter before showing the next step.
async function pressEnterToContinue(): Promise<void> {
  await question("\n        Press Enter to continue");
}

// Checks if the answer is yes.
function yes(answer: string): boolean {
  const normalized = answer.toLowerCase();
  return normalized === "y" || normalized === "yes";
}

// Checks if the user wants to continue the demo.
function wantsToContinue(answer: string): boolean {
  const normalized = answer.toLowerCase();
  return normalized === "c" || normalized === "continue";
}

// Asks the user whether to continue or exit the demo.
//    Note, Empty or invalid input will re-prompt the user until they type continue or exit.
async function askContinueOrExit(): Promise<boolean> {
  while (true) {
    const answer = await question("\n  Continue or exit? [continue/exit]: ");
    const normalized = answer.toLowerCase();

    if (wantsToContinue(normalized)) {
      return true;
    }

    if (normalized === "exit" || normalized === "e" || normalized === "quit" || normalized === "q") {
      return false;
    }
  }
}

// Checks if the selected city is a valid choice (1, 2, or 3) from the list.
function isValidCityChoice(choice: string): boolean {
  if (choice.length === 0) {
    return false;
  }

  const parsed = Number.parseInt(choice, 10);
  return !Number.isNaN(parsed) && parsed >= 1 && parsed <= AVAILABLE_CITIES.length;
}

// Converts Celsius to Fahrenheit.
//     Note, the formula is: (C × 1.8) + 32 = F
function celsiusToFahrenheit(celsius: number): number {
  return celsius * 1.8 + 32;
}


function printDivider(): void {
  console.log("  ───────────────────────────────────────────────────────────");
}

// Prints a diagram of how the pattern works.
function printPatternDiagram(): void {
  console.log("  How the pieces connect:\n");
  console.log("    [ CLIENT ]              [ TARGET ]                    [ ADAPTER (Man in the middle) ]");
  console.log("    Weather App     ->    FahrenheitWeatherProvider   ->  CelsiusToFahrenheitAdapter");
  console.log("    (wants °F)                                                (translates/converts)");
  console.log("                                                               |");
  console.log("                                                               v");
  console.log("                                                           [ ADAPTEE ]");
  console.log("                                                           LegacyCelsiusWeatherApi");
  console.log("                                                           (only gives °C)");
}


// Weather app (Client)
// This is the weather app that the user will interact with.
// It only talks to the FahrenheitWeatherProvider interface.
class WeatherApp {
  constructor(
    private readonly weatherProvider: FahrenheitWeatherProvider,
    private readonly onDemoStep?: (role: PatternRole, message: string) => Promise<void>
  ) {}

  // This method is called by the user to display the weather data.
  async displayWeather(city: City): Promise<WeatherReading> {
    // Format the city details for display (e.g. "Phoenix, Arizona, USA").
    const location = formatCity(city);

    // Show the user that the weather app is requesting the temperature in Fahrenheit.
    await this.onDemoStep?.(
      "CLIENT",
      `I need the temperature for "${location}" in Fahrenheit (°F) via FahrenheitWeatherProvider.`
      );

    // Call the weather provider to get the temperature in Fahrenheit.
    const reading = await this.weatherProvider.getTemperatureF(city);

    // Show the user that the weather app has received the temperature in Fahrenheit.
    await this.onDemoStep?.(
      "CLIENT",
      `Got ${reading.temperatureF.toFixed(1)} °F — ready to show in the Weather App.`
    );

    // Return the weather reading to the weather app.
    return reading;
  }
}

// Fahrenheit weather provider (Target)
// This is the interface our weather app expects.
// The app only knows how to work with Fahrenheit temperatures.
//    What this is saying: 
//    Give me a city, and I’ll eventually give you back a WeatherReading in Fahrenheit.
interface FahrenheitWeatherProvider {
  getTemperatureF(city: City): Promise<WeatherReading>;
}

// Weather reading object
// This is the object that the app will use to display the weather data.
interface WeatherReading {
  readonly city: City;
  readonly temperatureF: number;
  readonly sourceCelsius: number;
}

// Legacy Celsius weather API (Adaptee)
// This is the old third party API that we can't change.
// It only returns temperatures in Celsius.
class LegacyCelsiusWeatherApi {
  // Hardcoded legacy data in Celsius.
  private readonly temperaturesC: Record<string, number> = {
    phoenix: 38.0,
    london: 15.0,
    tokyo: 28.5,
  };

  // This method is called by the celsiusToFahrenheitAdapter to get the temperature in Celsius.
  fetchTemperatureC(city: City): number {
    const key = city.name.toLowerCase();
    const tempC = this.temperaturesC[key];

    if (tempC === undefined) {
      throw new Error(`Legacy API: no data for "${formatCity(city)}"`);
    }

    return tempC;
  }
}

// Celsius to Fahrenheit adapter (Adapter)
// This class implements the Target interface (FahrenheitWeatherProvider)
// and wraps the Adaptee (LegacyCelsiusWeatherApi).
// It fetches Celsius data and converts it to Fahrenheit for the app.
class CelsiusToFahrenheitAdapter implements FahrenheitWeatherProvider {
  constructor(
    private readonly legacyApi: LegacyCelsiusWeatherApi,
    private readonly onDemoStep?: (role: PatternRole, message: string) => Promise<void>
  ) {}

  // This method is called by the weather app to get the temperature in Fahrenheit.
  async getTemperatureF(city: City): Promise<WeatherReading> {
    const location = formatCity(city);

    await this.onDemoStep?.(
      "ADAPTER",
      `Received request for "${location}" in Fahrenheit. I fix two mismatches: method name (getTemperatureF vs fetchTemperatureC) and units (°F vs °C).`
    );

    // Call the legacy API (returns Celsius)
    const tempC = this.legacyApi.fetchTemperatureC(city);
    await this.onDemoStep?.(
      "ADAPTEE",
      `fetchTemperatureC("${location}") returned ${tempC} °C (Celsius only).`
    );

    // Convert to Fahrenheit so the app can use it
    const tempF = celsiusToFahrenheit(tempC);
    await this.onDemoStep?.(
      "ADAPTER",
      `Converting ${tempC} °C → (${tempC} × 1.8) + 32 = ${tempF.toFixed(1)} °F`
    );

    return {
      city,
      temperatureF: tempF,
      sourceCelsius: tempC,
    };
  }
}


// This shows what happens if the app used the legacy API without an adapter.
function printWithoutAdapterBrokenDisplay(city: City, rawCelsius: number): void {
  printDivider();
  console.log("\n  WITHOUT ADAPTER — if the app used the legacy API directly:");
  console.log(`  Location:    ${formatCity(city)}`);
  console.log(
    `  Temperature: ${rawCelsius.toFixed(1)} °F   <-- WRONG! API returned ${rawCelsius} °C`
  );
  console.log(
    `\n  The app always labels values as Fahrenheit, so ${rawCelsius} °C would show as "${rawCelsius.toFixed(1)} °F".`
  );
  console.log(`  Correct value should be ${celsiusToFahrenheit(rawCelsius).toFixed(1)} °F.`);
  printDivider();
}




// --- DEMO! In the terminal, run "npm run dev" to start! ---
async function main(): Promise<void> {
  console.log("\n=============== Adapter Design Pattern: Weather App ================\n");
  console.log("  --------------- Notes ---------------------------------------------------");
  console.log("  Weather App: Only displays Fahrenheit.");
  console.log("  Weather data: Comes from an old third-party API that only returns Celsius.");
  console.log("  Adapter: Used to convert Celsius to Fahrenheit.\n");

  printPatternDiagram();

  console.log("  -------------------------------------------------------------------------");

  const legacyApi = new LegacyCelsiusWeatherApi();

  try {
    await runWeatherDemo(legacyApi);
  } finally {
    rl.close();
  }
}

// Create flow callbacks that pause and show each step as the pattern runs.
function createFlowCallbacks(
  totalSteps: number,
  getStep: () => number,
  advanceStep: () => void
): (role: PatternRole, message: string) => Promise<void> {
  return async (role, message) => {
    printFlowStep(getStep(), totalSteps, role, message);
    advanceStep();
    await pressEnterToContinue();
  };
}

// Run the interactive weather demo
// This function walks the user through each step of the adapter pattern demo.
async function runWeatherDemo(legacyApi: LegacyCelsiusWeatherApi): Promise<void> {
  let keepGoing = true;

  while (keepGoing) {
    console.log("\n");
    printDivider();
    console.log("  Available cities:");
    AVAILABLE_CITIES.forEach((city, index) => {
      console.log(`    ${index + 1}. ${formatCity(city)}`);
    });
    printDivider();

    const choice = await question(`\n  Please select a city [1-${AVAILABLE_CITIES.length}]: `);

    if (!isValidCityChoice(choice)) {
      keepGoing = await askContinueOrExit();
      continue;
    }

    const city = AVAILABLE_CITIES[Number.parseInt(choice, 10) - 1];

    const totalSteps = 5;
    let currentStep = 1;
    const onDemoStep = createFlowCallbacks(totalSteps, () => currentStep, () => {
      currentStep += 1;
    });

    const adapter = new CelsiusToFahrenheitAdapter(legacyApi, onDemoStep);
    const app = new WeatherApp(adapter, onDemoStep);

    console.log(`\n  You picked ${formatCity(city)}. Watch each step of the adapter pattern.`);
    await pressEnterToStart();

    const reading = await app.displayWeather(city);

    printDivider();
    console.log("\n  WEATHER APP");
    console.log(`  Location:    ${formatCity(reading.city)}`);
    console.log(`  Temperature: ${reading.temperatureF.toFixed(1)} °F`);
    printDivider();

    const showRaw = await question(
      "\n  Want to see what happens WITHOUT the adapter? [y/n]: "
    );
    if (yes(showRaw)) {
      const rawCelsius = legacyApi.fetchTemperatureC(city);
      printWithoutAdapterBrokenDisplay(city, rawCelsius);
    }

    keepGoing = await askContinueOrExit();
  }

  console.log("\n  Thanks for using the Weather App. Goodbye!\n");
}

void main();
