import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import { CreateEntryContent, CreatePanel, playPanelSound, HOME_DIR } from "../../helper";
import { timeout } from "ags/time";

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

    timeout(500, () => { execAsync('ags request "getHardwareInfoState"').then(out => settoggleContentState(out === 'true')) });

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
                            <drawingarea marginStart={10} marginEnd={10} marginTop={10} marginBottom={5} halign={Gtk.Align.FILL} hexpand $={(self) => {
                                self.set_size_request(50, 50); // Set explicit size request to ensure the drawing area is visible
                                self.set_draw_func((area, cr, width, height) => {
                                    
                                    // Sample data points for the chart
                                    const dataPoints = [0.3, 0.5, 0.7, 0.6, 0.8, 0.9, 0.7, 0.5, 0.6, 0.8];
                                    const padding = 10;
                                    const chartWidth = width - (padding * 2);
                                    const chartHeight = height - (padding * 2);
                                    const segmentWidth = chartWidth / (dataPoints.length - 1);
                                    
                                    
                                    // Draw blue chart line
                                    cr.setSourceRGBA(0.3, 0.6, 1.0, 1.0); // Blue
                                    cr.setLineWidth(2);
                                    cr.moveTo(padding, padding + chartHeight * (1 - dataPoints[0]));
                                    
                                    for (let i = 1; i < dataPoints.length; i++) {
                                        const x = padding + segmentWidth * i;
                                        const y = padding + chartHeight * (1 - dataPoints[i]);
                                        cr.lineTo(x, y);
                                    }
                                    cr.stroke();
                                    
                                    // Fill area under the chart with gradient effect
                                    cr.setSourceRGBA(0.3, 0.6, 1.0, 1);
                                    cr.lineTo(width - padding, height - padding);
                                    cr.lineTo(padding, height - padding);
                                    cr.closePath();
                                    cr.fill();
                                });
                            }} />
                        <box cssClasses={["content"]} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <box homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU NAME" value={cpuName} allowCopy/>
                                    <CreateEntryContent name="VENDOR NAME" value={vendorName} allowCopy/>
                                    <CreateEntryContent name="THREAD[S]/CORE & CORE[S]/SOCKET" value={threadsCore} />
                                    <CreateEntryContent name="GPU DEVICE NAME" value={gpuDeviceName} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU ARCHITECTURE" value={cpuArchitecture} allowCopy/>
                                    <CreateEntryContent name="CPU SCALING [MHZ]" value={cpuScaling} />
                                    <CreateEntryContent name="SOCKET[S]" value={sockets} />
                                    <CreateEntryContent name="GPU VENDOR NAME" value={gpuVendorName} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU MODES" value={cpuModes} allowCopy/>
                                    <CreateEntryContent name="CPU MAX MHZ" value={cpuMaxMhz} allowCopy/>
                                    <CreateEntryContent name="VIRTUALIZATION" value={virtualization} allowCopy/>
                                    <CreateEntryContent name="VIDEO & UNIFIED MEMORY" value={videoUnifiedMemory} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                    <CreateEntryContent name="BYTE ORDER" value={byteOrder} allowCopy/>
                                    <CreateEntryContent name="CPU MIN MHZ" value={cpuMinMhz} />
                                    <CreateEntryContent name="BIOS/UEFI" value={biosInfo} allowCopy/>
                                    <CreateEntryContent name="MOTHERBOARD" value={motherboard} allowCopy/>
                                </box>
                            </box>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
