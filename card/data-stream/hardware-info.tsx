import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import { CreateEntryContent, CreatePanel, HOME_DIR, updateRollingWindow, TOOLTIP_TEXT_CONTEXT_MENU, panelClicked, Align, ICON_DIR, createBindingCommandTableSetter } from "../../helper";
import { interval, Timer } from 'ags/time';
import CreateGraph from "../../helper/create-graph";
import { initToggleState, openContextMenu, watchRequestBoolean } from "../../helper/behaviour";
import CreateCard from "../../helper/create-card";

export default function HardwareInfo() {
    const [cpuName, setCpuName] = createState("");
    const [avgCpuUsage, setAvgCpuUsage] = createState([0]);
    const [perCpuUsage, setPerCpuUsage] = createState<{ [key: string]: number[] }>({});

    const [cpuArchitecture, setCpuArchitecture] = createState("");
    const [vendorName, setVendorName] = createState("");
    const [threadsCore, setThreadsCore] = createState("");
    const [gpuDeviceName, setGpuDeviceName] = createState("");
    const [cpuScaling, setCpuScaling] = createState("");
    const [toggleContentState, setToggleContentState] = createState(false);
    const [sockets, setSockets] = createState("");
    const [gpuVendorName, setGpuVendorName] = createState("");
    const [cpuModes, setCpuModes] = createState("");
    const [cpuMaxMhz, setCpuMaxMhz] = createState("");
    const [cpuMinMhz, setCpuMinMhz] = createState("");
    const [virtualization, setVirtualization] = createState("");
    const [videoUnifiedMemory, setVideoUnifiedMemory] = createState("");
    const [byteOrder, setByteOrder] = createState("");
    const [motherboard, setMotherboard] = createState("");
    const [biosInfo, setBiosInfo] = createState("");
    const [toggleGraphState, setToggleGraphState] = createState(false);
    
    let avgCpuInterval: Timer | null = null;
    let perCpuInterval: Timer | null = null;

    initToggleState("HardwareInfo", setToggleContentState);
    watchRequestBoolean("HardwareGraph", 800, (enabled) => {
            setToggleGraphState(enabled);
            if (enabled) {
                startIntervals();
            } else {
                stopIntervals();
            }
    });
    
    function startIntervals() {
        if (avgCpuInterval !== null) return; // Already running
        
        avgCpuInterval = interval(1000, () => execAsync(`dash -c "mpstat 1 1 | grep 'Average:' | awk '{print (100 - $NF) / 100}'"`).then((out) => {
            const usage = parseFloat(out);
            setAvgCpuUsage((prev) => updateRollingWindow(prev, usage, 30));
        }));
        
        perCpuInterval = interval(2000, () => execAsync(`dash -c "mpstat -P ALL 1 1 | awk '$2 ~ /^[0-9]+$/ {print $2, (100 - $NF) / 100}' | jq -R '. | split(\\" \\") | { (.[0]): (.[1] | tonumber) }' | jq -s 'add'"`).then((out) => {
            const cpuData = JSON.parse(out);
            setPerCpuUsage((prev) => {
                const updated = { ...prev };
                Object.entries(cpuData).forEach(([cpuNum, usage]) => {
                    const coreIndex = parseInt(cpuNum);
                    const usageValue = usage as number;
                    
                    // Initialize array if this is a new core
                    if (!updated[coreIndex]) {
                        updated[coreIndex] = [];
                    }
                    
                    // Append new value and keep last 20 points
                    updated[coreIndex] = updateRollingWindow(updated[coreIndex], usageValue, 20);
                });
                return updated;
            });
        }));
    }
    
    function stopIntervals() {
        if (avgCpuInterval !== null) {
            avgCpuInterval.cancel();
            avgCpuInterval = null;
        }
        if (perCpuInterval !== null) {
            perCpuInterval.cancel();
            perCpuInterval = null;
        }
    }
    
    function onRightClicked() {
        openContextMenu("hardware-info.tsx");
    }

    createBindingCommandTableSetter({
            [`lscpu | grep 'Model name:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setCpuName,
            [`lscpu | grep 'Architecture:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setCpuArchitecture,
            [`lscpu | grep 'Vendor ID:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setVendorName,
            [`lscpu | grep -E 'Thread\\(s\\) per core|Core\\(s\\) per socket' | awk -F: '{print $2}' | sed 's/^[ \t]*//' | paste -sd 'x' -`]: setThreadsCore,
            [`lscpu | grep 'Socket(s):' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setSockets,
            [`lscpu | grep 'CPU(s) scaling MHz:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setCpuScaling,
            [`glxinfo -B | grep -i 'device:' | awk -F: '{print $2}' | sed 's/(0x[0-9a-fA-F]\\+)//g' | sed 's/^[ \t]*//'`]: setGpuDeviceName,
            [`glxinfo -B | grep -i 'vendor:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setGpuVendorName,
            [`lscpu | grep 'CPU op-mode(s):' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setCpuModes,
            [`lscpu | grep 'CPU max MHz:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setCpuMaxMhz,
            [`lscpu | grep 'CPU min MHz:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setCpuMinMhz,
            [`lscpu | grep 'Virtualization:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setVirtualization,
            [`glxinfo -B | grep -i 'memory' | awk -F: '{print $2}' | sed 's/^[ \t]*//' | paste -sd ' ' -`]: setVideoUnifiedMemory,
            [`lscpu | grep 'Byte Order:' | awk -F: '{print $2}' | sed 's/^[ \t]*//'`]: setByteOrder,
            [`inxi -M --color=0 | grep 'Mobo' | tr -s ' ' | cut -d ' ' -f 3,5`]: setMotherboard,
            [`inxi -M --max-wrap --color=0 | grep 'UEFI\\|BIOS' | awk '{ sub("K", "X", $5); print $2, $3 }'`]: setBiosInfo,
        }, {
            transform: (value) => value.toUpperCase().trim(),
            onError: (_, error) => console.log(error),
        });
    return (
        <CreateCard>
            <CreatePanel name="HARDWARE" onClicked={() => panelClicked("HardwareInfo", setToggleContentState)} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box>
                            <With value={toggleGraphState}>
                                {(v) => (
                                    <box visible={v} orientation={Gtk.Orientation.VERTICAL}>
                                        <box marginStart={7} marginEnd={7} marginTop={10} marginBottom={5}>
                                            <CreateGraph title={"AVERAGE LOAD CPU USAGE"} valueToWatch={avgCpuUsage} threshold={0.7} height={15} lineWidth={0.9}/>
                                        </box>
                                        <box orientation={Gtk.Orientation.HORIZONTAL} marginStart={7} marginEnd={7} >
                                            <With value={perCpuUsage}>
                                                {(cpuData) =>
                                                    <box halign={Align.FILL}>
                                                        {Object.keys(cpuData).sort((a, b) => parseInt(a) - parseInt(b)).map((coreNum) => {
                                                            const coreDataAccessor = cpuData[coreNum] || [0];
                                                            return ( <CreateGraph title={`CPU-CORE ${coreNum}`} valueToWatch={coreDataAccessor} threshold={0.7} fontSize={7} lineWidth={0.9} height={15}/>);
                                                        })}
                                                    </box>
                                                }
                                            </With>
                                        </box>
                                    </box>
                                )}
                            </With>
                        </box>
                        <box cssClasses={["content"]} halign={Align.FILL} valign={Align.LEFT} homogeneous={false} hexpand={false}>
                            <box homogeneous={false} halign={Align.FILL} hexpand={true}>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU NAME" value={cpuName} important allowCopy/>
                                    <CreateEntryContent name="VENDOR NAME" value={vendorName} important allowCopy/>
                                    <CreateEntryContent name="THREAD[S]/CORE & CORE[S]/SOCKET" value={threadsCore} />
                                    <CreateEntryContent name="GPU DEVICE NAME" value={gpuDeviceName} important allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU ARCHITECTURE" value={cpuArchitecture} allowCopy/>
                                    <CreateEntryContent name="CPU SCALING [MHZ]" value={cpuScaling} />
                                    <CreateEntryContent name="SOCKET[S]" value={sockets} />
                                    <CreateEntryContent name="GPU VENDOR NAME" value={gpuVendorName} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="CPU MODES" value={cpuModes} allowCopy/>
                                    <CreateEntryContent name="CPU MAX MHZ" value={cpuMaxMhz} allowCopy/>
                                    <CreateEntryContent name="VIRTUALIZATION" value={virtualization} allowCopy/>
                                    <CreateEntryContent name="VIDEO & UNIFIED MEMORY" value={videoUnifiedMemory} allowCopy/>
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL}>
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
        </CreateCard>
    )
}
