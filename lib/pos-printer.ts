/**
 * POS receipt printing.
 *
 * Two paths, because we don't control what printer driver setup exists on
 * the till PC and the Xprinter-style handheld Bluetooth printers in this
 * category ship with inconsistent/undocumented Bluetooth profiles:
 *
 * 1. DIRECT BLUETOOTH (best-effort, "bonus" path) — uses the Web Bluetooth
 *    API to talk to the printer straight from the browser with raw ESC/POS
 *    commands. Only works if: (a) the browser supports Web Bluetooth
 *    (Chrome/Edge on Windows, Android, macOS, ChromeOS — NOT Safari/iOS,
 *    NOT Firefox), and (b) this specific printer exposes a Bluetooth LE
 *    GATT service with a writable characteristic (many cheap thermal
 *    printers instead use *Classic* Bluetooth/SPP, which Web Bluetooth
 *    cannot reach at all — there's no reliable way to know without trying
 *    on the real device). When it works, printing is instant with no
 *    dialog.
 *
 * 2. PRINT DIALOG (the reliable path) — formats the receipt as a narrow
 *    monospace slip and opens the browser's normal print dialog. This
 *    works with ANY printer Windows already knows about, regardless of how
 *    it's connected — including a Bluetooth printer paired the normal way
 *    in Windows Settings (which creates an "Outgoing COM Port") and
 *    installed as a generic / text-only printer. This is the path to rely
 *    on; direct Bluetooth is a nice-to-have on top of it.
 */

const STORAGE_KEY = "styledke_pos_paper_width";

// Candidate BLE services seen across various generic/clone thermal printer
// boards (the same handful of chipsets get reused under many brand names).
// We don't assume any one of these is right — connectPrinter() walks every
// service on the device and grabs the first writable characteristic it
// finds, so this list only needs to be "included so the picker/GATT server
// allows us to see the service at all," not exactly correct.
const KNOWN_PRINTER_SERVICES = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
];

let btDevice: BluetoothDevice | null = null;
let writeChar: BluetoothRemoteGATTCharacteristic | null = null;

export function isBluetoothSupported(): boolean {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export function getPaperWidth(): 58 | 80 {
  if (typeof window === "undefined") return 58;
  return window.localStorage.getItem(STORAGE_KEY) === "80" ? 80 : 58;
}

export function setPaperWidth(width: 58 | 80) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(width));
}

export function getConnectedPrinterName(): string | null {
  return btDevice?.gatt?.connected ? btDevice.name || "Bluetooth printer" : null;
}

async function findWritableCharacteristic(
  server: BluetoothRemoteGATTServer
): Promise<BluetoothRemoteGATTCharacteristic> {
  const services = await server.getPrimaryServices();
  for (const service of services) {
    const chars = await service.getCharacteristics();
    for (const c of chars) {
      if (c.properties.write || c.properties.writeWithoutResponse) return c;
    }
  }
  throw new Error(
    "Connected, but this printer didn't offer a writable Bluetooth channel — it may use classic Bluetooth pairing instead. Use the Print dialog option below."
  );
}

/** Opens the browser's Bluetooth picker. Must run from a click (user
 * gesture) — that's a Web Bluetooth requirement, not something we can work
 * around. */
export async function connectPrinter(): Promise<string> {
  if (!isBluetoothSupported()) {
    throw new Error("This browser doesn't support direct Bluetooth printing. Use the Print dialog option instead.");
  }
  const picked = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: KNOWN_PRINTER_SERVICES,
  });
  if (!picked.gatt) throw new Error("This device doesn't support the connection type we need.");
  const server = await picked.gatt.connect();
  const char = await findWritableCharacteristic(server);
  btDevice = picked;
  writeChar = char;
  btDevice.addEventListener("gattserverdisconnected", () => {
    writeChar = null;
  });
  return picked.name || "Bluetooth printer";
}

/** Tries to silently reconnect to a printer this browser already has
 * permission for — so the till doesn't need to re-pick it from a picker
 * every time the POS page loads. No user click needed; only works in
 * browsers that support persisted Bluetooth permissions (Chrome 85+). */
export async function tryAutoReconnect(): Promise<string | null> {
  if (!isBluetoothSupported() || !navigator.bluetooth.getDevices) return null;
  try {
    const known = await navigator.bluetooth.getDevices();
    for (const d of known) {
      if (!d.gatt) continue;
      try {
        const server = await d.gatt.connect();
        const char = await findWritableCharacteristic(server);
        btDevice = d;
        writeChar = char;
        d.addEventListener("gattserverdisconnected", () => {
          writeChar = null;
        });
        return d.name || "Bluetooth printer";
      } catch {
        // try the next previously-granted device, if any
      }
    }
  } catch {
    // getDevices unsupported/blocked — silently skip, admin can connect manually
  }
  return null;
}

export function disconnectPrinter() {
  btDevice?.gatt?.disconnect();
  btDevice = null;
  writeChar = null;
}

// ---------- ESC/POS receipt formatting ----------

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  lineTotal: number;
}

export interface ReceiptData {
  orderNo: string;
  dateTime: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  total: number;
  method: string;
  amountReceived?: number;
  change?: number;
  customerPhone?: string | null;
}

function fmt(n: number): string {
  return "KES " + Math.round(n).toLocaleString("en-KE");
}

function asciiOnly(s: string): string {
  // Thermal printers generally only render a single-byte codepage. Swap the
  // common "smart" punctuation for its plain-ASCII equivalent first (so
  // "Top – Orange" doesn't collapse into "Top  Orange"), then strip
  // anything else non-ASCII (emoji etc.) so a receipt never comes out as
  // garbled boxes.
  return s
    .replace(/[\u2010-\u2015]/g, "-") // hyphen/en/em dash variants
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes
    .replace(/[\u201c\u201d]/g, '"') // curly double quotes
    .replace(/\u2026/g, "...") // ellipsis
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7E]/g, "")
    .trim();
}

function twoCol(left: string, right: string, width: number): string {
  const space = Math.max(1, width - left.length - right.length);
  return left + " ".repeat(space) + right;
}

function wrap(s: string, width: number): string[] {
  if (s.length <= width) return [s];
  const words = s.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > width) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Plain-text receipt lines (used for both the ESC/POS build and, if ever
 * useful, on-screen debugging) — the single source of truth for layout so
 * the Bluetooth print and the print-dialog print never drift apart. */
export function buildReceiptLines(data: ReceiptData, width: number): string[] {
  const lines: string[] = [];
  const rule = "-".repeat(width);

  lines.push("STYLED.KE");
  lines.push("WhatsApp: 0734 807 511");
  lines.push(rule);
  lines.push(`Order: ${data.orderNo}`);
  lines.push(data.dateTime);
  if (data.customerPhone) lines.push(`Customer: ${data.customerPhone}`);
  lines.push(rule);

  for (const item of data.items) {
    for (const l of wrap(asciiOnly(item.name), width)) lines.push(l);
    lines.push(twoCol(`  ${item.qty} x ${fmt(item.price)}`, fmt(item.lineTotal), width));
  }
  lines.push(rule);

  lines.push(twoCol("Subtotal", fmt(data.subtotal), width));
  if (data.discount > 0) lines.push(twoCol("Discount", `-${fmt(data.discount)}`, width));
  lines.push(twoCol("TOTAL", fmt(data.total), width));
  lines.push(twoCol("Payment", data.method.toUpperCase(), width));
  if (data.amountReceived !== undefined) {
    lines.push(twoCol("Received", fmt(data.amountReceived), width));
    lines.push(twoCol("Change", fmt(data.change ?? 0), width));
  }
  lines.push(rule);
  lines.push("Thank you for shopping");
  lines.push("at Styled.ke!");

  return lines;
}

const ESC = 0x1b;
const GS = 0x1d;

function buildEscPosBytes(data: ReceiptData, width: number): Uint8Array {
  const bytes: number[] = [];
  const raw = (...b: number[]) => bytes.push(...b);
  const text = (s: string) => bytes.push(...Array.from(asciiOnly(s)).map((c) => c.charCodeAt(0)));
  const line = (s = "") => {
    text(s);
    raw(0x0a);
  };
  const center = () => raw(ESC, 0x61, 0x01);
  const left = () => raw(ESC, 0x61, 0x00);
  const bold = (on: boolean) => raw(ESC, 0x45, on ? 1 : 0);

  raw(ESC, 0x40); // initialize

  center();
  bold(true);
  line("STYLED.KE");
  bold(false);
  line("WhatsApp: 0734 807 511");
  left();

  const bodyLines = buildReceiptLines(data, width).slice(2); // skip header, already printed above
  const totalLineIdx = bodyLines.findIndex((l) => l.startsWith("TOTAL"));
  bodyLines.forEach((l, i) => {
    if (i === totalLineIdx) bold(true);
    line(l);
    if (i === totalLineIdx) bold(false);
  });

  raw(0x0a, 0x0a, 0x0a);
  raw(GS, 0x56, 0x01); // partial cut — harmlessly ignored by printers with no cutter

  return new Uint8Array(bytes);
}

const CHUNK_SIZE = 180; // conservative write size for typical BLE MTUs

export async function printReceiptViaBluetooth(data: ReceiptData): Promise<void> {
  if (!writeChar) throw new Error("No printer connected.");
  const width = getPaperWidth() === 80 ? 42 : 32;
  const payload = buildEscPosBytes(data, width);
  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    const chunk = payload.slice(i, i + CHUNK_SIZE);
    if (writeChar.properties.writeWithoutResponse) {
      await writeChar.writeValueWithoutResponse(chunk);
    } else {
      await writeChar.writeValue(chunk);
    }
  }
}

// ---------- "Bluetooth Print" companion app (Android) ----------
//
// Xprinter's own integration docs point to a free Android app called
// "Bluetooth Print" (package mate.bluetoothprint, on the Play Store) that
// solves the exact gap Web Bluetooth can't: it's a native app, so it can
// pair over CLASSIC Bluetooth (the mode most of these handheld printers
// actually use) rather than being limited to BLE. The integration is a
// custom URL scheme: a link like
//   my.bluetoothprint.scheme://<RESPONSEURL>
// opens the app, which then fetches <RESPONSEURL> itself and prints
// whatever JSON it gets back. So our job is just: (1) a link the admin
// taps, and (2) a URL that responds with the receipt in their JSON
// format. That's what buildBluetoothPrintAppUrl() + the API route at
// app/api/pos/receipt/route.ts do.
//
// This only makes sense on Android (the app doesn't exist for
// Windows/iOS), so it's offered as an extra option alongside the Web
// Bluetooth / print-dialog paths above, not a replacement for them.

export const BLUETOOTH_PRINT_APP_URL = "https://play.google.com/store/apps/details?id=mate.bluetoothprint";

export function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

export interface BluetoothPrintAppItem {
  type: 0; // text — the only entry type we need for a plain receipt slip
  content: string;
  bold: 0 | 1;
  align: 0 | 1 | 2; // left / center / right
  format: 0 | 1 | 2 | 3 | 4; // normal / double-height / double H+W / double-width / small
}

/** Maps our shared receipt layout onto the "Bluetooth Print" app's JSON
 * schema — same line content as the ESC/POS and print-dialog paths, so all
 * three print outputs stay in sync. */
export function buildBluetoothPrintPayload(data: ReceiptData, width: number): BluetoothPrintAppItem[] {
  const lines = buildReceiptLines(data, width);
  return lines.map((line, i) => {
    const isHeader = i <= 1; // "STYLED.KE" + WhatsApp line
    const isFooter = i >= lines.length - 2; // the two "thank you" lines
    const isTotal = line.startsWith("TOTAL");
    return {
      type: 0,
      content: line.length ? line : " ", // empty content can confuse the app's parser
      bold: isHeader || isTotal ? 1 : 0,
      align: isHeader || isFooter ? 1 : 0,
      format: 0,
    };
  });
}

/** Builds the my.bluetoothprint.scheme:// link. `origin` must be the real
 * publicly-reachable site origin (e.g. https://styled.ke) — the printer
 * app fetches the response URL itself, over the phone's own connection,
 * not through this browser tab, so it can't reach localhost. */
export function buildBluetoothPrintAppUrl(data: ReceiptData, origin: string, paperWidth: 58 | 80): string {
  const json = JSON.stringify(data);
  const b64 =
    typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf-8").toString("base64");
  const b64url = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const responseUrl = `${origin}/api/pos/receipt?d=${b64url}&w=${paperWidth}`;
  return `my.bluetoothprint.scheme://${responseUrl}`;
}
