import { createState, With } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";
import { CreateEntryContent, CreatePanel, playPanelSound } from "../helper";

const HOME_DIR = GLib.get_home_dir();

export default function BatteryInfo() {
    // --- State for each piece of battery information ---
    const [nativePath, setNativePath] = createState("");
    const [hasHistory, setHasHistory] = createState("");
    const [state, setState] = createState("");
    const [energyFull, setEnergyFull] = createState("");
    const [timeToEmpty, setTimeToEmpty] = createState("");
    const [vendor, setVendor] = createState("");
    const [hasStatistics, setHasStatistics] = createState("");
    const [warningLevel, setWarningLevel] = createState("");
    const [energyFullDesign, setEnergyFullDesign] = createState("");
    const [percentage, setPercentage] = createState("");
    const [powerSupply, setPowerSupply] = createState("");
    const [present, setPresent] = createState("");
    const [energy, setEnergy] = createState("");
    const [energyRate, setEnergyRate] = createState("");
    const [capacity, setCapacity] = createState("");
    const [updated, setUpdated] = createState("");
    const [rechargeable, setRechargeable] = createState("");
    const [energyEmpty, setEnergyEmpty] = createState("");
    const [voltage, setVoltage] = createState("");
    const [technology, setTechnology] = createState("");
    const [fullReport, setFullReport] = createState("Loading report...");

    const [toggleContentState, setToggleContentState] = createState(false);

    function panelClicked() {
        const currentState = toggleContentState.get();
        setToggleContentState(!currentState);
        if (!currentState) {
            playPanelSound(500);
        }
    }

    // --- Correctly assign output to the corresponding state variable ---
    const batteryPath = "upower -i $(upower -e | grep BAT)";

    execAsync(`dash -c "${batteryPath} | grep 'native-path' | awk '{print $2}'"`).then(out => setNativePath(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'has history' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setHasHistory(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'state' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setState(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'energy-full:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setEnergyFull(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'time to empty:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setTimeToEmpty(out.toUpperCase()));

    execAsync(`dash -c "${batteryPath} | grep 'vendor' | awk '{print $2}'"`).then(out => setVendor(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'has statistics' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setHasStatistics(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'warning-level' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setWarningLevel(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'energy-full-design:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setEnergyFullDesign(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'percentage:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setPercentage(out.toUpperCase()));

    execAsync(`dash -c "${batteryPath} | grep 'power supply' | awk '{print $3}'"`).then(out => setPowerSupply(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'present' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setPresent(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'energy:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setEnergy(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'energy-rate:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setEnergyRate(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'capacity:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setCapacity(out.toUpperCase()));

    execAsync(`dash -c "${batteryPath} | grep 'updated' | awk '{print $2, $3, $4, $5, $6, $7, $8}'"`).then(out => setUpdated(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'rechargeable' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setRechargeable(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'energy-empty:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setEnergyEmpty(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'voltage:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setVoltage(out.toUpperCase()));
    execAsync(`dash -c "${batteryPath} | grep 'technology:' | cut -d: -f2 | sed 's/^ *//'"`).then(out => setTechnology(out.toUpperCase()));

    execAsync(`dash -c "${batteryPath}"`).then(out => setFullReport(out));
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <Gtk.GestureLongPress />
            <CreatePanel name="BATTERY" onClicked={panelClicked}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <box homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
                                {/* --- Corrected state variables for each value --- */}
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="NATIVE PATH" value={nativePath} />
                                    <CreateEntryContent name="HAS HISTORY" value={hasHistory} />
                                    <CreateEntryContent name="STATE" value={state} />
                                    <CreateEntryContent name="ENERGY-FULL" value={energyFull} />
                                    <CreateEntryContent name="TIME-TO-EMPTY" value={timeToEmpty} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="VENDOR" value={vendor} />
                                    <CreateEntryContent name="HAS STATISTICS" value={hasStatistics} />
                                    <CreateEntryContent name="WARNING LEVEL" value={warningLevel} />
                                    <CreateEntryContent name="ENERGY-FULL-DESIGN" value={energyFullDesign} />
                                    <CreateEntryContent name="PERCENTAGE" value={percentage} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                    <CreateEntryContent name="POWER SUPPLY" value={powerSupply} />
                                    <CreateEntryContent name="PRESENT" value={present} />
                                    <CreateEntryContent name="ENERGY" value={energy} />
                                    <CreateEntryContent name="ENERGY-RATE" value={energyRate} />
                                    <CreateEntryContent name="CAPACITY" value={capacity} />
                                </box>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                    <CreateEntryContent name="UPDATED" value={updated} />
                                    <CreateEntryContent name="RECHARGEABLE" value={rechargeable} />
                                    <CreateEntryContent name="ENERGY-EMPTY" value={energyEmpty} />
                                    <CreateEntryContent name="VOLTAGE" value={voltage} />
                                    <CreateEntryContent name="TECHNOLOGY" value={technology} />
                                </box>
                            </box>
                        </box>
                        <box cssClasses={["extended-content"]} hexpand={false} halign={Gtk.Align.FILL}>
                            <scrolledwindow minContentWidth={100} minContentHeight={55} hexpand={true}>
                                <box valign={Gtk.Align.START} homogeneous={false} spacing={20}>
                                    <label label={fullReport} valign={Gtk.Align.START} halign={Gtk.Align.START} />
                                </box>
                            </scrolledwindow>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}
