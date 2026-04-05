import { createBinding, createState, With } from "ags";
import { Gtk } from "ags/gtk4";
import { Align, CreateEntryContent, CreatePanel, HOME_DIR, ICON_DIR, TOOLTIP_TEXT_CONTEXT_MENU, createBindingCommandTableSetter, } from "../../helper";
import AstalBattery from "gi://AstalBattery?version=0.1";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";
import { initToggleState, openContextMenu, panelClicked } from '../../helper/behaviour';
import CreateCard from "../../helper/create-card";

export function BatteryInfo() {
    const powerprofiles = AstalPowerProfiles.get_default();
    const activeProfiles = createBinding(powerprofiles, "activeProfile")((value) => value.toUpperCase());
    const powerprofilesVersion = createBinding(powerprofiles, "version")((value) => value.toUpperCase());
    const performanceDegraded = createBinding(powerprofiles, "performanceDegraded")((value) => value.toUpperCase());

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
    const [batteryAware, setBatteryAware] = createState("");
    const [fullReport, setFullReport] = createState("Loading report...");
    const [toggleContentState, setToggleContentState] = createState(false);
    initToggleState("BatteryInfo", setToggleContentState);

    function onRightClicked() {
        openContextMenu("battery-info.tsx");
    }

    const batteryPath = "upower -i $(upower -e | grep BAT)";
    createBindingCommandTableSetter(
        {
            [`${batteryPath} | grep 'native-path' | awk '{print $2}'`]: setNativePath,
            [`${batteryPath} | grep 'has history' | cut -d: -f2 | sed 's/^ *//'`]: setHasHistory,
            [`${batteryPath} | grep 'state' | cut -d: -f2 | sed 's/^ *//'`]: setState,
            [`${batteryPath} | grep 'energy-full:' | cut -d: -f2 | sed 's/^ *//'`]: setEnergyFull,
            [`${batteryPath} | grep 'time to empty:' | cut -d: -f2 | sed 's/^ *//'`]: setTimeToEmpty,
            [`${batteryPath} | grep 'vendor' | awk '{print $2}'`]: setVendor,
            [`${batteryPath} | grep 'has statistics' | cut -d: -f2 | sed 's/^ *//'`]: setHasStatistics,
            [`${batteryPath} | grep 'warning-level' | cut -d: -f2 | sed 's/^ *//'`]: setWarningLevel,
            [`${batteryPath} | grep 'energy-full-design:' | cut -d: -f2 | sed 's/^ *//'`]: setEnergyFullDesign,
            [`${batteryPath} | grep 'percentage:' | cut -d: -f2 | sed 's/^ *//'`]: setPercentage,
            [`${batteryPath} | grep 'power supply' | awk '{print $3}'`]: setPowerSupply,
            [`${batteryPath} | grep 'present' | cut -d: -f2 | sed 's/^ *//'`]: setPresent,
            [`${batteryPath} | grep 'energy:' | cut -d: -f2 | sed 's/^ *//'`]: setEnergy,
            [`${batteryPath} | grep 'energy-rate:' | cut -d: -f2 | sed 's/^ *//'`]: setEnergyRate,
            [`${batteryPath} | grep 'capacity:' | cut -d: -f2 | sed 's/^ *//'`]: setCapacity,
            [`${batteryPath} | grep 'updated' | awk '{print $2, $3, $4, $5, $6, $7, $8}'`]: setUpdated,
            [`${batteryPath} | grep 'rechargeable' | cut -d: -f2 | sed 's/^ *//'`]: setRechargeable,
            [`${batteryPath} | grep 'energy-empty:' | cut -d: -f2 | sed 's/^ *//'`]: setEnergyEmpty,
            [`${batteryPath} | grep 'voltage:' | cut -d: -f2 | sed 's/^ *//'`]: setVoltage,
            [`${batteryPath} | grep 'technology:' | cut -d: -f2 | sed 's/^ *//'`]: setTechnology,
            [`powerprofilesctl query-battery-aware | cut -d: -f2 | tr -d ' '`]: setBatteryAware,
        },
        {
            transform: (value) => value.toUpperCase().trim(),
        },
    );

    createBindingCommandTableSetter({
        [batteryPath]: setFullReport,
    });

    function renderContent() {
        return (
        <box cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
            <box cssClasses={["content"]} halign={Align.FILL} valign={Align.LEFT} homogeneous={false} hexpand={false}>
                <box homogeneous={false} halign={Align.FILL} hexpand={true}>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                        <CreateEntryContent name="NATIVE PATH" value={nativePath} allowCopy/>
                        <CreateEntryContent name="HAS HISTORY" value={hasHistory} />
                        <CreateEntryContent name="STATE" value={state} />
                        <CreateEntryContent name="ENERGY-FULL" value={energyFull} />
                        <CreateEntryContent name="TIME-TO-EMPTY" value={timeToEmpty} />
                        <CreateEntryContent name="ACTIVE PROFILE" value={activeProfiles} allowCopy/>
                    </box>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                        <CreateEntryContent name="VENDOR" value={vendor} allowCopy/>
                        <CreateEntryContent name="HAS STATISTICS" value={hasStatistics} />
                        <CreateEntryContent name="WARNING LEVEL" value={warningLevel} />
                        <CreateEntryContent name="ENERGY-FULL-DESIGN" value={energyFullDesign} allowCopy/>
                        <CreateEntryContent name="PERCENTAGE" value={percentage} />
                        <CreateEntryContent name="PERFORMANCE DEGRADED" value={performanceDegraded} />
                    </box>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand={true}>
                        <CreateEntryContent name="POWER SUPPLY" value={powerSupply} />
                        <CreateEntryContent name="PRESENT" value={present} />
                        <CreateEntryContent name="ENERGY" value={energy} />
                        <CreateEntryContent name="ENERGY-RATE" value={energyRate} />
                        <CreateEntryContent name="CAPACITY" value={capacity} />
                        <CreateEntryContent name="POWERPROFILE VERSION" value={powerprofilesVersion} />
                    </box>
                    <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL}>
                        <CreateEntryContent name="UPDATED" value={updated} allowCopy/>
                        <CreateEntryContent name="RECHARGEABLE" value={rechargeable} />
                        <CreateEntryContent name="ENERGY-EMPTY" value={energyEmpty} />
                        <CreateEntryContent name="VOLTAGE" value={voltage} allowCopy/>
                        <CreateEntryContent name="TECHNOLOGY" value={technology} allowCopy/>
                        <CreateEntryContent name="BATTERY AWARE" value={batteryAware} />
                    </box>
                </box>
            </box>
            <box cssClasses={["extended-content"]} hexpand={false} halign={Align.FILL}>
                <scrolledwindow minContentWidth={100} minContentHeight={55} hexpand={true}>
                    <box valign={Align.LEFT} homogeneous={false} spacing={20}>
                        <label label={fullReport} valign={Align.LEFT} halign={Align.LEFT} />
                    </box>
                </scrolledwindow>
            </box>
        </box>
        )
    }
    return (
        <CreateCard state={toggleContentState} cardContent={() => renderContent()}>
            <CreatePanel name="BATTERY" onClicked={() => panelClicked("BatteryInfo", setToggleContentState)} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
        </CreateCard>
    )
}

export function BatteryRibbon() {
    const battery = AstalBattery.get_default();
    const percentage = createBinding(battery, "percentage")
    const status = createBinding(battery, "charging")((v) => v ? "CHARGING" : "DISCHARGING")
    return ( <box cssClasses={["battery"]} spacing={10} homogeneous={false} visible={createBinding(battery, "isPresent")} hexpand={false}>
        <box cssClasses={["special-entry"]} spacing={2}>
            <label label="CURRENT BATTERY:" halign={Align.LEFT} />
            <With value={percentage}>
                {(v) => ( <label cssClasses={["value"]} label={`${Math.floor(v * 100)}%`} halign={Align.LEFT} />)}
            </With>
        </box>
        <levelbar value={percentage} hexpand />
        <box spacing={5}>
            <box cssClasses={["special-entry"]} spacing={2} valign={Align.RIGHT}>
                <label label="BATTERY STATUS:" halign={Align.LEFT} />
                <label cssClasses={["value"]} label={status} halign={Align.LEFT} />
            </box>
            <box css={'min-width: 3px;'} />
            <box cssClasses={["blinking-square"]} />
        </box>
    </box>)
}
