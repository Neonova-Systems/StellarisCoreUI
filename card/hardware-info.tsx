import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";
import { CreateEntryContent, CreatePanel, playPanelSound } from "../helper";

const HOME_DIR = GLib.get_home_dir();
export default function HardwareInfo() {
    const [cpuName, setcpuName] = createState("");
    const [cpuArchitecture, setcpuArchitecture] = createState("");
    const [vendorName, setvendorName] = createState("");
    const [threadsCore, setthreadsCore] = createState("");
    const [gpuDeviceName, setgpuDeviceName] = createState("");
    const [cpuScaling, setcpuScaling] = createState("");
    const [toggleContentState, settoggleContentState] = createState(false);
    const [sockets, setsockets] = createState("");
    const [gpuVendorName, setgpuVendorName] = createState("");
    const [cpuModes, setcpuModes] = createState("");
    const [cpuMaxMhz, setcpuMaxMhz] = createState("");
    const [cpuMinMhz, setcpuMinMhz] = createState("");
    const [virtualization, setvirtualization] = createState("");
    const [videoUnifiedMemory, setvideoUnifiedMemory] = createState("");
    const [byteOrder, setbyteOrder] = createState("");
    const [motherboard, setMotherboard] = createState("");
    const [biosInfo, setbiosInfo] = createState("");

    execAsync('ags request "getHardwareInfoState"').then(out => settoggleContentState(out === 'true')).catch(() => {});

    function panelClicked() {
        execAsync('ags request "toggleHardwareInfo"').then(out => {
            const isVisible = out === 'true';
            settoggleContentState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        }).catch(() => {});
    }

    // --- CPU Information ---
    execAsync(`dash -c "lscpu | grep 'Model name:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setcpuName(out.toUpperCase()))
    execAsync(`dash -c "lscpu | grep 'Architecture:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setcpuArchitecture(out.toUpperCase()))
    execAsync(`dash -c "lscpu | grep 'Vendor ID:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setvendorName(out.toUpperCase()))
    execAsync(`dash -c "lscpu | \grep -E 'Thread\\(s\\) per core|Core\\(s\\) per socket' | awk -F: '{print $2}' | sed 's/^[ \t]*//' | paste -sd 'x' -"`).then((out) => setthreadsCore(out.toUpperCase()))
    execAsync(`dash -c "lscpu | grep 'Socket(s):' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setsockets(out.toUpperCase()))
    execAsync(`dash -c "lscpu | grep 'CPU(s) scaling MHz:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setcpuScaling(out.toUpperCase())) // BUGFIX: Was incorrectly setting vendorName

    // --- GPU Information ---
    execAsync(`dash -c "glxinfo -B | grep -i 'device:' | awk -F: '{print $2}' | sed 's/(0x[0-9a-fA-F]\\+)//g' | sed 's/^[ \t]*//'"`).then((out) => setgpuDeviceName(out.toUpperCase()))
    execAsync(`dash -c "glxinfo -B | grep -i 'vendor:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setgpuVendorName(out.toUpperCase()))

    // --- Commands for NEWLY FILLED data ---
    execAsync(`dash -c "lscpu | grep 'CPU op-mode(s):' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setcpuModes(out.toUpperCase()))
    execAsync(`dash -c "lscpu | grep 'CPU max MHz:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setcpuMaxMhz(out.toUpperCase()))
    execAsync(`dash -c "lscpu | grep 'CPU min MHz:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setcpuMinMhz(out.toUpperCase()))
    execAsync(`dash -c "lscpu | grep 'Virtualization:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setvirtualization(out.toUpperCase()))
    execAsync(`dash -c "glxinfo -B | grep -i "memory" | awk -F: '{print $2}' | sed 's/^[ \t]*//' | paste -sd \\" \\" -"`).then((out) => setvideoUnifiedMemory(out.toUpperCase())).catch((out) => console.log(out))
    execAsync(`dash -c "lscpu | grep 'Byte Order:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'"`).then((out) => setbyteOrder(out.toUpperCase()))
    execAsync(`dash -c "inxi -M --color=0 | grep 'Mobo' | tr -s ' ' | cut -d ' ' -f 3,5"`).then((out) => setMotherboard(out.toUpperCase()))
    execAsync(`dash -c "inxi -M --max-wrap --color=0 | grep 'UEFI\\|BIOS' | awk '{ sub(\\"K\\", \\"X\\", $5); print $2, $3 }'"`).then((out) => setbiosInfo(out.toUpperCase()))
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="HARDWARE" onClicked={panelClicked}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <box homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU NAME" value={cpuName} />
                                    <CreateEntryContent name="VENDOR NAME" value={vendorName} />
                                    <CreateEntryContent name="THREAD[S]/CORE & CORE[S]/SOCKET" value={threadsCore} />
                                    <CreateEntryContent name="GPU DEVICE NAME" value={gpuDeviceName} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU ARCHITECTURE" value={cpuArchitecture} />
                                    <CreateEntryContent name="CPU SCALING [MHZ]" value={cpuScaling} />
                                    <CreateEntryContent name="SOCKET[S]" value={sockets} />
                                    <CreateEntryContent name="GPU VENDOR NAME" value={gpuVendorName} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU MODES" value={cpuModes} />
                                    <CreateEntryContent name="CPU MAX MHZ" value={cpuMaxMhz} />
                                    <CreateEntryContent name="VIRTUALIZATION" value={virtualization} />
                                    <CreateEntryContent name="VIDEO & UNIFIED MEMORY" value={videoUnifiedMemory} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                    <CreateEntryContent name="BYTE ORDER" value={byteOrder} />
                                    <CreateEntryContent name="CPU MIN MHZ" value={cpuMinMhz} />
                                    <CreateEntryContent name="BIOS/UEFI" value={biosInfo} />
                                    <CreateEntryContent name="MOTHERBOARD" value={motherboard} />
                                </box>
                            </box>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
